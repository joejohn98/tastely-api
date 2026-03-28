import { Router } from "express";
import { createRestaurant } from "../controllers/restaurant.controller";

const router = Router();

router.post("/", createRestaurant);

export default router;
