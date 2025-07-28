import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/user";
import { ParentProfile } from "../models/parent";
import { FamilySubscription } from "../models/subscription";
import { Course } from "../models/courses";
import { Enrollment } from "../models/enrollment";

const parentProfileRepository = AppDataSource.getRepository(ParentProfile);
const userRepository = AppDataSource.getRepository(User);
const subscriptionRepository = AppDataSource.getRepository(FamilySubscription);
const courseRepository = AppDataSource.getRepository(Course);
const enrollmentRepository = AppDataSource.getRepository(Enrollment);

export const getAllParents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["adminProfile"],
    });

    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can access all parent profiles",
      });
    }

    // Get all parents with their user details and family info
    const parents = await parentProfileRepository.find({
      relations: ["user", "family", "family.children", "family.subscriptions"],
    });

    const formattedParents = parents.map((parent: any) => ({
      id: parent.id,
      occupation: parent.occupation,
      educationLevel: parent.educationLevel,
      isFamilyOwner: parent.isFamilyOwner,
      user: {
        id: parent.user.id,
        firstName: parent.user.firstName,
        lastName: parent.user.lastName,
        email: parent.user.email,
        phoneNumber: parent.user.phoneNumber,
        gender: parent.user.gender,
        avatar: parent.user.avatar,
        role: parent.user.role,
      },
      family: parent.family
        ? {
            id: parent.family.id,
            name: parent.family.name,
            childrenCount: parent.family.children?.length || 0,
            subscriptionStatus:
              parent.family.subscriptions?.[0]?.status || "none",
          }
        : null,
      createdAt: parent.user.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedParents.length,
      data: formattedParents,
    });
  } catch (error) {
    next(error);
  }
};

// GET PARENT DETAILS
export const getParentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { parentId } = req.params;

    // Get requesting user's profile
    const requestingUser = await userRepository.findOne({
      where: { id: userId },
      relations: ["parentProfile", "parentProfile.family"],
    });

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get target parent profile
    const parentProfile = await parentProfileRepository.findOne({
      where: { id: parentId },
      relations: [
        "user",
        "family",
        "family.children",
        "family.parents",
        "family.parents.user",
      ],
    });

    if (!parentProfile) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Authorization check:
    // - Admin can view any parent
    // - Family owner can view parents in their family
    // - Parents can view their own profile
    const isAdmin = requestingUser.role === UserRole.ADMIN;
    const isFamilyOwner = requestingUser.parentProfile?.isFamilyOwner;
    const sameFamily =
      requestingUser.parentProfile?.family?.id === parentProfile.family?.id;
    const isSelf = parentProfile.user.id === userId;

    if (!isAdmin && !isSelf && !(isFamilyOwner && sameFamily)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this parent's details",
      });
    }

    // Format response
    const response = {
      id: parentProfile.id,
      occupation: parentProfile.occupation,
      educationLevel: parentProfile.educationLevel,
      isFamilyOwner: parentProfile.isFamilyOwner,
      user: {
        id: parentProfile.user.id,
        firstName: parentProfile.user.firstName,
        lastName: parentProfile.user.lastName,
        email: parentProfile.user.email,
        phoneNumber: parentProfile.user.phoneNumber,
        gender: parentProfile.user.gender,
        dob: parentProfile.user.dob,
        avatar: parentProfile.user.avatar,
        createdAt: parentProfile.user.createdAt,
      },
      family: parentProfile.family
        ? {
            id: parentProfile.family.id,
            name: parentProfile.family.name,
            children: parentProfile.family.children.map((child) => ({
              id: child.id,
              displayName: child.displayName,
              username: child.username,
            })),
            parents: parentProfile.family.parents.map((parent) => ({
              id: parent.id,
              firstName: parent.firstName,
              lastName: parent.lastName,
              email: parent.email,
              isFamilyOwner: parent.parentProfile?.isFamilyOwner,
            })),
          }
        : null,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// GET PARENTS IN FAMILY
export const getFamilyParents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    // Verify requesting user is a parent
    const requestingParent = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!requestingParent || !requestingParent.family) {
      return res.status(400).json({
        success: false,
        message: "You must belong to a family to view other parents",
      });
    }

    // Get all parents in the same family
    const familyParents = await parentProfileRepository.find({
      where: { family: { id: requestingParent.family.id } },
      relations: ["user"],
      order: { isFamilyOwner: "DESC" }, // Family owner first
    });

    const formattedParents = familyParents.map((parent) => ({
      id: parent.id,
      isFamilyOwner: parent.isFamilyOwner,
      occupation: parent.occupation,
      educationLevel: parent.educationLevel,
      user: {
        id: parent.user.id,
        firstName: parent.user.firstName,
        lastName: parent.user.lastName,
        email: parent.user.email,
        phoneNumber: parent.user.phoneNumber,
        avatar: parent.user.avatar,
      },
      joinedAt: parent.user.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        familyId: requestingParent.family.id,
        parents: formattedParents,
        count: formattedParents.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can access all subscriptions",
      });
    }

    // Get all subscriptions with family and payment details
    const subscriptions = await subscriptionRepository.find({
      relations: [
        "family",
        "family.parents",
        "family.parents",
        "payments",
        "managedBy",
      ],
      order: { createdAt: "DESC" },
    });

    const formattedSubscriptions = subscriptions.map((subscription) => ({
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      amount: subscription.amount,
      currency: subscription.currency,
      startDate: subscription.startDate,
      nextPaymentDate: subscription.nextPaymentDate,
      isAutoRenew: subscription.isAutoRenew,
      family: {
        id: subscription.family?.id,
        name: subscription.family?.name,
        parents: subscription.family?.parents?.map((parent) => ({
          id: parent.id,
          name: `${parent?.firstName} ${parent?.lastName}`,
          email: parent?.email,
          isOwner: parent.parentProfile?.isFamilyOwner,
        })),
      },
      managedBy: {
        id: subscription.managedBy?.id,
        name: `${subscription.managedBy?.firstName} ${subscription.managedBy?.lastName}`,
      },
      payments: subscription.payments?.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
      })),
      createdAt: subscription.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedSubscriptions.length,
      data: formattedSubscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL COURSES (ADMIN ONLY)
