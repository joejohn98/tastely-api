import { Request, Response } from "express";
import z from "zod";

import Restaurant from "../models/restaurant.model";
import {
  RestaurantReviewInput,
  restaurantReviewSchema,
} from "../validators/restaurant.validators";
import { analyzeSentiment } from "../services/ai.services";
import { isValidObjectId } from "../utils/validation";

const addRestaurantReviewAndRating = async (
  req: Request<{ restaurantId: string }, {}, RestaurantReviewInput>,
  res: Response,
) => {
  const userId = req.user?._id;
  const { restaurantId } = req.params;

  if (!isValidObjectId(restaurantId)) {
    res.status(400).json({
      status: "failed",
      message: "Invalid restaurant ID",
    });
    return;
  }
  const parsed = restaurantReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      status: "failed",
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }
  const { rating, reviewText } = parsed.data;

  let sentiment: "positive" | "neutral" | "negative" | undefined;
  let themes: string[] | undefined;

  try {
    const analysisResult = await analyzeSentiment(reviewText);
    sentiment = analysisResult.sentiment;
    themes = analysisResult.themes;
  } catch (error) {
    console.error("AI sentiment analysis error:", error);
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate(
      "reviews.userId",
      "email",
    );

    if (!restaurant) {
      res.status(404).json({
        status: "fail",
        message: "Restaurant not found",
      });
      return;
    }

    // Check if the user has already reviewed the restaurant
    const existingReviewIndex = restaurant.reviews.findIndex(
      (review) => review.userId?.toString() === userId?.toString(),
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      const existingReview = restaurant.reviews[existingReviewIndex];
      if (existingReview) {
        existingReview.rating = rating;
        existingReview.reviewText = reviewText;
        if (sentiment) existingReview.sentiment = sentiment;
        if (themes) existingReview.themes = themes;
      }
    } else {
      // Add new review
      restaurant.reviews.push({
        userId: userId,
        rating,
        reviewText,
        sentiment,
        themes,
      });
    }
    // Calculate and update the average rating
    const totalRatings = restaurant.reviews.length;
    const totalRatingValue = restaurant.reviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    const averageRating = totalRatingValue / totalRatings;
    restaurant.averageRating = averageRating;

    await restaurant.save();

    res.status(200).json({
      status: "success",
      message: "Review and rating added successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("Error adding review and rating:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to add review and rating",
    });
  }
};

const getUserReviewsForRestaurant = async (
  req: Request<{ restaurantId: string }>,
  res: Response,
) => {
  const userId = req.user?._id;
  const { restaurantId } = req.params;

  if (!isValidObjectId(restaurantId)) {
    res.status(400).json({
      status: "failed",
      message: "Invalid restaurant ID",
    });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
      return;
    }

    const userReview = restaurant.reviews.find(
      (review) => review.userId?.toString() === userId?.toString(),
    );

    if (!userReview) {
      res.status(404).json({
        status: "failed",
        message: "User review not found for this restaurant",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: userReview,
    });
  } catch (error) {
    console.error("Error fetching user review for restaurant:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch user review for restaurant",
    });
  }
};

const getUserReviewsForAllRestaurants = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "User not authenticated",
    });
    return;
  }

  try {
    const restaurants = await Restaurant.find({
      "reviews.userId": userId,
    }).select("-__v");

    if (restaurants.length === 0) {
      res.status(404).json({
        status: "failed",
        message: "No reviews found for this user",
      });
      return;
    }
    // Map through the restaurants and extract the user's review for each restaurant
    const userReviews = restaurants.map((restaurant) => {
      const review = restaurant.reviews.find(
        (rev) => rev.userId?.toString() === userId?.toString(),
      );
      return {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        rating: review?.rating,
        reviewText: review?.reviewText,
      };
    });

    res.status(200).json({
      status: "success",
      results: userReviews.length,
      data: userReviews,
    });
  } catch (error) {
    console.error("Error fetching user reviews for all restaurants:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch user reviews for all restaurants",
    });
  }
};

export {
  addRestaurantReviewAndRating,
  getUserReviewsForRestaurant,
  getUserReviewsForAllRestaurants,
};
