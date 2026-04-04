import { Request, Response } from "express";
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

const readAllRestaurants = async (req: Request, res: Response): Promise<void> => {
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
}

const readRestaurantsByCuisine = async (req: Request, res: Response): Promise<void> => {

  const {cuisineType} = req.params;

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
}

export { createRestaurant, readAllRestaurants, readRestaurantsByCuisine };
