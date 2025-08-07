import { Router } from "express";
import {
  updateParentProfile,
  addChild,
  getAllChildren,
  getChild,
  updateChild,
  addParentToFamily,
  getFamilyDetails,
  activateFamilySubscription,
  getFamilySubscription,
  enrollChildInCourse,
  getChildEnrollments,
  updateCoursePreferences,
  getChildCourseProgress,
  deleteChild,
  createMockSubscription,
  cancelMockSubscription,
  getMockSubscriptionDetails,
} from "../controllers/parent_controller";
import { protect } from "../middlewares/authorized";

const router: any = Router();

router.patch("/profile", protect, updateParentProfile);

router.post("/children", protect, addChild);
router.get("/children", protect, getAllChildren);
router.get("/children/:childId", protect, getChild);
router.patch("/children/:childId", protect, updateChild);

router.post("/family/parents", protect, addParentToFamily);
router.get("/family", protect, getFamilyDetails);

router.post("/subscription", protect, activateFamilySubscription);
router.get("/subscription", protect, getFamilySubscription);

// New subscription routes
router.post("/subscription/mock", protect, createMockSubscription);
router.delete("/subscription/mock", protect, cancelMockSubscription);
router.get("/subscription/mock", protect, getMockSubscriptionDetails);

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

router.delete("/children/:childId", protect, deleteChild);

export default router;
