import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Child } from "../models/children";
import { AppDataSource } from "../config/database";
import { Course, LearningPath, LearningSegment } from "../models/courses";
import {
  Enrollment,
  PathProgress,
  SegmentProgress,
} from "../models/enrollment";
import { In, Not } from "typeorm";

const childRepository = AppDataSource.getRepository(Child);
const courseRepository = AppDataSource.getRepository(Course);
const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const pathProgressRepository = AppDataSource.getRepository(PathProgress);
const segmentProgressRepository = AppDataSource.getRepository(SegmentProgress);
const learningSegmentRepository = AppDataSource.getRepository(LearningSegment);
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

    const child = await childRepository.findOne({
      where: { username },
      relations: ["family"],
    });

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
        "pathProgress",
        "course.learningPaths",
        "course.learningPaths.segments",
      ],
      order: { createdAt: "DESC" },
    });

    const courses = enrollments.map((enrollment) => ({
      ...enrollment.course,
      enrollmentStatus: {
        isCompleted: enrollment.isCompleted,
        progressPercentage: enrollment.progressPercentage,
        lastAccessed: enrollment.updatedAt,
        totalPointsEarned: enrollment.totalPointsEarned,
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

    // Get course with learning paths and segments
    const course = await courseRepository.findOne({
      where: { id: courseId },
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

    // Get child's progress for this course
    const pathProgress = await pathProgressRepository.find({
      where: {
        enrollment: { id: enrollment.id },
      },
      relations: ["learningPath", "segmentProgress"],
    });

    // Structure response with progress information
    const courseWithProgress = {
      ...course,
      learningPaths: course.learningPaths.map((path) => {
        const pathProgressRecord = pathProgress.find(
          (p) => p.learningPath.id === path.id
        );

        return {
          ...path,
          isCompleted: pathProgressRecord?.isCompleted || false,
          progressPercentage: pathProgressRecord?.progressPercentage || 0,
          segments: path.segments.map((segment) => {
            const segmentProgress = pathProgressRecord?.segmentProgress.find(
              (sp) => sp.segment?.id === segment?.id
            );
            return {
              ...segment,
              isCompleted: segmentProgress?.isCompleted || false,
              pointsEarned: segmentProgress?.pointsEarned || 0,
              interactionData: segmentProgress?.interactionData || null,
            };
          }),
        };
      }),
    };

    return res.status(200).json({
      success: true,
      data: { ...courseWithProgress, enrollment },
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
      relations: ["learningPaths"],
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

    // Initialize path progress for all learning paths
    for (const path of course.learningPaths) {
      const pathProgress = pathProgressRepository.create({
        enrollment,
        learningPath: path,
        isCompleted: false,
        progressPercentage: 0,
      });

      await pathProgressRepository.save(pathProgress);
    }

    return res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSegmentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, segmentId } = req.params;
    const childId = (req as any).user.id;
    const { isCompleted, interactionData, pointsEarned } = req.body;

    console.log(
      `Updating segment progress: Child ${childId}, Course ${courseId}, Segment ${segmentId}`
    );

    // Verify enrollment
    const enrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
      relations: ["pathProgress"],
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Verify segment exists in this course and get all segments in the path
    const segment = await learningSegmentRepository.findOne({
      where: { id: segmentId },
      relations: [
        "learningPath",
        "learningPath.course",
        "learningPath.segments",
      ],
    });

    if (!segment || segment.learningPath.course.id !== courseId) {
      return res.status(404).json({
        success: false,
        message: "Segment not found in this course",
      });
    }

    // Find or create path progress
    let pathProgress = await pathProgressRepository.findOne({
      where: {
        enrollment: { id: enrollment.id },
        learningPath: { id: segment.learningPath.id },
      },
      relations: ["segmentProgress", "segmentProgress.segment"],
    });

    if (!pathProgress) {
      console.log(
        `Creating new path progress for path: ${segment.learningPath.id}`
      );
      // Create new path progress if it doesn't exist
      pathProgress = pathProgressRepository.create({
        enrollment: { id: enrollment.id },
        learningPath: { id: segment.learningPath.id },
        isCompleted: false,
        progressPercentage: 0,
        pointsEarned: 0,
      });

      await pathProgressRepository.save(pathProgress);

      // Add the new path progress to the enrollment relation
      if (!enrollment.pathProgress) {
        enrollment.pathProgress = [];
      }
      enrollment.pathProgress.push(pathProgress);
      await enrollmentRepository.save(enrollment);

      // Reload the pathProgress with relations
      pathProgress = await pathProgressRepository.findOne({
        where: { id: pathProgress.id },
        relations: ["segmentProgress", "segmentProgress.segment"],
      });
    }

    // Find or create segment progress
    let segmentProgress = await segmentProgressRepository.findOne({
      where: {
        pathProgress: { id: pathProgress!.id },
        segment: { id: segmentId },
      },
    });

    if (!segmentProgress) {
      console.log(`Creating new segment progress for segment: ${segmentId}`);
      segmentProgress = segmentProgressRepository.create({
        pathProgress: pathProgress!,
        segment: { id: segmentId },
        isCompleted: false,
        pointsEarned: 0,
        timeSpentSeconds: 0,
      });
    }

    // Update segment progress
    let hasChanges = false;

    if (
      typeof isCompleted === "boolean" &&
      segmentProgress.isCompleted !== isCompleted
    ) {
      segmentProgress.isCompleted = isCompleted;
      hasChanges = true;
      if (isCompleted) {
        segmentProgress.completedAt = new Date();
        console.log(`Segment ${segmentId} marked as completed`);
      }
    }

    if (interactionData) {
      segmentProgress.interactionData = interactionData;
      hasChanges = true;
    }

    if (
      typeof pointsEarned === "number" &&
      segmentProgress.pointsEarned !== pointsEarned
    ) {
      segmentProgress.pointsEarned = pointsEarned;
      hasChanges = true;
    }

    if (hasChanges) {
      await segmentProgressRepository.save(segmentProgress);
      console.log(`Segment progress saved for segment: ${segmentId}`);
    }

    // Update path progress calculations
    if (pathProgress && segment.learningPath.segments) {
      // Get all segment progress records for this path
      const allSegmentProgress = await segmentProgressRepository.find({
        where: { pathProgress: { id: pathProgress.id } },
        relations: ["segment"],
      });

      // Get total segments in the learning path
      const totalSegments = segment.learningPath.segments.length;

      // Count completed segments
      const completedSegments = allSegmentProgress.filter(
        (sp) => sp.isCompleted
      ).length;

      // Calculate total points earned in this path
      const totalPointsEarned = allSegmentProgress.reduce(
        (sum, sp) => sum + (sp.pointsEarned || 0),
        0
      );

      // Calculate progress percentage
      const newProgressPercentage = Math.round(
        (completedSegments / totalSegments) * 100
      );

      console.log(
        `Path progress calculation: ${completedSegments}/${totalSegments} segments completed (${newProgressPercentage}%)`
      );

      // Update path progress if values have changed
      if (
        newProgressPercentage !== pathProgress.progressPercentage ||
        totalPointsEarned !== pathProgress.pointsEarned ||
        (newProgressPercentage === 100 && !pathProgress.isCompleted)
      ) {
        pathProgress.progressPercentage = newProgressPercentage;
        pathProgress.pointsEarned = totalPointsEarned;
        pathProgress.isCompleted = newProgressPercentage === 100;

        if (pathProgress.isCompleted && !pathProgress.completedAt) {
          pathProgress.completedAt = new Date();
          console.log(
            `Learning path ${segment.learningPath.id} marked as completed!`
          );
        }

        await pathProgressRepository.save(pathProgress);
      }
    }

    // Update course progress
    await updateCourseProgress(enrollment.id);

    // Return the updated segment progress with additional info
    const responseData = {
      ...segmentProgress,
      pathProgress: {
        id: pathProgress!.id,
        progressPercentage: pathProgress!.progressPercentage,
        isCompleted: pathProgress!.isCompleted,
        pointsEarned: pathProgress!.pointsEarned,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Segment progress updated",
      data: responseData,
    });
  } catch (error) {
    console.error("Error updating segment progress:", error);
    next(error);
  }
};

// Updated course progress function to work with the fixed segment controller
async function updateCourseProgress(enrollmentId: string) {
  try {
    const enrollment = await enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ["course", "course.learningPaths", "pathProgress"],
    });

    if (!enrollment || !enrollment.course) {
      console.error(`Enrollment not found: ${enrollmentId}`);
      return;
    }

    const totalPaths = enrollment.course.learningPaths?.length || 0;
    if (totalPaths === 0) {
      console.warn(
        `No learning paths found for course: ${enrollment.course.id}`
      );
      return;
    }

    const completedPaths =
      enrollment.pathProgress?.filter((pp) => pp.isCompleted).length || 0;
    const newPercentage = Math.round((completedPaths / totalPaths) * 100);

    // Calculate total points earned across all paths
    const totalPointsEarned =
      enrollment.pathProgress?.reduce(
        (sum, pp) => sum + (pp.pointsEarned || 0),
        0
      ) || 0;

    console.log(
      `Updating course progress: ${completedPaths}/${totalPaths} paths completed (${newPercentage}%)`
    );
    if (
      newPercentage !== enrollment.progressPercentage ||
      totalPointsEarned !== enrollment.totalPointsEarned ||
      (newPercentage === 100 && !enrollment.isCompleted)
    ) {
      enrollment.progressPercentage = newPercentage;
      enrollment.totalPointsEarned = totalPointsEarned;
      enrollment.isCompleted = newPercentage === 100;

      if (enrollment.isCompleted && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
        console.log(
          `Course ${enrollment.course.id} marked as completed for child ${enrollment.child}!`
        );
      }

      await enrollmentRepository.save(enrollment);
      console.log(`Course progress updated successfully: ${enrollment.id}`);
    }
  } catch (error) {
    console.error("Error updating course progress:", error);
    throw error;
  }
}

async function updatePathProgress(pathProgressId: string) {
  const pathProgress = await pathProgressRepository.findOne({
    where: { id: pathProgressId },
    relations: ["learningPath", "segmentProgress"],
  });

  if (!pathProgress || !pathProgress.learningPath) return;

  const totalSegments = pathProgress.learningPath.segments?.length || 0;
  if (totalSegments === 0) return;

  const completedSegments =
    pathProgress.segmentProgress?.filter((sp) => sp.isCompleted).length || 0;

  const newPercentage = Math.round((completedSegments / totalSegments) * 100);

  if (newPercentage !== pathProgress.progressPercentage) {
    pathProgress.progressPercentage = newPercentage;
    pathProgress.isCompleted = newPercentage === 100;
    await pathProgressRepository.save(pathProgress);
  }
}

export const getChildProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const childId = (req as any).user.id;

    // Check enrollment
    const enrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
      relations: ["child", "pathProgress", "pathProgress.segmentProgress"],
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Calculate total points earned in this course
    const totalPoints =
      enrollment.pathProgress?.reduce((sum, path) => {
        return (
          sum +
          (path.segmentProgress?.reduce((pathSum, segment) => {
            return pathSum + (segment.pointsEarned || 0);
          }, 0) || 0)
        );
      }, 0) || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalPoints,
        progressPercentage: enrollment.progressPercentage,
        lastAccessed: enrollment.updatedAt,
        pathsCompleted:
          enrollment.pathProgress?.filter((p) => p.isCompleted).length || 0,
        totalPaths: enrollment.course.learningPaths?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = (req as any).user.id;

    // Get child's age group
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
    const enrolledCourseIds = enrollments.map((e) => e.course.id);

    // Get recommended courses based on age group
    const recommendedCourses = await courseRepository.find({
      where: {
        id: Not(In(enrolledCourseIds)),
        isApproved: true,
      },
      take: 5,
      order: { createdAt: "DESC" },
    });

    return res.status(200).json({
      success: true,
      data: recommendedCourses,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const childId = (req as any).user.id;

    // Get child information with all required fields
    const child = await childRepository.findOne({
      where: { id: childId },
      relations: ["family"],
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    // Get enrolled courses with progress data
    const enrollments = await enrollmentRepository.find({
      where: { child: { id: childId } },
      relations: [
        "course",
        "pathProgress",
        "pathProgress.learningPath",
        "pathProgress.segmentProgress",
        "pathProgress.segmentProgress.segment",
        "course.learningPaths",
        "course.learningPaths.segments",
      ],
      order: { updatedAt: "DESC" },
    });

    // Calculate comprehensive statistics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(
      (enrollment) => enrollment.isCompleted
    ).length;
    const inProgressCourses = enrollments.filter(
      (enrollment) =>
        !enrollment.isCompleted && enrollment.progressPercentage > 0
    ).length;

    // Calculate total and completed lessons
    let totalLessons = 0;
    let completedLessons = 0;
    let totalPoints = 0;
    let timeSpentMinutes = 0;

    enrollments.forEach((enrollment) => {
      totalPoints += enrollment.totalPointsEarned;

      // Calculate lessons from course structure
      enrollment.course.learningPaths?.forEach((path) => {
        totalLessons += path.segments?.length || 0;
      });

      // Calculate completed lessons from progress
      enrollment.pathProgress?.forEach((path) => {
        completedLessons +=
          path.segmentProgress?.filter((seg) => seg.isCompleted).length || 0;
        timeSpentMinutes +=
          path.segmentProgress?.reduce(
            (sum, seg) => sum + (seg.timeSpentSeconds || 0),
            0
          ) || 0;
      });
    });

    // Convert seconds to minutes
    timeSpentMinutes = Math.round(timeSpentMinutes / 60);

    // Calculate average progress
    const avgProgressPerCourse =
      totalCourses > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) /
              totalCourses
          )
        : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const coursesThisWeek = enrollments.filter(
      (e) => new Date(e.updatedAt) >= oneWeekAgo
    ).length;

    const pointsThisWeek = enrollments
      .filter((e) => new Date(e.updatedAt) >= oneWeekAgo)
      .reduce((sum, e) => sum + e.totalPointsEarned, 0);

    const stats = {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalLessons,
      completedLessons,
      totalPoints,
      currentStreak: child.currentStreak,
      level: 1,
      nextLevelPoints: 1000 - (child.totalPoints % 1000),
      badges: Math.floor(child.totalPoints / 500),
      timeSpentMinutes,
      avgProgressPerCourse,
      coursesThisWeek,
      pointsThisWeek,
    };

    const recentCourses = enrollments.slice(0, 5).map((enrollment) => {
      const course = enrollment.course;
      const lastPathProgress = enrollment.pathProgress?.[0];
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        ageGroup: course.ageGroup,
        thumbnailUrl: course.thumbnailUrl,
        tags: course.tags || [],
        progress: {
          percentage: enrollment.progressPercentage,
          completedLessons:
            enrollment.pathProgress?.reduce(
              (sum, path) =>
                sum +
                (path.segmentProgress?.filter((seg) => seg.isCompleted)
                  .length || 0),
              0
            ) || 0,
          totalLessons:
            course.learningPaths?.reduce(
              (sum, path) => sum + (path.segments?.length || 0),
              0
            ) || 0,
          isCompleted: enrollment.isCompleted,
          currentModuleId: lastPathProgress?.learningPath?.id,
          currentLessonId: lastPathProgress?.segmentProgress?.[0]?.segment?.id,
          lastAccessedAt: enrollment.updatedAt.toISOString(),
          totalPointsEarned: enrollment.totalPointsEarned,
        },
      };
    });

    // Generate recent activity (simplified example)
    const recentActivity = enrollments
      .flatMap((enrollment) => {
        const activities = [];

        // Add course completion activity if applicable
        if (enrollment.isCompleted && enrollment.completedAt) {
          activities.push({
            id: `complete-${enrollment.id}`,
            type: "course_completed" as const,
            courseTitle: enrollment.course.title,
            pointsEarned: enrollment.totalPointsEarned,
            timestamp: enrollment.completedAt.toISOString(),
          });
        }

        // Add segment completion activities
        enrollment.pathProgress?.forEach((path) => {
          path.segmentProgress?.forEach((segment) => {
            if (segment.isCompleted && segment.completedAt) {
              activities.push({
                id: `segment-${segment.id}`,
                type: "lesson_completed" as const,
                courseTitle: enrollment.course.title,
                pointsEarned: segment.pointsEarned,
                timestamp: segment.completedAt.toISOString(),
              });
            }
          });
        });

        return activities;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    // Generate upcoming goals (example goals)
    const upcomingGoals = [
      {
        id: "daily-learning",
        title: "Daily Learning Goal",
        description: "Complete at least 3 lessons today",
        targetValue: 3,
        currentValue: Math.min(completedLessons % 3, 3),
        type: "daily" as const,
      },
      {
        id: "weekly-courses",
        title: "Weekly Course Progress",
        description: "Make progress in 2 different courses this week",
        targetValue: 2,
        currentValue: Math.min(coursesThisWeek, 2),
        type: "weekly" as const,
      },
      {
        id: "points-milestone",
        title: "Points Milestone",
        description: `Reach ${
          Math.ceil((child.totalPoints + 1) / 100) * 100
        } total points`,
        targetValue: Math.ceil((child.totalPoints + 1) / 100) * 100,
        currentValue: child.totalPoints,
        type: "monthly" as const,
      },
    ];

    const profile = {
      id: child.id,
      displayName: child.displayName,
      username: child.username,
      firstName: child.displayName,
      lastName: child.displayName,
      dateOfBirth: child.birthDate,
      avatar: child.avatarUrl,
      totalPoints: child.totalPoints,
      currentStreak: child.currentStreak,
      level: 1,
      family: {
        id: child.family?.id || "",
        name: child.family?.name || "Family",
      },
    };

    const dashboardData = {
      profile,
      stats,
      recentCourses,
      recentActivity,
      upcomingGoals,
    };

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    next(error);
  }
};
