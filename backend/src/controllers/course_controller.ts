import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Course, Lesson } from "../models/courses";
import { Module } from "../models/courses";
import validator from "validator";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

const courseRepository = AppDataSource.getRepository(Course);
const moduleRepository = AppDataSource.getRepository(Module);

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, ageGroup, tags, learningObjectives, modules } =
      JSON.parse(req.body.data);

    // Validation
    if (!title || !description || !ageGroup) {
      return res.status(400).json({
        success: false,
        message: "Title, description and age group are required",
      });
    }

    if (!["10-12", "13-15", "16-18"].includes(ageGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid age group",
      });
    }

    let thumbnailUrl = "";

    if (req.file) {
      thumbnailUrl = await uploadToCloudinary(req.file);
    } else {
      return res.status(400).json({
        success: false,
        message: "Thumbnail is required",
      });
    }

    // Start transaction for course, modules, and lessons
    const result = await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        // Create course
        const course = new Course();
        course.title = title;
        course.description = description;
        course.ageGroup = ageGroup;
        course.tags = tags || [];
        course.learningObjectives = learningObjectives || [];
        course.thumbnailUrl = thumbnailUrl;
        course.isApproved = true;

        const savedCourse = await transactionalEntityManager.save(course);

        // Create modules and lessons if provided
        if (modules && Array.isArray(modules)) {
          for (const moduleData of modules) {
            const module = new Module();
            module.title = moduleData.title;
            module.description = moduleData.description || "";
            module.order = moduleData.order || 0;
            module.course = savedCourse;

            const savedModule = await transactionalEntityManager.save(module);

            if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
              for (const lessonData of moduleData.lessons) {
                const lesson = new Lesson();
                lesson.title = lessonData.title;
                lesson.description = lessonData.description || "";
                lesson.type = lessonData.type || "reading";
                lesson.order = lessonData.order || 0;
                lesson.durationMinutes = lessonData.durationMinutes || 0;
                lesson.module = savedModule;

                // Set type-specific fields
                switch (lesson.type) {
                  case "video":
                    lesson.videoUrl = lessonData.videoUrl || "";
                    break;
                  case "quiz":
                    lesson.quiz = lessonData.quiz || { questions: [] };
                    break;
                  case "activity":
                    lesson.activity = lessonData.activity || {
                      instructions: "",
                    };
                    break;
                  case "reading":
                    lesson.readingContent = lessonData.content || "";
                    break;
                }

                await transactionalEntityManager.save(lesson);
              }
            }
          }
        }

        // Return the complete course with relations
        return await transactionalEntityManager.findOne(Course, {
          where: { id: savedCourse.id },
          relations: ["modules", "modules.lessons"],
        });
      }
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, ageGroup, tags, learningObjectives, modules } =
      JSON.parse(req.body.data);
    console.log(title, modules);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Start transaction for course, modules, and lessons
    const result = await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        // Find existing course
        const course = await transactionalEntityManager.findOne(Course, {
          where: { id },
          relations: ["modules", "modules.lessons"],
        });

        if (!course) {
          throw new Error("Course not found");
        }

        // Handle thumbnail update if new file provided
        if (req.file) {
          course.thumbnailUrl = await uploadToCloudinary(req.file);
        }

        // Update course fields
        course.title = title || course.title;
        course.description = description || course.description;
        course.ageGroup = ageGroup || course.ageGroup;
        course.tags = tags || course.tags;
        course.learningObjectives =
          learningObjectives || course.learningObjectives;

        const updatedCourse = await transactionalEntityManager.save(course);

        // Handle modules and lessons updates
        if (modules && Array.isArray(modules)) {
          // First collect all existing module and lesson IDs for cleanup
          const existingModuleIds = course.modules.map((m) => m.id);
          const existingLessonIds = course.modules.flatMap((m) =>
            m.lessons ? m.lessons.map((l) => l.id) : []
          );

          // Process each module from request
          for (const moduleData of modules) {
            let module: any;
            if (moduleData.id) {
              // Update existing module
              module = await transactionalEntityManager.findOne(Module, {
                where: { id: moduleData.id },
              });
              if (!module) {
                continue; // Skip if module not found
              }

              // Remove from existing IDs array
              const index = existingModuleIds.indexOf(moduleData.id);
              if (index > -1) {
                existingModuleIds.splice(index, 1);
              }
            } else {
              // Create new module
              module = new Module();
              module.course = updatedCourse;
            }

            module.title = moduleData.title || module.title;
            module.description = moduleData.description || module.description;
            module.order = moduleData.order || module.order || 0;

            const savedModule = await transactionalEntityManager.save(module);

            // Process lessons for this module
            if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
              for (const lessonData of moduleData.lessons) {
                let lesson: any;
                if (lessonData.id) {
                  // Update existing lesson
                  lesson = await transactionalEntityManager.findOne(Lesson, {
                    where: { id: lessonData.id },
                  });
                  if (!lesson) {
                    continue;
                  }

                  // Remove from existing IDs array
                  const index = existingLessonIds.indexOf(lessonData.id);
                  if (index > -1) {
                    existingLessonIds.splice(index, 1);
                  }
                } else {
                  // Create new lesson
                  lesson = new Lesson();
                  lesson.module = savedModule;
                }

                lesson.title = lessonData.title || lesson.title;
                lesson.description =
                  lessonData.description || lesson.description;
                lesson.type = lessonData.type || lesson.type || "reading";
                lesson.order = lessonData.order || lesson.order || 0;
                lesson.durationMinutes =
                  lessonData.durationMinutes || lesson.durationMinutes || 0;

                // Update type-specific fields
                switch (lesson.type) {
                  case "video":
                    lesson.videoUrl =
                      lessonData.videoUrl || lesson.videoUrl || "";
                    break;
                  case "quiz":
                    lesson.quiz = lessonData.quiz ||
                      lesson.quiz || { questions: [] };
                    break;
                  case "activity":
                    lesson.activity = lessonData.activity ||
                      lesson.activity || { instructions: "" };
                    break;
                  case "reading":
                    lesson.readingContent =
                      lessonData.content || lesson.readingContent || "";
                    break;
                }

                await transactionalEntityManager.save(lesson);
              }
            }
          }

          // Delete any remaining modules and lessons that weren't in the request
          if (existingLessonIds.length > 0) {
            await transactionalEntityManager.delete(Lesson, existingLessonIds);
          }
          if (existingModuleIds.length > 0) {
            await transactionalEntityManager.delete(Module, existingModuleIds);
          }
        }

        // Return the complete updated course
        return await transactionalEntityManager.findOne(Course, {
          where: { id: updatedCourse.id },
          relations: ["modules", "modules.lessons"],
        });
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await courseRepository.findOne({
      where: { id },
      relations: ["modules"],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Soft delete (if your entity supports it)
    await courseRepository.softRemove(course);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const course = await courseRepository.findOne({
      where: { id },
      relations: ["modules", "modules.lessons"],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const listCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ageGroup, search, tags } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query = courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.modules", "module")
      .leftJoinAndSelect("module.lessons", "lesson")
      .where("course.isApproved = :isApproved", { isApproved: true });

    if (ageGroup) {
      query.andWhere("course.ageGroup = :ageGroup", { ageGroup });
    }

    if (search) {
      query.andWhere(
        "(course.title LIKE :search OR course.description LIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    if (tags) {
      const tagArray = (tags as string).split(",");
      query.andWhere("course.tags && :tags", { tags: tagArray });
    }

    // Add ordering if needed (e.g., newest first)
    query
      .orderBy("course.createdAt", "DESC")
      .addOrderBy("module.order", "ASC")
      .addOrderBy("lesson.order", "ASC");

    const [courses, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    res.status(200).json({
      success: true,
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
export const approveCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const course = await courseRepository.findOne({ where: { id } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Course is already approved",
      });
    }

    await courseRepository.update(id, { isApproved: true });

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const module = new Module();
    module.title = title;
    module.description = description;
    module.order = order || 0;
    module.course = course;

    await moduleRepository.save(module);

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    next(error);
  }
};
export const updateModuleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { modules } = req.body; // Array of { id, order }

    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module order data",
      });
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (const mod of modules) {
        await transactionalEntityManager.update(Module, mod.id, {
          order: mod.order,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Module order updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
const lessonRepository = AppDataSource.getRepository(Lesson);

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      description,
      type,
      order,
      videoUrl,
      quiz,
      activity,
      readingContent,
      durationMinutes = 0,
    } = req.body;
    if (
      !["video", "interactive", "quiz", "reading", "activity"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson type",
      });
    }

    if (type === "video" && (!videoUrl || !validator.isURL(videoUrl))) {
      return res.status(400).json({
        success: false,
        message: "Valid video URL is required for video lessons",
      });
    }

    if (type === "quiz" && (!quiz || !Array.isArray(quiz.questions))) {
      return res.status(400).json({
        success: false,
        message: "Valid quiz structure is required for quiz lessons",
      });
    }

    const module = await moduleRepository.findOne({
      where: { id: moduleId },
      relations: ["course"],
    });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const lesson = new Lesson();
    lesson.title = title;
    lesson.description = description;
    lesson.type = type;
    lesson.order = order || 0;
    lesson.durationMinutes = durationMinutes;
    lesson.module = module;

    switch (type) {
      case "video":
        lesson.videoUrl = videoUrl;
        break;
      case "quiz":
        lesson.quiz = quiz;
        break;
      case "activity":
        lesson.activity = activity;
        break;
      case "reading":
        lesson.readingContent = readingContent;
        break;
    }

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLessonVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonId } = req.params;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    const videoUrl = `/uploads/lessons/${lessonId}/${videoFile.filename}`;

    await lessonRepository.update(lessonId, {
      videoUrl,
      type: "video",
    });

    res.status(200).json({
      success: true,
      data: { videoUrl },
    });
  } catch (error) {
    next(error);
  }
};
