import { Request, Response } from "express";
import z from "zod";

import Restaurant from "../models/restaurant.model";
import {
  CreateRestaurantInput,
  createRestaurantSchema,
  restaurantNameParamSchema,
  UpdateRestaurantInput,
  updateRestaurantSchema,
} from "../validators/restaurant.validators";
import { isValidObjectId } from "../utils/validation";



const createRestaurant = async (
  req: Request<{}, {}, CreateRestaurantInput>,
  res: Response,
): Promise<void> => {
  const parsed = createRestaurantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const { name, cuisine, address, city, rating, menu, averageRating } =
    parsed.data;

  try {
    const existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      res.status(409).json({
        message: "Restaurant with this name already exists",
      });
      return;
    }
    const restaurant = await Restaurant.create({
      name,
      cuisine,
      address,
      city,
      rating,
      menu,
      averageRating,
    });

    res.status(201).json({
      status: "success",
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to create restaurant",
    });
  }
};

const readRestaurant = async (
  req: Request<{ name: string }>,
  res: Response,
): Promise<void> => {
  const parsedParams = restaurantNameParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json({
      status: "failed",
      message:
        parsedParams.error.issues[0]?.message ||
        "Restaurant name is required !",
    });
    return;
  }

  const { name } = parsedParams.data;

  try {
    const restaurant = await Restaurant.findOne({ name });
    if (!restaurant) {
      res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: restaurant,
    });
  } catch (error) {
    console.error("Error reading restaurant:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to get restaurant",
    });
  }
};

const readAllRestaurants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const allRestaurants = await Restaurant.find();
    if (allRestaurants.length === 0) {
      res.status(404).json({
        status: "fail",
        message: "No restaurants found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      results: allRestaurants.length,
      data: allRestaurants,
    });
  } catch (error) {
    console.error("error getting all restaurants", error);
    res.status(500).json({
      status: "failed",
      message: "failed to fetch all restaurants",
    });
  }
};

const updateRestaurant = async (
  req: Request<{ restaurantId: string }, {}, UpdateRestaurantInput>,
  res: Response,
): Promise<void> => {
  const { restaurantId } = req.params;

  if (!isValidObjectId(restaurantId)) {
    res.status(400).json({
      status: "failed",
      message: "Invalid restaurant ID format",
    });
    return;
  }

  const parsed = updateRestaurantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const { name, cuisine, address, city, rating, menu, averageRating } =
    parsed.data;

  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { name, cuisine, address, city, rating, menu, averageRating },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-__v");

    if (!updatedRestaurant) {
      res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error updating the restaurant", error);
    res.status(500).json({
      status: "failed",
      message: "failed to update the restaurant data",
    });
  }
};

const deleteRestaurant = async (
  req: Request<{ restaurantId: string }>,
  res: Response,
): Promise<void> => {
  const { restaurantId } = req.params;

  if (!isValidObjectId(restaurantId)) {
    res.status(400).json({
      status: "failed",
      message: "Invalid restaurant ID",
    });
    return;
  }

  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId);

    if (!deletedRestaurant) {
      res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting the restaurant", error);
    res.status(500).json({
      status: "failed",
      message: "failed to delete the restaurant",
    });
  }
};

export {
  createRestaurant,
  readRestaurant,
  readAllRestaurants,
  updateRestaurant,
  deleteRestaurant,
};
