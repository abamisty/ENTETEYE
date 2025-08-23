import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { Course, LearningPath, LearningSegment } from "../models/courses";
import { User, UserRole } from "../models/user";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { Character } from "../models/character";
import { PathProgress, SegmentProgress } from "../models/enrollment";

const courseRepository = AppDataSource.getRepository(Course);
const learningPathRepository = AppDataSource.getRepository(LearningPath);
const learningSegmentRepository = AppDataSource.getRepository(LearningSegment);
const characterRepository = AppDataSource.getRepository(Character);
const userRepository = AppDataSource.getRepository(User);
const segmentProgressRepository = AppDataSource.getRepository(SegmentProgress);
const pathProgressRepository = AppDataSource.getRepository(PathProgress);

const safeJsonParse = (jsonString: string | any, fallback: any = null) => {
  if (typeof jsonString === "object") {
    return jsonString;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("JSON parse error:", error);
    return fallback;
  }
};

// Helper function to validate segment content
const validateSegmentContent = (type: string, content: any): boolean => {
  if (!content) return false;

  switch (type) {
    case "instruction":
    case "review":
      return content.instruction && content.instruction.text;

    case "question":
      if (!content.question || !content.question.text) return false;

      const questionType = content.question.type;
      if (questionType === "multiple-choice") {
        return (
          content.question.options &&
          Array.isArray(content.question.options) &&
          content.question.options.length >= 2 &&
          content.question.options.some((opt: any) => opt.isCorrect)
        );
      } else if (
        questionType === "true-false" ||
        questionType === "fill-blank"
      ) {
        return content.question.correctAnswer !== undefined;
      }
      return true;

    case "dialogue":
      return (
        content.dialogue &&
        content.dialogue.characters &&
        Array.isArray(content.dialogue.characters) &&
        content.dialogue.characters.length > 0 &&
        content.dialogue.characters.every(
          (char: any) => char.characterId && char.lines && char.lines.length > 0
        )
      );

    case "practice":
      return content.practice && content.practice.instructions;

    default:
      return true;
  }
};

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      tags,
      ageGroup,
      learningObjectives,
      isCustom = false,
      customRequestId,
      featuredCharacterIds = [],
      learningPaths = [],
    } = req.body;

    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOneBy({ id: userId });
    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can create courses",
      });
    }

    // Validate required fields
    if (!title || !description || !ageGroup || !learningObjectives?.length) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, ageGroup and learningObjectives are required",
      });
    }

    if (!["10-12", "13-15", "16-18"].includes(ageGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid age group",
      });
    }

    // Handle thumbnail upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail is required",
      });
    }

    const thumbnailUrl = await uploadToCloudinary(req.file);

    // Create course
    const course = new Course();
    course.title = title;
    course.description = description;
    course.tags = safeJsonParse(tags, []);
    course.ageGroup = ageGroup;
    course.learningObjectives = safeJsonParse(learningObjectives, []);
    course.isCustom = isCustom;
    course.customRequestId = customRequestId;
    course.thumbnailUrl = thumbnailUrl;

    // Save course first
    const savedCourse = await courseRepository.save(course);

    // Associate featured characters if provided
    if (featuredCharacterIds && featuredCharacterIds.length > 0) {
      const parsedCharacterIds = safeJsonParse(featuredCharacterIds, []);
      if (parsedCharacterIds.length > 0) {
        const characters = await characterRepository.findByIds(
          parsedCharacterIds
        );
        if (characters.length > 0) {
          savedCourse.featuredCharacters = characters;
          await courseRepository.save(savedCourse);
        }
      }
    }

    // Create learning paths and segments if provided
    if (learningPaths && learningPaths.length > 0) {
      const parsedLearningPaths = safeJsonParse(learningPaths, []);

      for (const pathData of parsedLearningPaths) {
        if (!pathData.title) continue;

        const learningPath = new LearningPath();
        learningPath.title = pathData.title;
        learningPath.description = pathData.description || null;
        learningPath.order = parseInt(pathData.order) || 1;
        learningPath.course = savedCourse;

        const savedPath = await learningPathRepository.save(learningPath);

        // Create segments for this path
        if (pathData.segments && pathData.segments.length > 0) {
          for (const segmentData of pathData.segments) {
            try {
              const segment = new LearningSegment();
              segment.type = segmentData.type || "instruction";
              segment.order = parseInt(segmentData.order) || 1;
              segment.basePoints = parseInt(segmentData.basePoints) || 0;
              segment.bonusPoints = segmentData.bonusPoints
                ? parseInt(segmentData.bonusPoints)
                : undefined;
              segment.learningPath = savedPath;

              // Handle content based on segment type
              let segmentContent = null;
              if (segmentData.content) {
                // Parse content if it's a string
                const parsedContent = safeJsonParse(
                  segmentData.content,
                  segmentData.content
                );

                // Validate and structure content based on segment type
                if (validateSegmentContent(segment.type, parsedContent)) {
                  segmentContent = parsedContent;
                } else {
                  console.warn(
                    `Invalid content for segment type ${segment.type}:`,
                    parsedContent
                  );
                  // Provide default content structure
                  switch (segment.type) {
                    case "instruction":
                    case "review":
                      segmentContent = {
                        instruction: {
                          text: parsedContent?.instruction?.text || "",
                          mediaUrl:
                            parsedContent?.instruction?.mediaUrl || null,
                          mediaType:
                            parsedContent?.instruction?.mediaType || "image",
                        },
                      };
                      break;
                    case "question":
                      segmentContent = {
                        question: {
                          text: parsedContent?.question?.text || "",
                          type:
                            parsedContent?.question?.type || "multiple-choice",
                          options: parsedContent?.question?.options || [],
                          correctAnswer:
                            parsedContent?.question?.correctAnswer || null,
                          explanation:
                            parsedContent?.question?.explanation || null,
                        },
                      };
                      break;
                    case "dialogue":
                      segmentContent = {
                        dialogue: {
                          characters: parsedContent?.dialogue?.characters || [],
                          backgroundScene:
                            parsedContent?.dialogue?.backgroundScene || null,
                          audioUrl: parsedContent?.dialogue?.audioUrl || null,
                        },
                      };
                      break;
                    case "practice":
                      segmentContent = {
                        practice: {
                          type: parsedContent?.practice?.type || "drag-drop",
                          instructions:
                            parsedContent?.practice?.instructions || "",
                          components: parsedContent?.practice?.components || {},
                        },
                      };
                      break;
                    default:
                      segmentContent = parsedContent;
                  }
                }
              }

              segment.content = segmentContent;
              await learningSegmentRepository.save(segment);
            } catch (segmentError) {
              console.error(`Error creating segment:`, segmentError);
              // Continue with other segments instead of failing the entire course creation
            }
          }
        }
      }
    }

    // Fetch the complete course with all relations
    const completeCourse = await courseRepository.findOne({
      where: { id: savedCourse.id },
      relations: [
        "learningPaths",
        "learningPaths.segments",
        "featuredCharacters",
      ],
      order: {
        learningPaths: { order: "ASC" },
      },
    });

    res.status(201).json({
      success: true,
      data: completeCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
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
    const updates = req.body;

    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOneBy({ id: userId });
    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can update courses",
      });
    }

    const course = await courseRepository.findOne({
      where: { id },
      relations: [
        "learningPaths",
        "learningPaths.segments",
        "featuredCharacters",
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (req.file) {
      course.thumbnailUrl = await uploadToCloudinary(req.file);
    }

    // Update basic course fields
    if (updates.title !== undefined) course.title = updates.title;
    if (updates.description !== undefined)
      course.description = updates.description;
    if (updates.tags !== undefined) {
      course.tags = safeJsonParse(updates.tags, []);
    }
    if (updates.ageGroup !== undefined) course.ageGroup = updates.ageGroup;
    if (updates.learningObjectives !== undefined) {
      course.learningObjectives = safeJsonParse(updates.learningObjectives, []);
    }
    if (updates.isCustom !== undefined) course.isCustom = updates.isCustom;
    if (updates.customRequestId !== undefined)
      course.customRequestId = updates.customRequestId;

    // Update featured characters if provided
    if (updates.featuredCharacterIds !== undefined) {
      const parsedCharacterIds = safeJsonParse(
        updates.featuredCharacterIds,
        []
      );
      if (parsedCharacterIds.length > 0) {
        const characters = await characterRepository.findByIds(
          parsedCharacterIds
        );
        course.featuredCharacters = characters;
      } else {
        course.featuredCharacters = [];
      }
    }

    // Save course updates first
    await courseRepository.save(course);

    // Handle learning paths updates if provided
    if (updates.learningPaths !== undefined) {
      const parsedLearningPaths = safeJsonParse(updates.learningPaths, []);

      // Remove existing paths and segments with proper cleanup
      for (const existingPath of course.learningPaths) {
        // First delete all segment progress records for segments in this path
        const segments = await learningSegmentRepository.find({
          where: { learningPath: { id: existingPath.id } },
          relations: ["progressRecords"],
        });

        for (const segment of segments) {
          // Delete all progress records for this segment
          await segmentProgressRepository.delete({
            segment: { id: segment.id },
          });
        }

        // Then delete all path progress records for this path
        await pathProgressRepository.delete({
          learningPath: { id: existingPath.id },
        });

        // Then remove all segments in this path
        await learningSegmentRepository.delete({
          learningPath: { id: existingPath.id },
        });

        // Finally remove the path
        await learningPathRepository.delete(existingPath.id);
      }

      // Create new paths and segments
      for (const pathData of parsedLearningPaths) {
        if (!pathData.title) continue;

        const learningPath = new LearningPath();
        learningPath.title = pathData.title;
        learningPath.description = pathData.description || null;
        learningPath.order = parseInt(pathData.order) || 1;
        learningPath.course = course;

        const savedPath = await learningPathRepository.save(learningPath);

        if (pathData.segments && pathData.segments.length > 0) {
          for (const segmentData of pathData.segments) {
            try {
              const segment = new LearningSegment();
              segment.type = segmentData.type || "instruction";
              segment.order = parseInt(segmentData.order) || 1;
              segment.basePoints = parseInt(segmentData.basePoints) || 0;
              segment.bonusPoints = segmentData.bonusPoints
                ? parseInt(segmentData.bonusPoints)
                : undefined;
              segment.learningPath = savedPath;

              let segmentContent = null;
              if (segmentData.content) {
                const parsedContent = safeJsonParse(
                  segmentData.content,
                  segmentData.content
                );

                if (validateSegmentContent(segment.type, parsedContent)) {
                  segmentContent = parsedContent;
                } else {
                  console.warn(
                    `Invalid content for segment type ${segment.type}:`,
                    parsedContent
                  );
                  // Provide default content structure
                  switch (segment.type) {
                    case "instruction":
                    case "review":
                      segmentContent = {
                        instruction: {
                          text: parsedContent?.instruction?.text || "",
                          mediaUrl:
                            parsedContent?.instruction?.mediaUrl || null,
                          mediaType:
                            parsedContent?.instruction?.mediaType || "image",
                        },
                      };
                      break;
                    case "question":
                      segmentContent = {
                        question: {
                          text: parsedContent?.question?.text || "",
                          type:
                            parsedContent?.question?.type || "multiple-choice",
                          options: parsedContent?.question?.options || [],
                          correctAnswer:
                            parsedContent?.question?.correctAnswer || null,
                          explanation:
                            parsedContent?.question?.explanation || null,
                        },
                      };
                      break;
                    case "dialogue":
                      segmentContent = {
                        dialogue: {
                          characters: parsedContent?.dialogue?.characters || [],
                          backgroundScene:
                            parsedContent?.dialogue?.backgroundScene || null,
                          audioUrl: parsedContent?.dialogue?.audioUrl || null,
                        },
                      };
                      break;
                    case "practice":
                      segmentContent = {
                        practice: {
                          type: parsedContent?.practice?.type || "drag-drop",
                          instructions:
                            parsedContent?.practice?.instructions || "",
                          components: parsedContent?.practice?.components || {},
                        },
                      };
                      break;
                    default:
                      segmentContent = parsedContent;
                  }
                }
              }

              segment.content = segmentContent;
              await learningSegmentRepository.save(segment);
            } catch (segmentError) {
              console.error(`Error updating segment:`, segmentError);
            }
          }
        }
      }
    }

    const updatedCourse = await courseRepository.findOne({
      where: { id },
      relations: [
        "learningPaths",
        "learningPaths.segments",
        "featuredCharacters",
      ],
      order: {
        learningPaths: { order: "ASC" },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    next(error);
  }
};

export const debugSegmentContent = (segmentData: any) => {
  console.log("=== SEGMENT DEBUG ===");
  console.log("Type:", segmentData.type);
  console.log("Raw content:", JSON.stringify(segmentData.content, null, 2));

  if (segmentData.type === "question" && segmentData.content?.question) {
    const question = segmentData.content.question;
    console.log("Question text:", question.text);
    console.log("Question type:", question.type);

    if (question.type === "multiple-choice" && question.options) {
      console.log("Options count:", question.options.length);
      question.options.forEach((opt: any, idx: number) => {
        console.log(
          `Option ${idx + 1}:`,
          opt.text,
          "(Correct:",
          opt.isCorrect,
          ")"
        );
      });
    } else if (question.correctAnswer !== undefined) {
      console.log("Correct answer:", question.correctAnswer);
    }

    if (question.explanation) {
      console.log("Explanation:", question.explanation);
    }
  }
  console.log("==================");
};

export const createLearningPath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { title, description, order, segments = [] } = req.body;

    // Validate required fields
    if (!title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title and order are required",
      });
    }

    const course = await courseRepository.findOneBy({ id: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const learningPath = new LearningPath();
    learningPath.title = title;
    learningPath.description = description || null;
    learningPath.order = parseInt(order);
    learningPath.course = course;

    const savedPath = await learningPathRepository.save(learningPath);

    // Create segments if provided
    if (segments.length > 0) {
      const parsedSegments = Array.isArray(segments)
        ? segments
        : JSON.parse(segments);

      for (const segmentData of parsedSegments) {
        const segment = new LearningSegment();
        segment.type = segmentData.type;
        segment.order = parseInt(segmentData.order);
        segment.basePoints = parseInt(segmentData.basePoints) || 0;
        segment.bonusPoints = segmentData.bonusPoints
          ? parseInt(segmentData.bonusPoints)
          : 0;
        segment.content = segmentData.content || null;
        segment.learningPath = savedPath;

        await learningSegmentRepository.save(segment);
      }
    }

    // Fetch the complete learning path with segments
    const completePath = await learningPathRepository.findOne({
      where: { id: savedPath.id },
      relations: ["segments"],
      order: {
        segments: { order: "ASC" },
      },
    });

    res.status(201).json({
      success: true,
      data: completePath,
    });
  } catch (error) {
    next(error);
  }
};

export const createLearningSegment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pathId } = req.params;
    const { type, order, basePoints = 0, bonusPoints, content } = req.body;

    // Validate required fields
    if (!type || order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Type and order are required",
      });
    }

    if (
      !["dialogue", "instruction", "question", "practice", "review"].includes(
        type
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid segment type",
      });
    }

    const learningPath = await learningPathRepository.findOneBy({ id: pathId });
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    const segment = new LearningSegment();
    segment.type = type;
    segment.order = parseInt(order);
    segment.basePoints = parseInt(basePoints) || 0;
    segment.bonusPoints = bonusPoints ? parseInt(bonusPoints) : 0;
    segment.content = content || null;
    segment.learningPath = learningPath;

    const savedSegment = await learningSegmentRepository.save(segment);

    res.status(201).json({
      success: true,
      data: savedSegment,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseWithContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const course = await courseRepository.findOne({
      where: { id },
      relations: [
        "learningPaths",
        "learningPaths.segments",
        "featuredCharacters",
      ],
      order: {
        learningPaths: { order: "ASC" },
      },
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

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: userId,
    });
    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can delete courses",
      });
    }

    const course = await courseRepository.findOne({
      where: { id },
      relations: ["learningPaths", "enrollments"],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course has enrollments
    if (course.enrollments?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course with active enrollments",
      });
    }

    await courseRepository.remove(course);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ageGroup, search, isApproved } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const courses = await courseRepository.find({
      relations: ["learningPaths", "learningPaths.segments"],
    });

    res.status(200).json({
      success: true,
      data: courses,
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

    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: userId,
    });
    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can approve courses",
      });
    }

    const course = await courseRepository.findOneBy({ id });
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

    course.isApproved = true;
    await courseRepository.save(course);

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateLearningPathOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { paths } = req.body; // Array of { id, order }

    if (!Array.isArray(paths)) {
      return res.status(400).json({
        success: false,
        message: "Invalid path order data",
      });
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (const path of paths) {
        await transactionalEntityManager.update(LearningPath, path.id, {
          order: path.order,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Learning path order updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateLearningSegmentOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pathId } = req.params;
    const { segments } = req.body; // Array of { id, order }

    if (!Array.isArray(segments)) {
      return res.status(400).json({
        success: false,
        message: "Invalid segment order data",
      });
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (const segment of segments) {
        await transactionalEntityManager.update(LearningSegment, segment.id, {
          order: segment.order,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Learning segment order updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
