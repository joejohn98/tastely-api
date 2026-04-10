import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import restaurantRoutes from "./routes/restaurant.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors({ credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Tastely API",
  });
});

// restaurant route
app.use("/api/restaurants", restaurantRoutes);

// auth route
app.use("/api/auth", authRoutes);

// user route
app.use("/api/users", userRoutes);
export default app;
