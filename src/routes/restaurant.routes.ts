import { Router } from "express";
import {
  addDishToMenu,
  createRestaurant,
  deleteRestaurant,
  filterRestaurantsByRating,
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

router.get("/rating/:rating", filterRestaurantsByRating)

router.put("/:restaurantId", updateRestaurant);

router.delete("/:restaurantId", deleteRestaurant);

router.post("/:restaurantId/menu", addDishToMenu);



export default router;
