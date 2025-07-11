import { api } from "./api";
import { handleApiError } from "./api";
import { UserRole } from "../types/auth";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
}

interface VerifyEmailData {
  email: string;
  code: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    try {
      const response: ResponseInterface = await api.post(
        "/auth/login",
        credentials
      );
      return response;
    } catch (error) {
      handleApiError(error, "Login failed");
      throw error;
    }
  },

  async register(userData: RegisterData) {
    try {
      const response: ResponseInterface = await api.post(
        "/auth/register",
        userData
      );
      return response;
    } catch (error) {
      handleApiError(error, "Registration failed");
      throw error;
    }
  },

  async verifyEmail(data: VerifyEmailData) {
    try {
      const response: ResponseInterface = await api.post(
        "/auth/verify-email",
        data
      );
      toast.success(response.message, successStyles);
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },

  async forgotPassword(data: ForgotPasswordData) {
    try {
      const response: ResponseInterface = await api.post(
        "/auth/forgot-password",
        data
      );
      return response;
    } catch (error) {
      handleApiError(error, "Password reset request failed");
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordData) {
    try {
      const response: ResponseInterface = await api.post(
        "/auth/reset-password",
        data
      );
      return response;
    } catch (error) {
      handleApiError(error, "Password reset failed");
      throw error;
    }
  },

  async refreshToken() {
    try {
      const response: ResponseInterface = await api.get("/auth/refresh");
      return response;
    } catch (error) {
      handleApiError(error, "Session refresh failed");
      throw error;
    }
  },

  async logout() {
    try {
      const response: ResponseInterface = await api.get("/auth/logout");
      return response;
    } catch (error) {
      handleApiError(error, "Logout failed");
      throw error;
    }
  },

  async changePassword(data: ChangePasswordData) {
    try {
      const response: ResponseInterface = await api.patch(
        "/auth/change-password",
        data
      );
      return response;
    } catch (error) {
      handleApiError(error, "Password change failed");
      throw error;
    }
  },

  // Add role-specific methods
  async getCurrentUser() {
    try {
      const response: ResponseInterface = await api.get("/users/me");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch user data");
      throw error;
    }
  },

  // Admin-specific methods
  async getAllUsers() {
    try {
      const response: ResponseInterface = await api.get("/admin/users");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch users");
      throw error;
    }
  },

  // Parent-specific methods
  async getChildren() {
    try {
      const response: ResponseInterface = await api.get("/parent/children");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch children");
      throw error;
    }
  },

  // Child-specific methods
  async getChildProfile() {
    try {
      const response: ResponseInterface = await api.get("/child/profile");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch child profile");
      throw error;
    }
  },
};
