import express from "express";
import { childLogin } from "../controllers/child_controller";

const router: any = express.Router();

router.post("/login", childLogin);

export default router;
