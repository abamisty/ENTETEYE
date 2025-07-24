import { Router } from "express";
import {
  updateParentProfile,
  addChild,
  getAllChildren,
  addParentToFamily,
  getFamilyDetails,
  activateFamilySubscription,
  getFamilySubscription,
  enrollChildInCourse,
  getChildEnrollments,
  updateCoursePreferences,
  getChildCourseProgress,
} from "../controllers/parent_controller";
import { protect } from "../middlewares/authorized";

const router: any = Router();

router.patch("/profile", protect, updateParentProfile);

router.post("/children", protect, addChild);
router.get("/children", protect, getAllChildren);

router.post("/family/parents", protect, addParentToFamily);
router.get("/family", protect, getFamilyDetails);

router.post("/subscription", protect, activateFamilySubscription);
router.get("/subscription", protect, getFamilySubscription);

router.post("/enrollments", protect, enrollChildInCourse);
router.get("/children/:childId/enrollments", protect, getChildEnrollments);
router.patch(
  "/enrollments/:enrollmentId/preferences",
  protect,
  updateCoursePreferences
);
router.get(
  "/children/:childId/courses/:courseId/progress",
  protect,
  getChildCourseProgress
);

export default router;
