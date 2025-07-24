import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Child } from "../models/children";
import { AppDataSource } from "../config/database";

const childRepository = AppDataSource.getRepository(Child);
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
        child: {
          id: child.id,
          username: child.username,
          displayName: child.displayName,
          avatarUrl: child.avatarUrl,
          totalPoints: child.totalPoints,
          currentStreak: child.currentStreak,
          familyId: child.family?.id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
