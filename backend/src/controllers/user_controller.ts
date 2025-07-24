import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/user";
import { ParentProfile } from "../models/parent";
import { Family } from "../models/family";
import sendEmail from "../services/emailService";
import { MoreThan } from "typeorm";
import validator from "validator";
import { Child } from "../models/children";

const userRepository = AppDataSource.getRepository(User);
const parentProfileRepository = AppDataSource.getRepository(ParentProfile);
const childRepository = AppDataSource.getRepository(Child);
const familyRepository = AppDataSource.getRepository(Family);

const JWT_SECRET = process.env.JWT_SECRET || "qwertyuiopoiuytreeewq";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET);
};

const sendVerificationEmail = async (user: User) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await userRepository.update(user.id, {
    emailVerificationCode: verificationCode,
    emailVerificationExp: verificationExp,
  });

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome to Family Values Academy!</h2>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in 24 hours.</p>
    `,
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser && existingUser.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.firstName = firstName;

      existingUser.lastName = lastName;
      existingUser.password = password;
      await sendVerificationEmail(existingUser);
    } else {
      // Start a transaction
      await userRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const family = new Family();
          family.name = `${firstName}'s Family`;
          family.familyCode = generateFamilyCode();
          await transactionalEntityManager.save(Family, family);

          const user = new User();
          user.firstName = firstName;
          user.lastName = lastName;
          user.email = email;
          user.password = hashedPassword;
          user.phoneNumber = phoneNumber;
          user.role = UserRole.PARENT;
          await transactionalEntityManager.save(User, user);

          const parentProfile = new ParentProfile();
          parentProfile.user = user;
          parentProfile.family = family;
          parentProfile.isFamilyOwner = true;
          await transactionalEntityManager.save(ParentProfile, parentProfile);

          family.owner = user;
          await transactionalEntityManager.save(Family, family);
          await sendVerificationEmail(user);
        }
      );
    }

    res.status(201).json({
      success: true,
      message: `Verification email sent to ${email}`,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate a family code
function generateFamilyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password || ""))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Please verify your email first" });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.firstName}`,
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Try to find user first (parent)
    const user = await userRepository.findOne({
      where: { id: decoded.id },
      select: ["id", "firstName", "lastName", "email", "role"],
    });

    if (user) {
      const newToken = generateToken(user.id);
      return res.status(200).json({
        success: true,
        token: newToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          type: "parent",
        },
      });
    }

    // If not a user, try to find child
    const child = await childRepository.findOne({
      where: { id: decoded.id },
      relations: ["family"],
    });

    if (child) {
      const newToken = generateToken(child.id);
      return res.status(200).json({
        success: true,
        token: newToken,
        user: {
          id: child.id,
          displayName: child.displayName,
          username: child.username,
          avatarUrl: child.avatarUrl,
          role: UserRole.CHILD,
          familyId: child.family?.id,
          type: "child",
        },
      });
    }

    // If neither found
    return res.status(401).json({
      success: false,
      message: "User/Child not found",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code is required" });
    }

    const user = await userRepository.findOne({
      where: {
        emailVerificationCode: code,
        emailVerificationExp: MoreThan(new Date()),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    await userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationCode: undefined,
      emailVerificationExp: undefined,
    });

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent",
      });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetExp = new Date(Date.now() + 60 * 60 * 1000);

    await userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExp: resetExp,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await userRepository.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExp: MoreThan(new Date()),
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExp: undefined,
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (
      !user ||
      !(await bcrypt.compare(currentPassword, user.password || ""))
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.update(userId, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
