import { Router } from "express";
import {
  createRestaurant,
  deleteRestaurant,
  readAllRestaurants,
  readRestaurantsByCuisine,
  searchRestaurantsByLocation,
  updateRestaurant,
} from "../controllers/restaurant.controller";

const router = Router();

router.post("/", createRestaurant);

router.get("/", readAllRestaurants);

router.get("/search/", searchRestaurantsByLocation);

router.get("/cuisine/:cuisineType", readRestaurantsByCuisine);

router.put("/:restaurantId", updateRestaurant);

router.delete("/:restaurantId", deleteRestaurant);


export default router;
