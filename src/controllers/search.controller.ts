import { Request, Response } from "express";
import z from "zod";

import Restaurant from "../models/restaurant.model";
import {
  cuisineTypeParamSchema,
  ratingParamSchema,
} from "../validators/restaurant.validators";

const readRestaurantsByCuisine = async (
  req: Request<{ cuisineType: string }, {}, {}>,
  res: Response,
): Promise<void> => {
  const parsedParams = cuisineTypeParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json({
      message:
        parsedParams.error.issues[0]?.message || "Cuisine is required in path",
    });
    return;
  }

  const { cuisineType } = parsedParams.data;

  try {
    const restaurants = await Restaurant.find({ cuisine: cuisineType });
    if (restaurants.length === 0) {
      res.status(404).json({
        status: "failed",
        message: "No restaurants found for this cuisine",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      results: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error reading restaurants by cuisine:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to get restaurants by cuisine",
    });
  }
};

const searchRestaurantsByLocation = async (
  req: Request<{ location?: string }>,
  res: Response,
): Promise<void> => {
  let location = req.query.location as string;

  if (Array.isArray(location)) {
    location = location[0]; // Take the first value if multiple location parameters are provided
  }

  // Validate location
  const locationSchema = z
    .string()
    .trim()
    .min(1, "Location is required in query");
  const parsedLocation = locationSchema.safeParse(location);
  if (!parsedLocation.success) {
    res.status(400).json({
      status: "fail",
      message:
        parsedLocation.error.issues[0]?.message || "Location is required !",
    });
    return;
  }

  try {
    const restaurants = await Restaurant.find({
      city: parsedLocation.data,
    }).select("-__v");
    if (restaurants.length === 0) {
      res.status(404).json({
        status: "failed",
        message: "No restaurants found for this location",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      results: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error searching restaurants by location:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to search restaurants by location",
    });
  }
};

const filterRestaurantsByRating = async (
  req: Request<{ rating: string }>,
  res: Response,
) => {
  const parsed = ratingParamSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      status: "failed",
      message: parsed.error.issues[0]?.message || "Invalid rating value",
    });
    return;
  }

  const { rating } = parsed.data;

  try {
    const restaurants = await Restaurant.find({
      rating: { $gte: rating },
    }).select("-__v");

    if (restaurants.length === 0) {
      res.status(404).json({
        status: "failed",
        message: "No restaurants found with the specified rating",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      results: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error filtering restaurants by rating:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to filter restaurants by rating",
    });
  }
};

export {
  readRestaurantsByCuisine,
  searchRestaurantsByLocation,
  filterRestaurantsByRating,
};
