import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { Character } from "../models/character";
import { UserRole } from "../models/user";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

const characterRepository = AppDataSource.getRepository(Character);

export const createCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      type = "human",
      ageGroup = "adult",
      personalityTraits = [],
      voiceSettings,
      visualCustomization,
    } = req.body;

    // Basic validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    // Handle avatar upload
    let avatarUrl: string;
    if (req.file) {
      avatarUrl = await uploadToCloudinary(req.file);
    } else {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required",
      });
    }

    const character = new Character();
    character.name = name;
    character.description = description;
    character.avatarUrl = avatarUrl;
    character.type = type;
    character.ageGroup = ageGroup;
    character.personalityTraits = Array.isArray(personalityTraits)
      ? personalityTraits
      : JSON.parse(personalityTraits || "[]");

    if (voiceSettings) {
      character.voiceSettings =
        typeof voiceSettings === "string"
          ? JSON.parse(voiceSettings)
          : voiceSettings;
    }

    if (visualCustomization) {
      character.visualCustomization =
        typeof visualCustomization === "string"
          ? JSON.parse(visualCustomization)
          : visualCustomization;
    }

    const savedCharacter = await characterRepository.save(character);

    res.status(201).json({
      success: true,
      data: savedCharacter,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      ageGroup,
      personalityTraits,
      voiceSettings,
      visualCustomization,
    } = req.body;

    const character = await characterRepository.findOneBy({ id });
    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    // Handle avatar update if new file is provided
    if (req.file) {
      const newAvatarUrl = await uploadToCloudinary(req.file);
      character.avatarUrl = newAvatarUrl;
    }

    // Update other fields
    if (name) character.name = name;
    if (description) character.description = description;
    if (type) character.type = type;
    if (ageGroup) character.ageGroup = ageGroup;

    if (personalityTraits) {
      character.personalityTraits = Array.isArray(personalityTraits)
        ? personalityTraits
        : JSON.parse(personalityTraits || "[]");
    }

    if (voiceSettings) {
      character.voiceSettings =
        typeof voiceSettings === "string"
          ? JSON.parse(voiceSettings)
          : voiceSettings;
    }

    if (visualCustomization) {
      character.visualCustomization =
        typeof visualCustomization === "string"
          ? JSON.parse(visualCustomization)
          : visualCustomization;
    }

    const updatedCharacter = await characterRepository.save(character);

    res.status(200).json({
      success: true,
      data: updatedCharacter,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const character = await characterRepository.findOneBy({ id });
    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    await characterRepository.remove(character);

    res.status(200).json({
      success: true,
      message: "Character deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const character = await characterRepository.findOneBy({ id });
    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    res.status(200).json({
      success: true,
      data: character,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCharacters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, ageGroup, search } = req.query;

    const query = characterRepository.createQueryBuilder("character");

    if (type) {
      query.andWhere("character.type = :type", { type });
    }

    if (ageGroup) {
      query.andWhere("character.ageGroup = :ageGroup", { ageGroup });
    }

    if (search) {
      query.andWhere(
        "(character.name LIKE :search OR character.description LIKE :search)",
        { search: `%${search}%` }
      );
    }

    const characters = await query.getMany();

    res.status(200).json({
      success: true,
      data: characters,
    });
  } catch (error) {
    next(error);
  }
};
