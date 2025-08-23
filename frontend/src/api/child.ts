import { api } from "./api";
import { handleApiError } from "./api";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

interface SegmentProgressData {
  isCompleted?: boolean;
  interactionData?: any;
  pointsEarned?: number;
}

export const childCourseApi = {
  async login(credentials: { username: string; password: string }) {
    try {
      const response: ResponseInterface = await api.post(
        "/child/login",
        credentials
      );
      return response;
    } catch (error) {
      handleApiError(error, "Login failed");
      throw error;
    }
  },

  async getEnrolledCourses() {
    try {
      const response: ResponseInterface = await api.get(
        "/child/courses/enrolled"
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch enrolled courses");
      throw error;
    }
  },

  async getCourseDetails(courseId: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/child/courses/${courseId}`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course details");
      throw error;
    }
  },

  async getAvailableCourses(ageGroup?: string) {
    try {
      const params = ageGroup ? { ageGroup } : {};
      const response: ResponseInterface = await api.get(
        "/child/courses/available",
        {
          params,
        }
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch available courses");
      throw error;
    }
  },

  async getRecommendedCourses() {
    try {
      const response: ResponseInterface = await api.get(
        "/child/courses/all/recommended"
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch recommended courses");
      throw error;
    }
  },

  async enrollInCourse(courseId: string) {
    try {
      const response: ResponseInterface = await api.post(
        `/child/courses/${courseId}/enroll`
      );
      toast.success("Successfully enrolled in course", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to enroll in course");
      throw error;
    }
  },

  async updateSegmentProgress(
    courseId: string,
    segmentId: string,
    data: SegmentProgressData
  ) {
    try {
      const response: ResponseInterface = await api.patch(
        `/child/courses/${courseId}/segments/${segmentId}/progress`,
        data
      );
      if (data.isCompleted) {
        toast.success("Segment completed!", successStyles);
      }
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update segment progress");
      throw error;
    }
  },

  async getChildProgress(courseId: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/child/courses/${courseId}/progress`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch child progress");
      throw error;
    }
  },
  async getDashboardData() {
    try {
      const response: ResponseInterface = await api.get("/child/dashboard");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch child progress");
    }
  },
};
