import express from "express";
import {
  childLogin,
  getEnrolledCourses,
  getCourseDetails,
  getAvailableCourses,
  enrollInCourse,
  updateLessonProgress,
  getRecommendedCourses,
  getChildProgress,
} from "../controllers/child_controller";
import { authenticateChild } from "../middlewares/authorized";

const router: any = express.Router();

router.post("/login", childLogin);

router.use(authenticateChild); // All routes below this will require child authentication

// Enrolled courses
router.get("/courses/enrolled", getEnrolledCourses);
router.get("/courses/:courseId", getCourseDetails);

// Available courses
router.get("/courses/available", getAvailableCourses);
router.get("/courses/all/recommended", getRecommendedCourses);

// Enrollment actions
router.post("/courses/:courseId/enroll", enrollInCourse);

// Progress tracking
router.patch(
  "/courses/:courseId/lessons/:lessonId/progress",
  updateLessonProgress
);

router.get("/courses/:courseId/progress", authenticateChild, getChildProgress);

export default router;
