import express from "express";
import { getAIReviewSummary } from "../controllers/ai.controller";
import verify from "../middleware/verify.middleware";

const router = express.Router();

router.get("/:restaurantId/ai-summary", verify, getAIReviewSummary);

export default router;
