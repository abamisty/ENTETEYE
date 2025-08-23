import express from "express";
import { protect, requireAdmin } from "../middlewares/authorized";
import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacter,
  getAllCharacters,
} from "../controllers/character_controller";
import { uploadSingleFile } from "../config/multer";

const router: any = express.Router();

router.post("/", protect, requireAdmin, uploadSingleFile, createCharacter);
router.put("/:id", protect, requireAdmin, uploadSingleFile, updateCharacter);
router.delete("/:id", protect, requireAdmin, deleteCharacter);

// Public routes (read-only)
router.get("/", protect, getAllCharacters);
router.get("/:id", protect, getCharacter);

export default router;
