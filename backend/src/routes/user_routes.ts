import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  changePassword,
} from "../controllers/user_controller";
import { protect } from "../middlewares/authorized";

const router: any = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/refresh", refreshToken);
router.get("/logout", logout);
router.patch("/change-password", protect, changePassword);

export default router;
