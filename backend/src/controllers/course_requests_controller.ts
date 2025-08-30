import { AppDataSource } from "../config/database";
import { CourseRequest, CourseRequestStatus } from "../models/course_requests";
import { CourseRequestVote } from "../models/course_requests";
import { CourseRequestComment } from "../models/course_requests";
import { User } from "../models/user";
import { Course } from "../models/courses";
import { NextFunction, Request, Response } from "express";

const courseRequestRepository = AppDataSource.getRepository(CourseRequest);
const courseRequestVoteRepository =
  AppDataSource.getRepository(CourseRequestVote);
const courseRequestCommentRepository =
  AppDataSource.getRepository(CourseRequestComment);
const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);

export const createCourseRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      suggestedTags,
      suggestedAgeGroup,
      suggestedObjectives,
      rationale,
      realWorldApplication,
    } = req.body;

    const userId = (req as any).user.id;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const courseRequest = new CourseRequest();
    courseRequest.title = title;
    courseRequest.description = description;
    courseRequest.suggestedTags = suggestedTags || [];
    courseRequest.suggestedAgeGroup = suggestedAgeGroup;
    courseRequest.suggestedObjectives = suggestedObjectives || [];
    courseRequest.rationale = rationale;
    courseRequest.realWorldApplication = realWorldApplication;
    courseRequest.requestedBy = user;
    courseRequest.status = CourseRequestStatus.PENDING;

    const savedRequest = await courseRequestRepository.save(courseRequest);

    res.status(201).json({
      success: true,
      message: "Course request submitted successfully",
      data: savedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const query = courseRequestRepository
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.requestedBy", "requestedBy")
      .leftJoinAndSelect("request.reviewedBy", "reviewedBy")
      .leftJoinAndSelect("request.votes", "votes")
      .leftJoinAndSelect("request.comments", "comments")
      .loadRelationCountAndMap("request.commentCount", "request.comments")
      .loadRelationCountAndMap("request.voteCount", "request.votes");

    if (status) {
      query.andWhere("request.status = :status", { status });
    }

    if (search) {
      query.andWhere(
        "(request.title ILIKE :search OR request.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    query.orderBy(`request.${sortBy}`, sortOrder as "ASC" | "DESC");
    query.skip(skip).take(Number(limit));

    const [requests, total] = await query.getManyAndCount();

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const request = await courseRequestRepository.findOne({
      where: { id },
      relations: [
        "requestedBy",
        "reviewedBy",
        "votes",
        "votes.user",
        "comments",
        "comments.author",
      ],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Course request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourseRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updateData = req.body;

    const request = await courseRequestRepository.findOne({
      where: { id },
      relations: ["requestedBy"],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Course request not found",
      });
    }

    // Only the original requester can update their own pending requests
    if (request.requestedBy.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own course requests",
      });
    }

    // Only allow updates to pending requests
    if (request.status !== CourseRequestStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Cannot update a request that is no longer pending",
      });
    }

    // Remove fields that shouldn't be updated
    const { status, voteCount, reviewedBy, reviewedAt, ...allowedUpdates } =
      updateData;

    await courseRequestRepository.update(id, allowedUpdates);

    const updatedRequest = await courseRequestRepository.findOne({
      where: { id },
      relations: ["requestedBy", "reviewedBy"],
    });

    res.status(200).json({
      success: true,
      message: "Course request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourseRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const request = await courseRequestRepository.findOne({
      where: { id },
      relations: ["requestedBy"],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Course request not found",
      });
    }

    // Only the original requester can delete their own pending requests
    if (request.requestedBy.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own course requests",
      });
    }

    // Only allow deletion of pending requests
    if (request.status !== CourseRequestStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a request that is no longer pending",
      });
    }

    await courseRequestRepository.remove(request);

    res.status(200).json({
      success: true,
      message: "Course request deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourseRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes, implementedCourseId } =
      req.body;
    const userId = (req as any).user.id;

    const request = await courseRequestRepository.findOne({ where: { id } });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Course request not found",
      });
    }

    const adminUser = await userRepository.findOne({ where: { id: userId } });
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update request status",
      });
    }

    const updateData: any = {
      status,
      reviewedBy: adminUser,
      reviewedAt: new Date(),
    };

    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (implementedCourseId) {
      // Verify the course exists
      const course = await courseRepository.findOne({
        where: { id: implementedCourseId },
      });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Implemented course not found",
        });
      }
      updateData.implementedCourseId = implementedCourseId;
    }

    await courseRequestRepository.update(id, updateData);

    const updatedRequest = await courseRequestRepository.findOne({
      where: { id },
      relations: ["requestedBy", "reviewedBy"],
    });

    res.status(200).json({
      success: true,
      message: "Course request status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseRequestStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await courseRequestRepository
      .createQueryBuilder("request")
      .select("request.status", "status")
      .addSelect("COUNT(request.id)", "count")
      .groupBy("request.status")
      .getRawMany();

    const total = await courseRequestRepository.count();
    const pending = await courseRequestRepository.count({
      where: { status: CourseRequestStatus.PENDING },
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        total,
        pending,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const voteForCourseRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const request = await courseRequestRepository.findOne({ where: { id } });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Course request not found",
      });
    }

    // Check if user already voted
    const existingVote = await courseRequestVoteRepository.findOne({
      where: {
        user: { id: userId },
        courseRequest: { id },
      },
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this request",
      });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const vote = new CourseRequestVote();
    vote.user = user;
    vote.courseRequest = request;

    await courseRequestVoteRepository.save(vote);

    // Update vote count
    const voteCount = await courseRequestVoteRepository.count({
      where: { courseRequest: { id } },
    });
    await courseRequestRepository.update(id, { voteCount });

    res.status(201).json({
      success: true,
      message: "Vote added successfully",
      data: { voteCount },
    });
  } catch (error) {
    next(error);
  }
};

