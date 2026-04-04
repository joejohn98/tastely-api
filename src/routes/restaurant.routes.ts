import { Router } from "express";
import { createRestaurant, readAllRestaurants, readRestaurantsByCuisine, updateRestaurant } from "../controllers/restaurant.controller";

const router = Router();

router.post("/", createRestaurant);

router.get("/", readAllRestaurants);

router.get("/cuisine/:cuisineType", readRestaurantsByCuisine);

router.put("/:restaurantId", updateRestaurant);

export default router;
