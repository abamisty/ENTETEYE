import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import bcrypt from "bcryptjs";
import { ParentProfile } from "../models/parent";
import { Child } from "../models/children";
import { Family } from "../models/family";
import { User } from "../models/user";
import { FamilySubscription, SubscriptionStatus } from "../models/subscription";
import { Enrollment } from "../models/enrollment";
import { Course } from "../models/courses";

const parentProfileRepository = AppDataSource.getRepository(ParentProfile);
const childRepository = AppDataSource.getRepository(Child);
const familyRepository = AppDataSource.getRepository(Family);
const userRepository = AppDataSource.getRepository(User);
const subscriptionRepository = AppDataSource.getRepository(FamilySubscription);
const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const courseRepository = AppDataSource.getRepository(Course);

// 1. UPDATE PARENT PROFILE
export const updateParentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { occupation, educationLevel } = req.body;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    if (!parentProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Parent profile not found" });
    }

    parentProfile.occupation = occupation || parentProfile.occupation;
    parentProfile.educationLevel =
      educationLevel || parentProfile.educationLevel;

    await parentProfileRepository.save(parentProfile);

    res.status(200).json({
      success: true,
      data: {
        parentProfile: {
          id: parentProfile.id,
          occupation: parentProfile.occupation,
          educationLevel: parentProfile.educationLevel,
          isFamilyOwner: parentProfile.isFamilyOwner,
          user: {
            firstName: parentProfile.user.firstName,
            lastName: parentProfile.user.lastName,
            email: parentProfile.user.email,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. ADD CHILD
export const addChild = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const {
      displayName,
      dateOfBirth,
      gender,
      learningPreferences,
      username,
      password,
    } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "Parent must belong to a family" });
    }

    const existingChild = await childRepository.findOne({
      where: { username },
    });

    if (existingChild) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const child = childRepository.create({
      displayName,
      birthDate: new Date(dateOfBirth),
      gender,
      learningPreferences,
      username,
      password,
      family: parentProfile.family,
      addedBy: parentProfile,
    });

    await childRepository.save(child);
    const { password: _, ...childData } = child;

    res.status(201).json({
      success: true,
      data: {
        ...childData,
        familyId: child.family.id,
      },

      message: "Child account created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET ALL CHILDREN
export const getAllChildren = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family", "family.children"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "Parent must belong to a family" });
    }

    res.status(200).json({
      success: true,
      data: parentProfile.family.children,
    });
  } catch (error) {
    next(error);
  }
};

// 4. ADD ANOTHER PARENT TO FAMILY
export const addParentToFamily = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { email } = req.body;

    const requestingParent = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!requestingParent || !requestingParent.family) {
      return res
        .status(400)
        .json({ success: false, message: "You must belong to a family" });
    }

    if (!requestingParent.isFamilyOwner) {
      return res
        .status(403)
        .json({ success: false, message: "Only family owner can add parents" });
    }

    const userToAdd = await userRepository.findOne({ where: { email } });
    if (!userToAdd) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (userToAdd.role !== "parent") {
      return res
        .status(400)
        .json({ success: false, message: "User is not a parent" });
    }

    const existingParentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userToAdd.id } },
    });

    if (existingParentProfile && existingParentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "User already belongs to a family" });
    }

    const parentProfile =
      existingParentProfile ||
      parentProfileRepository.create({
        user: userToAdd,
        isFamilyOwner: false,
      });

    parentProfile.family = requestingParent.family;
    await parentProfileRepository.save(parentProfile);

    res.status(200).json({
      success: true,
      message: "Parent added to family successfully",
      data: {
        parent: {
          id: parentProfile.id,
          email: userToAdd.email,
          firstName: userToAdd.firstName,
          lastName: userToAdd.lastName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET FAMILY DETAILS
export const getFamilyDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family", "family.parents", "family.children"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "Parent must belong to a family" });
    }

    res.status(200).json({
      success: true,
      data: {
        family: {
          id: parentProfile.family.id,
          name: parentProfile.family.name,
          parents: parentProfile.family.parents.map((parent) => ({
            id: parent.id,
            isFamilyOwner: parent?.parentProfile?.isFamilyOwner,
            user: {
              id: parent.id,
              firstName: parent.firstName,
              lastName: parent.lastName,
              email: parent.email,
            },
          })),
          children: parentProfile.family.children.map((child) => ({
            id: child.id,
            displayName: child.displayName,
            username: child.username,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const activateFamilySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { paystackSubscriptionCode, plan } = req.body;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "Parent must belong to a family" });
    }

    if (!parentProfile.isFamilyOwner) {
      return res.status(403).json({
        success: false,
        message: "Only family owner can activate subscription",
      });
    }

    const subscription = subscriptionRepository.create({
      paystackSubscriptionCode,
      plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      nextPaymentDate:
        plan === "monthly"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      amount: plan === "monthly" ? 500000 : 5000000,
      currency: "NGN",
      isAutoRenew: true,
      family: parentProfile.family,
      managedBy: parentProfile.user,
    });

    await subscriptionRepository.save(subscription);

    res.status(201).json({
      success: true,
      message: "Subscription activated successfully",
      data: {
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          nextPaymentDate: subscription.nextPaymentDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFamilySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family", "family.subscriptions"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "Parent must belong to a family" });
    }

    const activeSubscription = parentProfile.family.subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trial"
    );

    if (!activeSubscription) {
      return res
        .status(404)
        .json({ success: false, message: "No active subscription found" });
    }

    res.status(200).json({
      success: true,
      data: {
        subscription: {
          id: activeSubscription.id,
          plan: activeSubscription.plan,
          status: activeSubscription.status,
          startDate: activeSubscription.startDate,
          nextPaymentDate: activeSubscription.nextPaymentDate,
          amount: activeSubscription.amount,
          currency: activeSubscription.currency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const enrollChildInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { childId, courseId } = req.body;

    // Verify parent has permission
    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res.status(400).json({
        success: false,
        message: "Parent must belong to a family",
      });
    }

    // Check family subscription status
    const activeSubscription = await subscriptionRepository.findOne({
      where: {
        family: { id: parentProfile.family.id },
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // if (!activeSubscription) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Active family subscription required to enroll in courses",
    //   });
    // }

    // Verify child belongs to parent's family
    const child = await childRepository.findOne({
      where: { id: childId, family: { id: parentProfile.family.id } },
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found in your family",
      });
    }

    // Verify course exists and is approved
    const course = await courseRepository.findOne({
      where: { id: courseId, isApproved: true },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not approved",
      });
    }

    // Check if child is already enrolled
    const existingEnrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Child is already enrolled in this course",
      });
    }

    // Create new enrollment
    const enrollment = enrollmentRepository.create({
      child,
      course,
      progressPercentage: 0,
      isCompleted: false,
      coursePreferences: {
        difficulty: "medium",
        notificationEnabled: true,
        dailyGoalMinutes: 30,
      },
    });

    await enrollmentRepository.save(enrollment);

    res.status(201).json({
      success: true,
      message: "Child enrolled in course successfully",
      data: {
        enrollment: {
          id: enrollment.id,
          courseId: enrollment.course.id,
          courseTitle: course.title,
          childId: enrollment.child.id,
          childName: child.displayName,
          progressPercentage: enrollment.progressPercentage,
          isCompleted: enrollment.isCompleted,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET CHILD'S ENROLLED COURSES
export const getChildEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { childId } = req.params;

    // Verify parent has permission
    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res.status(400).json({
        success: false,
        message: "Parent must belong to a family",
      });
    }

    // Verify child belongs to parent's family
    const child = await childRepository.findOne({
      where: { id: childId, family: { id: parentProfile.family.id } },
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found in your family",
      });
    }

    // Get all enrollments for this child
    const enrollments = await enrollmentRepository.find({
      where: { child: { id: childId } },
      relations: ["course"],
    });

    res.status(200).json({
      success: true,
      data: {
        enrollments: enrollments.map((enrollment) => ({
          id: enrollment.id,
          courseId: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          thumbnailUrl: enrollment.course.thumbnailUrl,
          progressPercentage: enrollment.progressPercentage,
          isCompleted: enrollment.isCompleted,
          createdAt: enrollment.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE COURSE PROGRESS PREFERENCES
export const updateCoursePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { enrollmentId } = req.params;
    const { difficulty, notificationEnabled, dailyGoalMinutes } = req.body;

    // Verify parent has permission
    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res.status(400).json({
        success: false,
        message: "Parent must belong to a family",
      });
    }

    // Get the enrollment with child relationship
    const enrollment = await enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ["child"],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Verify child belongs to parent's family
    const child = await childRepository.findOne({
      where: {
        id: enrollment.child.id,
        family: { id: parentProfile.family.id },
      },
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this enrollment",
      });
    }

    // Update preferences
    enrollment.coursePreferences = {
      difficulty: difficulty || enrollment.coursePreferences?.difficulty,
      notificationEnabled:
        notificationEnabled !== undefined
          ? notificationEnabled
          : enrollment.coursePreferences?.notificationEnabled,
      dailyGoalMinutes:
        dailyGoalMinutes || enrollment.coursePreferences?.dailyGoalMinutes,
    };

    await enrollmentRepository.save(enrollment);

    res.status(200).json({
      success: true,
      message: "Course preferences updated successfully",
      data: {
        enrollment: {
          id: enrollment.id,
          courseId: enrollment.course.id,
          preferences: enrollment.coursePreferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET CHILD'S COURSE PROGRESS
export const getChildCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { childId, courseId } = req.params;

    // Verify parent has permission
    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res.status(400).json({
        success: false,
        message: "Parent must belong to a family",
      });
    }

    // Verify child belongs to parent's family
    const child = await childRepository.findOne({
      where: { id: childId, family: { id: parentProfile.family.id } },
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found in your family",
      });
    }

    // Get the enrollment with progress details
    const enrollment = await enrollmentRepository.findOne({
      where: { child: { id: childId }, course: { id: courseId } },
      relations: ["course", "progress", "progress.lesson"],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Calculate overall progress
    const totalLessons =
      enrollment.course.modules?.reduce(
        (total, module) => total + module.lessons.length,
        0
      ) || 0;

    const completedLessons =
      enrollment.progress?.filter((p) => p.isCompleted).length || 0;

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          courseId: enrollment.course.id,
          courseTitle: enrollment.course.title,
          childId: enrollment.child.id,
          childName: child.displayName,
          progressPercentage,
          isCompleted: enrollment.isCompleted,
          preferences: enrollment.coursePreferences,
          lessons: enrollment.course.modules?.flatMap((module) =>
            module.lessons.map((lesson) => ({
              lessonId: lesson.id,
              title: lesson.title,
              type: lesson.type,
              isCompleted: enrollment.progress?.some(
                (p) => p.lesson.id === lesson.id && p.isCompleted
              ),
            }))
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CHILD
export const deleteChild = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { childId } = req.params;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res.status(400).json({
        success: false,
        message: "Parent must belong to a family",
      });
    }

    const child = await childRepository.findOne({
      where: { id: childId, family: { id: parentProfile.family.id } },
      relations: ["enrollments"],
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found in your family",
      });
    }

    if (child.enrollments && child.enrollments.length > 0) {
      await enrollmentRepository.remove(child.enrollments);
    }

    await childRepository.remove(child);

    res.status(200).json({
      success: true,
      message: "Child account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
