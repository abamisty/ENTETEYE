import { api } from "./api";
import { handleApiError } from "./api";
import { ResponseInterface } from "@/types/interfaces";
import toast from "react-hot-toast";
import { successStyles } from "@/lib/constants";

interface Character {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  type: string;
  ageGroup: string;
  personalityTraits?: string[];
  voiceSettings?: {
    pitch: number;
    speed: number;
    tone: string;
  };
  visualCustomization?: {
    colorScheme: string;
    outfit: string;
    accessories: string[];
  };
}

interface CreateCharacterData {
  name: string;
  description: string;
  type?: string;
  ageGroup?: string;
  personalityTraits?: string[];
  voiceSettings?: {
    pitch: number;
    speed: number;
    tone: string;
  };
  visualCustomization?: {
    colorScheme: string;
    outfit: string;
    accessories: string[];
  };
}

interface UpdateCharacterData extends Partial<CreateCharacterData> {
  id: string;
}

export const characterApi = {
  async createCharacter(data: CreateCharacterData, file: File) {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      if (data.type) formData.append("type", data.type);
      if (data.ageGroup) formData.append("ageGroup", data.ageGroup);
      if (data.personalityTraits) {
        formData.append(
          "personalityTraits",
          JSON.stringify(data.personalityTraits)
        );
      }
      if (data.voiceSettings) {
        formData.append("voiceSettings", JSON.stringify(data.voiceSettings));
      }
      if (data.visualCustomization) {
        formData.append(
          "visualCustomization",
          JSON.stringify(data.visualCustomization)
        );
      }
      formData.append("file", file);

      const response: ResponseInterface = await api.post(
        "/characters",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Character created successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Character creation failed");
      throw error;
    }
  },

  async updateCharacter(data: UpdateCharacterData, file?: File) {
    try {
      const formData = new FormData();

      // Append individual fields
      if (data.name) formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.type) formData.append("type", data.type);
      if (data.ageGroup) formData.append("ageGroup", data.ageGroup);
      if (data.personalityTraits) {
        formData.append(
          "personalityTraits",
          JSON.stringify(data.personalityTraits)
        );
      }
      if (data.voiceSettings) {
        formData.append("voiceSettings", JSON.stringify(data.voiceSettings));
      }
      if (data.visualCustomization) {
        formData.append(
          "visualCustomization",
          JSON.stringify(data.visualCustomization)
        );
      }
      if (file) {
        formData.append("avatar", file);
      }

      const response: ResponseInterface = await api.put(
        `/characters/${data.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Character updated successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Character update failed");
      throw error;
    }
  },

  async deleteCharacter(id: string) {
    try {
      const response: ResponseInterface = await api.delete(`/characters/${id}`);
      toast.success("Character deleted successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Character deletion failed");
      throw error;
    }
  },

  async getCharacter(id: string) {
    try {
      const response: ResponseInterface = await api.get(`/characters/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch character");
      throw error;
    }
  },

  async getAllCharacters(params?: {
    type?: string;
    ageGroup?: string;
    search?: string;
  }) {
    try {
      const response: ResponseInterface = await api.get("/characters", {
        params,
      });
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch characters");
      throw error;
    }
  },

  async getFeaturedCharacters() {
    try {
      const response: ResponseInterface = await api.get("/characters/featured");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch featured characters");
      throw error;
    }
  },

  async assignCharactersToCourse(courseId: string, characterIds: string[]) {
    try {
      const response: ResponseInterface = await api.post(
        `/courses/${courseId}/characters`,
        { characterIds }
      );
      toast.success("Characters assigned successfully", successStyles);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to assign characters");
      throw error;
    }
  },
};
