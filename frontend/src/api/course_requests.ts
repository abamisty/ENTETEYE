import { api } from "./api";
import { handleApiError } from "./api";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

export interface CourseRequestData {
  title: string;
  description: string;
  suggestedTags?: string[];
  suggestedAgeGroup?: "10-12" | "13-15" | "16-18";
  suggestedObjectives?: string[];
  rationale?: string;
  realWorldApplication?: string;
}

export interface CourseRequestStatusUpdate {
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "implemented"
    | "duplicate";
  rejectionReason?: string;
  adminNotes?: string;
  implementedCourseId?: string;
}

export interface CourseRequestCommentData {
  content: string;
  isAdminComment?: boolean;
}

export interface CourseRequestFilters {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export const courseRequestApi = {
  // Create a new course request
  async createCourseRequest(data: CourseRequestData) {
    try {
      const response: ResponseInterface = await api.post(
        "/course-requests",
        data
      );
      toast.success("Course request submitted successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to submit course request");
      throw error;
    }
  },

  // Get all course requests with optional filtering
  async getCourseRequests(filters?: CourseRequestFilters) {
    try {
      const params = new URLSearchParams();

      const response: ResponseInterface = await api.get(
        `/course-requests/public `
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course requests");
      throw error;
    }
  },

  async getMyCourseRequests(filters?: CourseRequestFilters) {
    try {
      const params = new URLSearchParams();

      const response: ResponseInterface = await api.get(
        `/course-requests/my/requests `
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course requests");
      throw error;
    }
  },

  // Get specific course request by ID
  async getCourseRequestById(id: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/course-requests/public/${id}`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course request");
      throw error;
    }
  },

  // Update user's own course request
  async updateCourseRequest(id: string, data: Partial<CourseRequestData>) {
    try {
      const response: ResponseInterface = await api.put(
        `/course-requests/${id}`,
        data
      );
      toast.success("Course request updated successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update course request");
      throw error;
    }
  },

  // Delete user's own course request
  async deleteCourseRequest(id: string) {
    try {
      const response: ResponseInterface = await api.delete(
        `/course-requests/${id}`
      );
      toast.success("Course request deleted successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to delete course request");
      throw error;
    }
  },

  // Vote for a course request
  async voteForCourseRequest(id: string) {
    try {
      const response: ResponseInterface = await api.post(
        `/course-requests/${id}/vote`
      );
      toast.success("Vote submitted successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to vote for course request");
      throw error;
    }
  },

  // Remove vote from a course request
  async removeVoteFromCourseRequest(id: string) {
    try {
      const response: ResponseInterface = await api.delete(
        `/course-requests/${id}/vote`
      );
      toast.success("Vote removed successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to remove vote");
      throw error;
    }
  },

  // Add comment to a course request
  async addCommentToCourseRequest(id: string, data: CourseRequestCommentData) {
    try {
      const response: ResponseInterface = await api.post(
        `/course-requests/${id}/comments`,
        data
      );
      toast.success("Comment added successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to add comment");
      throw error;
    }
  },

  // Get comments for a course request
  async getCourseRequestComments(id: string, page?: number, limit?: number) {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const response: ResponseInterface = await api.get(
        `/course-requests/${id}/comments${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch comments");
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(requestId: string, commentId: string) {
    try {
      const response: ResponseInterface = await api.delete(
        `/course-requests/${requestId}/comments/${commentId}`
      );
      toast.success("Comment deleted successfully!", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to delete comment");
      throw error;
    }
  },

  // Get user's own course requests
  async getUserCourseRequests(filters?: Omit<CourseRequestFilters, "search">) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const response: ResponseInterface = await api.get(
        `/course-requests/my/requests${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch your course requests");
      throw error;
    }
  },

  // Get user's votes
  async getUserVotes() {
    try {
      const response: ResponseInterface = await api.get(
        "/course-requests/my/votes"
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch your votes");
      throw error;
    }
  },

  // Admin: Update course request status
  async updateCourseRequestStatus(id: string, data: CourseRequestStatusUpdate) {
    try {
      const response: ResponseInterface = await api.patch(
        `/course-requests/${id}/status`,
        data
      );
      toast.success(
        "Course request status updated successfully!",
        successStyles
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update course request status");
      throw error;
    }
  },

  // Admin: Get course request statistics
  async getCourseRequestStats() {
    try {
      const response: ResponseInterface = await api.get(
        "/course-requests/admin/stats"
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course request statistics");
      throw error;
    }
  },

  // Check if user has voted for a specific request
  async checkUserVoteStatus(requestId: string) {
    try {
      const votes = await this.getUserVotes();
      return (
        votes.data?.some((vote: any) => vote.courseRequest.id === requestId) ||
        false
      );
    } catch (error) {
      return false;
    }
  },

  // Get popular course requests (sorted by votes)
  async getPopularCourseRequests(limit: number = 10) {
    try {
      const response: ResponseInterface = await this.getCourseRequests({
        sortBy: "voteCount",
        sortOrder: "DESC",
        limit,
      });
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch popular course requests");
      throw error;
    }
  },

  // Get recently added course requests
  async getRecentCourseRequests(limit: number = 10) {
    try {
      const response: ResponseInterface = await this.getCourseRequests({
        sortBy: "createdAt",
        sortOrder: "DESC",
        limit,
      });
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch recent course requests");
      throw error;
    }
  },
};
