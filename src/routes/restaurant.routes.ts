import { Router } from "express";
import {
  addDishToMenu,
  removeDishFromMenu,
  createRestaurant,
  deleteRestaurant,
  filterRestaurantsByRating,
  readAllRestaurants,
  readRestaurantsByCuisine,
  searchRestaurantsByLocation,
  updateRestaurant,
} from "../controllers/restaurant.controller";

import verify from "../middleware/verify.middleware";
import authorizeRoles from "../middleware/authorize.middleware";


const router = Router();

router.post("/", verify,
  authorizeRoles("admin"), createRestaurant);

router.get("/", readAllRestaurants);

router.get("/search/", searchRestaurantsByLocation);

router.get("/cuisine/:cuisineType", readRestaurantsByCuisine);

router.get("/rating/:rating", filterRestaurantsByRating);

router.put("/:restaurantId", verify, authorizeRoles("admin"), updateRestaurant);

router.delete("/:restaurantId", verify,
  authorizeRoles("admin"), deleteRestaurant);

router.post("/:restaurantId/menu", addDishToMenu);

router.delete("/:restaurantId/menu/:dishName", removeDishFromMenu);

export default router;
