import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);

export default router;