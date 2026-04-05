import { Request, Response } from "express";
import mongoose from "mongoose";
import z from "zod";

import Restaurant from "../models/restaurant.model";
import {
  CreateRestaurantInput,
  createRestaurantSchema,
  cuisineTypeParamSchema,
  MenuItemInput,
  menuItemSchema,
  ratingParamSchema,
  removeDishFromMenuParamsSchema,
  UpdateRestaurantInput,
  updateRestaurantSchema,
} from "../validators/restaurant.validators";

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createRestaurant = async (
  req: Request<CreateRestaurantInput>,
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

const addDishToMenu = async (
  req: Request<{ restaurantId: string }, {}, MenuItemInput>,
  res: Response,
) => {
  const { restaurantId } = req.params;

  if (!isValidObjectId(restaurantId)) {
    res.status(400).json({
      status: "failed",
      message: "Invalid restaurant ID",
    });
    return;
  }

  const parsed = menuItemSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      status: "failed",
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const { name, description, price, isVeg } = parsed.data;

  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $push: {
          menu: { name, description, price, isVeg },
        },
      },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedRestaurant) {
      res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Dish added to menu",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error adding dish to menu:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to add dish to menu",
    });
  }
};

const removeDishFromMenu = async (
  req: Request<{ restaurantId: string; dishName: string }>,
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

  const parsedParams = removeDishFromMenuParamsSchema.safeParse(
    req.params.dishName,
  );

  if (!parsedParams.success) {
    res.status(400).json({
      status: "failed",
      message: parsedParams.error.issues[0]?.message || "Invalid parameters",
    });
    return;
  }

  const { dishName } = parsedParams.data;

  try {
    const existingRestaurant = await Restaurant.findById(restaurantId);

    const existingDish = existingRestaurant?.menu.some(
      (dish) => dish.name === dishName,
    );

    if (!existingDish) {
      res.status(404).json({
        status: "failed",
        message: "Dish not found in restaurant menu",
      });
      return;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $pull: {
          menu: { name: dishName },
        },
      },
      { returnDocument: "after" },
    );

    if (!updatedRestaurant) {
      res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Dish removed from menu",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error removing dish from menu:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to remove dish from menu",
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
  addDishToMenu,
  removeDishFromMenu,
};
