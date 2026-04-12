import express from "express";
import { getAIReviewSummary } from "../controllers/ai.controller";

const router = express.Router();

router.get("/:restaurantId/ai-summary", getAIReviewSummary);


export default router;