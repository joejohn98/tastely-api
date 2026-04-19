import { generateReviewSummary } from "../services/ai.services";
import { Request, Response } from "express";
import mongoose from "mongoose";

import Restaurant from "../models/restaurant.model";

const getAIReviewSummary = async (
  req: Request<{ restaurantId: string }>,
  res: Response,
) => {
  const { restaurantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    res
      .status(400)
      .json({ status: "failed", message: "Invalid restaurant ID" });
    return;
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.reviews.length === 0) {
    res.status(404).json({ status: "failed", message: "No reviews found" });
    return;
  }
  const reviews = restaurant.reviews.map((review) => ({
    reviewText: review.reviewText,
    rating: review.rating,
  }));
  try {
    const summary = await generateReviewSummary(reviews);
    res.status(200).json({ status: "success", summary });
  } catch (err) {
    console.error("Error generating review summary:", err);

    if ((err as any)?.status === 429) {
      res.status(429).json({
        status: "failed",
        message: "AI service rate limit exceeded. Please try again later.",
      });
      return;
    }

    if((err as any)?.status === 503) {
      res.status(503).json({
        status: "failed",
        message: "This model is currently experiencing high demand. Please try again later.",
      });
      return;
    }

    res
      .status(500)
      .json({ status: "failed", message: "Failed to generate summary" });
  }
};

export { getAIReviewSummary };
