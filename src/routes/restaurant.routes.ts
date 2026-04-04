import { Router } from "express";
import { createRestaurant, readAllRestaurants, readRestaurantsByCuisine } from "../controllers/restaurant.controller";

const router = Router();

router.post("/", createRestaurant);

router.get("/", readAllRestaurants);

router.get("/cuisine/:cuisineType", readRestaurantsByCuisine);

export default router;
