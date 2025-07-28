import express from "express";
import {
  getAllParents,
  getParentDetails,
  getAllSubscriptions,
  getAllCourses,
  getAllCourseEnrollments,
  getEnrollmentAnalytics,
} from "../controllers/admin_controller";
import { protect, requireAdmin } from "../middlewares/authorized";

const router: any = express.Router();

router.get(
  "/analytics/enrollments",
  protect,
  requireAdmin,
  getEnrollmentAnalytics
);

router.get("/subscriptions", protect, requireAdmin, getAllSubscriptions);

router.get("/courses", protect, requireAdmin, getAllCourses);

router.get("/enrollments", protect, requireAdmin, getAllCourseEnrollments);

router.get("/parents", protect, requireAdmin, getAllParents);
router.get("/parents/:parentId", protect, requireAdmin, getParentDetails);

export default router;
