import { api } from "./api";
import { handleApiError } from "./api";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

export const adminApi = {
  // Subscription API Functions
  async getAllSubscriptions() {
    try {
      const response: ResponseInterface = await api.get("/admin/subscriptions");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch subscriptions");
    }
  },

  // Course API Functions
  async getAllCourses() {
    try {
      const response: ResponseInterface = await api.get("/admin/courses");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch courses");
    }
  },

  async approveCourse(courseId: string) {
    try {
      const response: ResponseInterface = await api.post(
        `/admin/courses/approve/${courseId}`
      );
      toast.success("Course approved successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to approve course");
    }
  },

  async deleteCourse(courseId: string) {
    try {
      const response: ResponseInterface = await api.delete(
        `/admin/courses/${courseId}`
      );
      toast.success("Course deleted successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to delete course");
    }
  },

  // Enrollment API Functions
  async getAllEnrollments() {
    try {
      const response: ResponseInterface = await api.get("/admin/enrollments");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch enrollments");
    }
  },

  async getEnrollmentAnalytics() {
    try {
      const response: ResponseInterface = await api.get(
        "/admin/analytics/enrollments"
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch enrollment analytics");
    }
  },

  // Parent Management API Functions
  async getAllParents() {
    try {
      const response: ResponseInterface = await api.get("/admin/parents");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch parents");
    }
  },

  async getParentDetails(parentId: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/admin/parents/${parentId}`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch parent details");
    }
  },

  // User Management API Functions
  async getAllUsers() {
    try {
      const response: ResponseInterface = await api.get("/admin/users");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch users");
    }
  },

  async updateUserRole(userId: string, role: string) {
    try {
      const response: ResponseInterface = await api.patch(
        `/admin/users/${userId}/role`,
        { role }
      );
      toast.success("User role updated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update user role");
    }
  },
};
