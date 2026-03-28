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

export { createRestaurant };
