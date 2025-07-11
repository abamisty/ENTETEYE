import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import bcrypt from "bcryptjs";
import { ParentProfile } from "../models/parent";
import { Child } from "../models/children";
import { Family } from "../models/family";
import { User } from "../models/user";
import { FamilySubscription, SubscriptionStatus } from "../models/subscription";

const parentProfileRepository = AppDataSource.getRepository(ParentProfile);
const childRepository = AppDataSource.getRepository(Child);
const familyRepository = AppDataSource.getRepository(Family);
const userRepository = AppDataSource.getRepository(User);
const subscriptionRepository = AppDataSource.getRepository(FamilySubscription);

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
    const { displayName, birthDate, gender, learningPreferences, username } =
      req.body;

    const parentProfile = await parentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ["family"],
    });

    if (!parentProfile || !parentProfile.family) {
      return res
        .status(400)
        .json({ success: false, message: "Parent must belong to a family" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const child = childRepository.create({
      displayName,
      birthDate: new Date(birthDate),
      gender,
      learningPreferences,
      username: username,
      passwordHash,
      family: parentProfile.family,
      addedBy: parentProfile,
    });

    await childRepository.save(child);

    res.status(201).json({
      success: true,
      data: {
        child: {
          id: child.id,
          displayName: child.displayName,
          username: child.username,
          familyId: child.family.id,
        },
      },
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
      data: {
        children: parentProfile.family.children.map((child) => ({
          id: child.id,
          displayName: child.displayName,
          username: child.username,
          avatarUrl: child.avatarUrl,
          points: child.totalPoints,
          streak: child.currentStreak,
        })),
      },
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
      relations: [
        "family",
        "family.parents",
        "family.parents.user",
        "family.children",
      ],
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
