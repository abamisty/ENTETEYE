import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import errorHandlerMiddleware from "./middlewares/errorMiddleware";
import userRoutes from "./routes/user_routes";
import parentRoutes from "./routes/parent_routes";
import courseRoutes from "./routes/course_routes";
import childRoutes from "./routes/child_routes";
import adminRoutes from "./routes/admin_routes";
dotenv.config();

const app = express();

// Cors Setup
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https:enteteye.com",
    "http://localhost:3002",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/parent", parentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/child", childRoutes);
app.use("/api/v1/admin", adminRoutes);

const __uploads_dirname = path.resolve();
app.use("/uploads", express.static(path.join(__uploads_dirname, "/uploads")));

// Routes
app.use("/", (req, res) => {
  res.send("Hello World");
});

// 404 Not Found handler (should come after all other routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Resource Not Found!" });
});

app.use(errorHandlerMiddleware);

export default app;
