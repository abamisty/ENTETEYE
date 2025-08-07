import { api } from "./api";
import { handleApiError } from "./api";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

interface ChildData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  username: string;
  gender: string;
}

interface ParentProfileData {
  // Define the fields for parent profile update
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  // Add other parent profile fields as needed
}

interface AddParentToFamilyData {
  email: string;
  // Add other fields if needed
}

interface SubscriptionData {
  planId: string;
  paymentMethodId: string;
  // Add other subscription fields as needed
}

interface MockSubscriptionData {
  plan: "monthly" | "yearly" | "lifetime";
  product: "basic" | "professional";
}

interface EnrollmentData {
  childId: string;
  courseId: string;
}

interface UpdatePreferencesData {
  difficulty?: string;
  notificationEnabled?: boolean;
  dailyGoalMinutes?: number;
}

export const parentApi = {
  async updateProfile(data: ParentProfileData) {
    try {
      const response: ResponseInterface = await api.patch(
        "/parent/profile",
        data
      );
      toast.success("Profile updated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update profile");
      throw error;
    }
  },

  async addChild(childData: ChildData) {
    try {
      const response: ResponseInterface = await api.post("/parent/children", {
        ...childData,
        displayName: `${childData.firstName} ${childData.lastName}`,
      });
      toast.success("Child added successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to add child");
      throw error;
    }
  },

  async getAllChildren() {
    try {
      const response: ResponseInterface = await api.get("/parent/children");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch children");
      throw error;
    }
  },

  async addParentToFamily(data: AddParentToFamilyData) {
    try {
      const response: ResponseInterface = await api.post(
        "/parent/family/parents",
        data
      );
      toast.success("Parent added to family successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to add parent to family");
      throw error;
    }
  },

  async getFamilyDetails() {
    try {
      const response: ResponseInterface = await api.get("/parent/family");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch family details");
      throw error;
    }
  },

  async activateFamilySubscription(data: SubscriptionData) {
    try {
      const response: ResponseInterface = await api.post(
        "/parent/subscription",
        data
      );
      toast.success("Subscription activated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to activate subscription");
      throw error;
    }
  },

  async getFamilySubscription() {
    try {
      const response: ResponseInterface = await api.get("/parent/subscription");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch subscription details");
      throw error;
    }
  },

  // New mock subscription functions
  async createMockSubscription(data: MockSubscriptionData) {
    try {
      const response: ResponseInterface = await api.post(
        "/parent/subscription/mock",
        data
      );
      toast.success(
        `Mock ${data.product} subscription created with free trial`,
        successStyles
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to create mock subscription");
      throw error;
    }
  },

  async cancelMockSubscription() {
    try {
      const response: ResponseInterface = await api.delete(
        "/parent/subscription/mock"
      );
      toast.success("Mock subscription cancelled", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to cancel mock subscription");
      throw error;
    }
  },

  async getMockSubscriptionDetails() {
    try {
      const response: ResponseInterface = await api.get(
        "/parent/subscription/mock"
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch mock subscription details");
      throw error;
    }
  },

  async enrollChildInCourse(data: EnrollmentData) {
    try {
      const response: ResponseInterface = await api.post(
        "/parent/enrollments",
        data
      );
      toast.success("Child enrolled in course successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to enroll child in course");
      throw error;
    }
  },

  async getChildEnrollments(childId: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/parent/children/${childId}/enrollments`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch child's enrollments");
      throw error;
    }
  },

  async updateCoursePreferences(
    enrollmentId: string,
    data: UpdatePreferencesData
  ) {
    try {
      const response: ResponseInterface = await api.patch(
        `/parent/enrollments/${enrollmentId}/preferences`,
        data
      );
      toast.success("Course preferences updated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update course preferences");
      throw error;
    }
  },

  async getChildCourseProgress(childId: string, courseId: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/parent/children/${childId}/courses/${courseId}/progress`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course progress");
      throw error;
    }
  },

  async deleteChild(childId: string) {
    try {
      const response: ResponseInterface = await api.delete(
        `/parent/children/${childId}`
      );
      toast.success("Child deleted successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getChild(childId: string) {
    try {
      const response: ResponseInterface = await api.get(
        `/parent/children/${childId}`
      );
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch child details");
      throw error;
    }
  },

  async updateChild(childId: string, childData: ChildData) {
    try {
      const response: ResponseInterface = await api.patch(
        `/parent/children/${childId}`,
        {
          ...childData,
          displayName: `${childData.firstName} ${childData.lastName}`,
        }
      );
      toast.success("Child updated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to update child");
      throw error;
    }
  },
};
