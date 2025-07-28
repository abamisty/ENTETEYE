import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { User, UserRole } from "../models/user";
import { ParentProfile } from "../models/parent";
import { Family } from "../models/family";
import { Child } from "../models/children";
import {
  FamilySubscription,
  SubscriptionPayment,
} from "../models/subscription";
import { AdminProfile } from "../models/admin";
import bcrypt from "bcryptjs";
import { Course, Lesson, Module } from "../models/courses";
import { ChildProgress, Enrollment } from "../models/enrollment";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "qwerty",
  database: process.env.DB_NAME || "enteteye",
  synchronize: true,
  logging: false,

  entities: [
    User,
    ParentProfile,
    Family,
    Child,
    FamilySubscription,
    SubscriptionPayment,
    AdminProfile,
    Lesson,
    Course,
    Module,
    Enrollment,
    ChildProgress,
  ],
  extra: {
    ssl:
      process.env.DB_SSL === "true"
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },
  poolSize: 10,
});

export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established successfully");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error;
  }
}

export async function createAdminUser() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Check if admin already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { email: "admin@gmail.com" },
      relations: ["adminProfile"],
    });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(existingAdmin);
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);

    // Create the admin
    const adminUser = new User();
    adminUser.firstName = "Admin";
    adminUser.lastName = "User";
    adminUser.email = "admin@gmail.com";
    adminUser.password = hashedPassword;
    adminUser.role = UserRole.ADMIN;
    adminUser.isEmailVerified = true;

    const adminProfile = new AdminProfile();
    adminProfile.permissions = ["all"];

    // Save the admin profile first
    const adminProfileRepository = AppDataSource.getRepository(AdminProfile);
    await adminProfileRepository.save(adminProfile);

    // Associate the profile with the user
    adminUser.adminProfile = adminProfile;

    // Save the user
    await userRepository.save(adminUser);

    console.log("Admin user created successfully:");
    console.log({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      createdAt: adminUser.createdAt,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    // Close the database connection
    await AppDataSource.destroy();
  }
}
