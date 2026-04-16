import { Request, Response } from "express";
import z from "zod";

import Restaurant from "../models/restaurant.model";
import {
  MenuItemInput,
  menuItemSchema,
  removeDishFromMenuParamsSchema,
} from "../validators/restaurant.validators";
import { isValidObjectId } from "../utils/validation";

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
    addDishToMenu,
    removeDishFromMenu,
}