export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can access all courses",
      });
    }

    // Get all courses with enrollments and creator info
    const courses = await courseRepository.find({
      relations: [
        "enrollments",
        "enrollments.child",
        "enrollments.child.family",
      ],
      order: { createdAt: "DESC" },
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      ageGroup: course.ageGroup,
      isApproved: course.isApproved,
      thumbnailUrl: course.thumbnailUrl,
      stats: {
        totalEnrollments: course.enrollments?.length || 0,
        activeEnrollments:
          course.enrollments?.filter((e) => !e.isCompleted).length || 0,
        completionRate:
          course.enrollments?.length > 0
            ? Math.round(
                (course.enrollments.filter((e) => e.isCompleted).length /
                  course.enrollments.length) *
                  100
              )
            : 0,
      },
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedCourses.length,
      data: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL COURSE ENROLLMENTS (ADMIN ONLY)
export const getAllCourseEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can access all enrollments",
      });
    }

    // Get all enrollments with child, course, and progress details
    const enrollments = await enrollmentRepository.find({
      relations: [
        "child",
        "child.family",
        "course",
        "progress",
        "progress.lesson",
      ],
      order: { createdAt: "DESC" },
    });

    const formattedEnrollments = enrollments.map((enrollment) => {
      const totalLessons =
        enrollment.course.modules?.reduce(
          (total, module) => total + module.lessons.length,
          0
        ) || 0;

      const completedLessons =
        enrollment.progress?.filter((p) => p.isCompleted).length || 0;

      return {
        id: enrollment.id,
        child: {
          id: enrollment.child.id,
          displayName: enrollment.child.displayName,
          family: {
            id: enrollment.child.family?.id,
            name: enrollment.child.family?.name,
          },
        },
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
        },
        progress: {
          percentage: enrollment.progressPercentage,
          completedLessons,
          totalLessons,
          isCompleted: enrollment.isCompleted,
        },
        preferences: enrollment.coursePreferences,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedEnrollments.length,
      data: formattedEnrollments,
    });
  } catch (error) {
    next(error);
  }
};

// GET ENROLLMENT ANALYTICS (ADMIN ONLY)
export const getEnrollmentAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify requesting user is admin
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin users can access enrollment analytics",
      });
    }

    // Get enrollment stats by course
    const courses = await courseRepository.find({
      relations: ["enrollments"],
    });

    // Get enrollment stats by date
    const enrollmentsByDate = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .select("DATE(enrollment.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .groupBy("DATE(enrollment.createdAt)")
      .orderBy("DATE(enrollment.createdAt)", "ASC")
      .getRawMany();

    // Get completion rates
    const completionStats = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .select("COUNT(*)", "total")
      .addSelect(
        "SUM(CASE WHEN enrollment.isCompleted = true THEN 1 ELSE 0 END)",
        "completed"
      )
      .getRawOne();

    const analytics = {
      totalCourses: courses.length,
      totalEnrollments: courses.reduce(
        (sum, course) => sum + course.enrollments.length,
        0
      ),
      completionRate: completionStats
        ? Math.round(
            (parseInt(completionStats.completed) /
              parseInt(completionStats.total)) *
              100
          )
        : 0,
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        enrollments: course.enrollments.length,
        activeEnrollments: course.enrollments.filter((e) => !e.isCompleted)
          .length,
      })),
      enrollmentTrend: enrollmentsByDate.map((item) => ({
        date: item.date,
        count: parseInt(item.count),
      })),
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
