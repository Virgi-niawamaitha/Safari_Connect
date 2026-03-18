import { Router } from "express";
import { assist, chat, health, voice } from "./ai.controller.js";

const router = Router();

router.get("/health", health);
router.post("/assist", assist);
router.post("/chat", chat);
router.post("/voice", voice);

export default router;
