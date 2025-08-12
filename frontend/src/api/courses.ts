import { api } from "./api";
import { handleApiError } from "./api";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

interface CourseData {
  title: string;
  description: string;
  ageGroup: "10-12" | "13-15" | "16-18";
  tags?: string[];
  learningObjectives?: string[];
  thumbnailUrl?: string;
}

interface ModuleData {
  title: string;
  description: string;
  order?: number;
}

interface LessonData {
  title: string;
  description: string;
  type: "video" | "interactive" | "quiz" | "reading" | "activity";
  order?: number;
  videoUrl?: string;
  quiz?: any;
  activity?: any;
  readingContent?: string;
  durationMinutes?: number;
}

export const courseApi = {
  // Course operations
  async createCourse(data: any) {
    try {
      const response: ResponseInterface = await api.post("/courses", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Course created successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Course creation failed");
      throw error;
    }
  },

  async updateCourse(id: string, updates: any) {
    try {
      console.log(updates);
      const response: ResponseInterface = await api.put(
        `/courses/${id}`,
        updates,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Course updated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Course update failed");
      throw error;
    }
  },

  async deleteCourse(id: string) {
    try {
      const response: ResponseInterface = await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Course deletion failed");
      throw error;
    }
  },

  async getCourse(id: string) {
    try {
      const response: ResponseInterface = await api.get(`/courses/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch course");
      throw error;
    }
  },

  async listCourses(params?: {
    ageGroup?: string;
    search?: string;
    tags?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response: ResponseInterface = await api.get("/courses", { params });
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch courses");
      throw error;
    }
  },

  async approveCourse(id: string) {
    try {
      const response: ResponseInterface = await api.patch(
        `/courses/${id}/approve`
      );
      toast.success("Course approved successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Course approval failed");
      throw error;
    }
  },

  // Module operations
  async createModule(courseId: string, data: ModuleData) {
    try {
      const response: ResponseInterface = await api.post(
        `/courses/${courseId}/modules`,
        data
      );
      toast.success("Module created successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Module creation failed");
      throw error;
    }
  },

  async updateModuleOrder(
    courseId: string,
    modules: Array<{ id: string; order: number }>
  ) {
    try {
      const response: ResponseInterface = await api.patch(
        `/courses/${courseId}/modules/order`,
        { modules }
      );
      return response;
    } catch (error) {
      handleApiError(error, "Module order update failed");
      throw error;
    }
  },

  // Lesson operations
  async createLesson(moduleId: string, data: LessonData) {
    try {
      const response: ResponseInterface = await api.post(
        `/courses/modules/${moduleId}/lessons`,
        data
      );
      toast.success("Lesson created successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Lesson creation failed");
      throw error;
    }
  },

  async uploadLessonVideo(lessonId: string, videoFile: File) {
    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response: ResponseInterface = await api.post(
        `/lessons/${lessonId}/video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Video uploaded successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Video upload failed");
      throw error;
    }
  },
};
