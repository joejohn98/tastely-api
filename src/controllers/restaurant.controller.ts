import { Request, Response } from "express";
import mongoose from "mongoose";

import Restaurant from "../models/restaurant.model";

const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  const { name, cuisine, address, city, rating, menu, averageRating } =
    req.body;

  if (
    !name ||
    !cuisine ||
    !address ||
    !city ||
    !rating ||
    !menu ||
    !averageRating
  ) {
    res.status(400).json({
      message: "All fields are required",
    });
    return;
  }

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

const readRestaurantsByCuisine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { cuisineType } = req.params;

  if (!cuisineType) {
    res.status(400).json({
      status: "failed",
      message: "Cuisine type is required",
    });
    return;
  }

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

const updateRestaurant = async (
  req: Request<{ restaurantId: string }, {}, {}>,
  res: Response,
): Promise<void> => {
  const { restaurantId } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    res.status(400).json({
      status: "failed",
      message: "Invalid restaurant ID format",
    });
    return;
  }

  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
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

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
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

const searchRestaurantsByLocation = async (
  req: Request<{ location?: string }>,
  res: Response,
): Promise<void> => {
  let location = req.query.location as string;

  if (Array.isArray(location)) {
    location = location[0]; // Take the first value if multiple location parameters are provided
  }

  if (!location) {
    res.status(400).json({
      status: "failed",
      message: "Location query parameter is required",
    });
    return;
  }

  try {
    const restaurants = await Restaurant.find({ city: location });
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
  const rating = parseFloat(req.params.rating);

  if (isNaN(rating) || rating < 0 || rating > 5) {
    res.status(400).json({
      status: "failed",
      message: "Invalid rating value. Rating must be a number between 0 and 5.",
    });
    return;
  }

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
  createRestaurant,
  readAllRestaurants,
  readRestaurantsByCuisine,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurantsByLocation,
  filterRestaurantsByRating,
};
