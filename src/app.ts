import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

import restaurantRoutes from "./routes/restaurant.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Tastely API",
  });
});

// restaurant route
app.use("/api/restaurants", restaurantRoutes);

// auth route
app.use("/api/auth", authRoutes);

export default app;
