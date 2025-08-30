import express from "express";
import { protect, requireAdmin } from "../middlewares/authorized";
import {
  createCourseRequest,
  getCourseRequests,
  getCourseRequestById,
  updateCourseRequest,
  deleteCourseRequest,
  updateCourseRequestStatus,
  getCourseRequestStats,
  voteForCourseRequest,
  removeVoteFromCourseRequest,
  addCommentToCourseRequest,
  getCourseRequestComments,
  deleteComment,
  getUserCourseRequests,
  getUserVotes,
} from "../controllers/course_requests_controller";

const router: any = express.Router();

router.get("/public", getCourseRequests);
router.get("/public/:id", getCourseRequestById);

// Authenticated user routes
router.post("/", protect, createCourseRequest);
router.get("/my/requests", protect, getUserCourseRequests);
router.get("/my/votes", protect, getUserVotes);
router.put("/:id", protect, updateCourseRequest);
router.delete("/:id", protect, deleteCourseRequest);

// Voting routes
router.post("/:id/vote", protect, voteForCourseRequest);
router.delete("/:id/vote", protect, removeVoteFromCourseRequest);

// Comment routes
router.post("/:id/comments", protect, addCommentToCourseRequest);
router.get("/:id/comments", getCourseRequestComments);
router.delete("/:id/comments/:commentId", protect, deleteComment);

// Admin routes
router.patch("/:id/status", protect, requireAdmin, updateCourseRequestStatus);
router.get("/admin/stats", protect, requireAdmin, getCourseRequestStats);

export default router;
