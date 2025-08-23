import express from "express";
import { protect, requireAdmin } from "../middlewares/authorized";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseWithContent,
  getAllCourses,
  approveCourse,
  createLearningPath,
  createLearningSegment,
  updateLearningPathOrder,
  updateLearningSegmentOrder,
} from "../controllers/course_controller";
import { uploadSingleFile } from "../config/multer";

const router: any = express.Router();

router.post("/", protect, requireAdmin, uploadSingleFile, createCourse);
router.put("/:id", protect, requireAdmin, uploadSingleFile, updateCourse);
router.delete("/:id", protect, requireAdmin, deleteCourse);
router.patch("/:id/approve", protect, requireAdmin, approveCourse);

router.post("/:courseId/paths", protect, requireAdmin, createLearningPath);
router.patch(
  "/:courseId/paths/order",
  protect,
  requireAdmin,
  updateLearningPathOrder
);

router.post(
  "/paths/:pathId/segments",
  protect,
  requireAdmin,
  createLearningSegment
);
router.patch(
  "/paths/:pathId/segments/order",
  protect,
  requireAdmin,
  updateLearningSegmentOrder
);

// Public Access Routes
router.get("/", getAllCourses);
router.get("/:id", getCourseWithContent);

export default router;
