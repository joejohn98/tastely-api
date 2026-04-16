import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import restaurantRoutes from "./routes/restaurant.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();

app.use(cors({ credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Tastelytics API",
  });
});

// restaurant route
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurants", aiRoutes); // AI route

// auth route
app.use("/api/auth", authRoutes);

// user route
app.use("/api/users", userRoutes);

// Global error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something broke!",
    error: err.message,
  });
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.log("Uncaught Exception:", err);
  process.exit(1);
});

export default app;
