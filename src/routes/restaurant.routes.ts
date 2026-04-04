import { Router } from "express";
import { createRestaurant, readAllRestaurants } from "../controllers/restaurant.controller";

const router = Router();

router.post("/", createRestaurant);

router.get("/", readAllRestaurants);

export default router;
