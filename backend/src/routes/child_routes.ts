import express from "express";
import {
  childLogin,
  getEnrolledCourses,
  getCourseDetails,
  getAvailableCourses,
  enrollInCourse,
  getRecommendedCourses,
  getChildProgress,
  updateSegmentProgress,
  getDashboardData, // Make sure this is imported
} from "../controllers/child_controller";
import { authenticateChild } from "../middlewares/authorized";

const router: any = express.Router();

router.post("/login", childLogin);

router.use(authenticateChild);

router.get("/dashboard", getDashboardData);
router.get("/courses/enrolled", getEnrolledCourses);
router.get("/courses/:courseId", getCourseDetails);

// Available courses

router.get("/courses/available", getAvailableCourses);
router.get("/courses/all/recommended", getRecommendedCourses);

// Enrollment actions
router.post("/courses/:courseId/enroll", enrollInCourse);

// Progress tracking
router.get("/courses/:courseId/progress", getChildProgress);
router.patch(
  "/courses/:courseId/segments/:segmentId/progress",
  updateSegmentProgress
);

export default router;
