import { Router } from "express";
import {
  createRestaurant,
  deleteRestaurant,
  readAllRestaurants,
  updateRestaurant,
  readRestaurant,
} from "../controllers/restaurant.controller";

import {
  filterRestaurantsByRating,
  readRestaurantsByCuisine,
  searchRestaurantsByLocation,
} from "../controllers/search.controller";
import {
  addRestaurantReviewAndRating,
  getUserReviewsForAllRestaurants,
  getUserReviewsForRestaurant,
} from "../controllers/review.controller";
import {
  addDishToMenu,
  removeDishFromMenu,
} from "../controllers/menu.controller";

import verify from "../middleware/verify.middleware";
import authorizeRoles from "../middleware/authorize.middleware";

const router = Router();

router.post("/", verify, authorizeRoles("admin"), createRestaurant);

router.get("/", readAllRestaurants);

router.get("/search/", searchRestaurantsByLocation);

router.get("/reviews/", verify, getUserReviewsForAllRestaurants);

router.get("/cuisine/:cuisineType", readRestaurantsByCuisine);

router.get("/rating/:rating", filterRestaurantsByRating);

router.put("/:restaurantId", verify, authorizeRoles("admin"), updateRestaurant);

router.delete(
  "/:restaurantId",
  verify,
  authorizeRoles("admin"),
  deleteRestaurant,
);

router.post("/:restaurantId/review", verify, addRestaurantReviewAndRating);

router.get("/:restaurantId/reviews", verify, getUserReviewsForRestaurant);

router.post("/:restaurantId/menu", addDishToMenu);

router.delete("/:restaurantId/menu/:dishName", removeDishFromMenu);

router.get("/:name", readRestaurant);

export default router;
