// routes/courseRoutes.ts
import express from "express";
import { protect, requireAdmin } from "../middlewares/authorized";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  listCourses,
  approveCourse,
  createModule,
  updateModuleOrder,
  createLesson,
  uploadLessonVideo,
} from "../controllers/course_controller";
import multer from "multer";
import { uploadSingleFile } from "../config/multer";

const router: any = express.Router();

// Admin-protected routes
router.post("/", protect, requireAdmin, uploadSingleFile, createCourse);
router.put("/:id", protect, requireAdmin, uploadSingleFile, updateCourse);
router.delete("/:id", protect, requireAdmin, deleteCourse);
router.patch("/:id/approve", protect, requireAdmin, approveCourse);

// Module routes (admin only)
router.post("/:courseId/modules", protect, requireAdmin, createModule);
router.patch(
  "/:courseId/modules/order",
  protect,
  requireAdmin,
  updateModuleOrder
);

// Lesson routes (admin only)
router.post("/modules/:moduleId/lessons", protect, requireAdmin, createLesson);
router.post(
  "/lessons/:lessonId/video",
  protect,
  requireAdmin,
  uploadLessonVideo
);

// Public routes
router.get("/", listCourses);
router.get("/:id", getCourse);

export default router;
