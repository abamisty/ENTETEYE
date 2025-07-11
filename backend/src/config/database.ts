import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/user";
import { ParentProfile } from "../models/parent";
import { Family } from "../models/family";
import { Child } from "../models/children";
import {
  FamilySubscription,
  SubscriptionPayment,
} from "../models/subscription";
import { AdminProfile } from "../models/admin";

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
