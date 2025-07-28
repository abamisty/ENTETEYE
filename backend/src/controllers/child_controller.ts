import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Child } from "../models/children";
import { AppDataSource } from "../config/database";
import { Course } from "../models/courses";
import { Enrollment } from "../models/enrollment";
import { ChildProgress } from "../models/enrollment";
import { Module } from "../models/courses";
import { Lesson } from "../models/courses";
import { In, Not } from "typeorm";

const childRepository = AppDataSource.getRepository(Child);
const courseRepository = AppDataSource.getRepository(Course);
const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const progressRepository = AppDataSource.getRepository(ChildProgress);
const moduleRepository = AppDataSource.getRepository(Module);
const lessonRepository = AppDataSource.getRepository(Lesson);
const JWT_SECRET = process.env.JWT_SECRET || "qwertyuiopoiuytreeewq";
const generateToken = (childId: string) => {
  return jwt.sign({ id: childId }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const childLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const child = await childRepository.findOne({ where: { username } });
    if (!child || !(await bcrypt.compare(password, child.password || ""))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(child.id);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${child.displayName}`,
      data: {
        token,
        user: {
          id: child.id,
          username: child.username,
          displayName: child.displayName,
          avatarUrl: child.avatarUrl,
          totalPoints: child.totalPoints,
          currentStreak: child.currentStreak,
          familyId: child.family?.id,
          role: "child",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = (req as any).user.id;

    const enrollments = await enrollmentRepository.find({
      where: { child: { id: childId } },
      relations: [
        "course",
        "progress",
        "course.modules",
        "course.modules.lessons",
      ],
      order: { createdAt: "DESC" },
    });

    const courses = enrollments.map((enrollment) => ({
      ...enrollment.course,
      enrollmentStatus: {
        isCompleted: enrollment.isCompleted,
        progressPercentage: enrollment.progressPercentage,
        lastAccessed: enrollment.updatedAt,
      },
    }));

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const childId = (req as any).user.id;

    // Check if child is enrolled
    const enrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
      relations: ["course"],
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Get course with modules and lessons
    const course = await courseRepository.findOne({
      where: { id: courseId },
      relations: ["modules", "modules.lessons"],
      order: {
        modules: { order: "ASC" },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get child's progress for this course
    const progressRecords = await progressRepository.find({
      where: {
        child: { id: childId },
        enrollment: { id: enrollment.id },
      },
      relations: ["lesson"],
    });

    // Structure response with progress information
    const courseWithProgress = {
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => {
          const progress = progressRecords.find(
            (record) => record.lesson.id === lesson.id
          );
          return {
            ...lesson,
            isCompleted: progress?.isCompleted || false,
            completedAt: progress?.completedAt || null,
            quizResults: progress?.quizResults || null,
            activityResults: progress?.activityResults || null,
            timeSpentMinutes: progress?.timeSpentMinutes || 0,
          };
        }),
      })),
    };

    return res.status(200).json({
      success: true,
      data: courseWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = (req as any).user.id;
    const { ageGroup } = req.query;

    // Get enrolled course IDs to exclude
    const enrollments = await enrollmentRepository.find({
      where: { child: { id: childId } },
      select: ["course"],
    });
    const enrolledCourseIds = enrollments.map((e) => e.course.id);

    // Build query for available courses
    const query: any = {
      where: {
        id: Not(In(enrolledCourseIds)),
        isApproved: true,
      },
      order: { createdAt: "DESC" },
    };

    if (ageGroup) {
      query.where.ageGroup = ageGroup;
    }

    const courses = await courseRepository.find(query);

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const childId = (req as any).user.id;

    // Check if already enrolled
    const existingEnrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Check if course exists
    const course = await courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Create new enrollment
    const enrollment = enrollmentRepository.create({
      child: { id: childId },
      course: { id: courseId },
      isCompleted: false,
      progressPercentage: 0,
    });

    await enrollmentRepository.save(enrollment);

    return res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLessonProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, lessonId } = req.params;
    const childId = (req as any).user.id;
    const { isCompleted, quizResults, activityResults, timeSpentMinutes } =
      req.body;

    // Verify enrollment
    const enrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Verify lesson exists in this course
    const lesson = await lessonRepository.findOne({
      where: { id: lessonId },
      relations: ["module"],
    });

    if (!lesson || lesson.module.course.id !== courseId) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      });
    }

    // Find or create progress record
    let progress = await progressRepository.findOne({
      where: {
        child: { id: childId },
        enrollment: { id: enrollment.id },
        lesson: { id: lessonId },
      },
    });

    if (!progress) {
      progress = progressRepository.create({
        child: { id: childId },
        enrollment,
        lesson: { id: lessonId },
      });
    }

    // Update progress
    if (typeof isCompleted === "boolean") {
      progress.isCompleted = isCompleted;
      if (isCompleted) {
        progress.completedAt = new Date();
      }
    }

    if (quizResults) {
      progress.quizResults = quizResults;
    }

    if (activityResults) {
      progress.activityResults = activityResults;
    }

    if (timeSpentMinutes) {
      progress.timeSpentMinutes = timeSpentMinutes;
    }

    await progressRepository.save(progress);

    // Update course progress percentage
    await updateCourseProgress(enrollment.id);

    return res.status(200).json({
      success: true,
      message: "Lesson progress updated",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

async function updateCourseProgress(enrollmentId: string) {
  // Get all lessons in the course
  const enrollment = await enrollmentRepository.findOne({
    where: { id: enrollmentId },
    relations: ["course", "course.modules", "course.modules.lessons"],
  });

  if (!enrollment) return;

  const totalLessons = enrollment.course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );

  if (totalLessons === 0) return;

  // Get completed lessons
  const completedProgress = await progressRepository.count({
    where: {
      enrollment: { id: enrollmentId },
      isCompleted: true,
    },
  });

  // Calculate new percentage
  const newPercentage = Math.round((completedProgress / totalLessons) * 100);

  // Update enrollment if percentage changed
  if (newPercentage !== enrollment.progressPercentage) {
    enrollment.progressPercentage = newPercentage;
    if (newPercentage === 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }
    await enrollmentRepository.save(enrollment);
  }
}

export const getRecommendedCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = (req as any).user.id;

    // Get child's learning preferences
    const child = await childRepository.findOne({
      where: { id: childId },
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    // Get enrolled course IDs to exclude
    const enrollments = await enrollmentRepository.find({
      where: { child: { id: childId } },
      select: ["course"],
    });

    const recommendedCourses = await courseRepository.find({});

    return res.status(200).json({
      success: true,
      data: recommendedCourses,
    });
  } catch (error) {
    next(error);
  }
};