export const removeVoteFromCourseRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const vote = await courseRequestVoteRepository.findOne({
      where: {
        user: { id: userId },
        courseRequest: { id },
      },
    });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    await courseRequestVoteRepository.remove(vote);

    // Update vote count
    const voteCount = await courseRequestVoteRepository.count({
      where: { courseRequest: { id } },
    });
    await courseRequestRepository.update(id, { voteCount });

    res.status(200).json({
      success: true,
      message: "Vote removed successfully",
      data: { voteCount },
    });
  } catch (error) {
    next(error);
  }
};
export const addCommentToCourseRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content, isAdminComment } = req.body;
    const userId = (req as any).user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const request = await courseRequestRepository.findOne({ where: { id } });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Course request not found",
      });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const comment = new CourseRequestComment();
    comment.content = content;
    comment.author = user;
    comment.courseRequest = request;
    comment.isAdminComment = isAdminComment || false;

    const savedComment = await courseRequestCommentRepository.save(comment);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: savedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseRequestComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await courseRequestCommentRepository.findAndCount(
      {
        where: { courseRequest: { id } },
        relations: ["author"],
        order: { createdAt: "ASC" },
        skip,
        take: Number(limit),
      }
    );

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, commentId } = req.params;
    const userId = (req as any).user.id;

    const comment = await courseRequestCommentRepository.findOne({
      where: { id: commentId, courseRequest: { id } },
      relations: ["author"],
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only comment author or admin can delete
    if (comment.author.id !== userId) {
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own comments",
        });
      }
    }

    await courseRequestCommentRepository.remove(comment);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCourseRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const query = courseRequestRepository
      .createQueryBuilder("request")
      .where("request.requestedBy = :userId", { userId })
      .leftJoinAndSelect("request.reviewedBy", "reviewedBy")
      .loadRelationCountAndMap("request.commentCount", "request.comments")
      .loadRelationCountAndMap("request.voteCount", "request.votes");

    if (status) {
      query.andWhere("request.status = :status", { status });
    }

    query.orderBy("request.createdAt", "DESC");
    query.skip(skip).take(Number(limit));

    const [requests, total] = await query.getManyAndCount();

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserVotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const votes = await courseRequestVoteRepository.find({
      where: { user: { id: userId } },
      relations: ["courseRequest"],
    });

    res.status(200).json({
      success: true,
      data: votes,
    });
  } catch (error) {
    next(error);
  }
};
