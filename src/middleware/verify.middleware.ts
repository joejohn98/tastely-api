import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import User from "../models/user.model";
import { config } from "../config/config";

const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  // Get token from header or cookie
  const authHeader = req.headers.authorization;

  const JWT_SECRET = config.jwtSecret;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const extracted = authHeader.split(" ")[1];
    if (extracted) {
      token = extracted;
    }
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized, no token provided",
    });
    return;
  }

  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Runtime-validate the decoded payload
    if (typeof decoded === "string" || !decoded.id) {
      res.status(401).json({
        status: "failed",
        message: "Invalid token payload",
      });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        status: "failed",
        message: "Unauthorized, user not found",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "failed",
        message: "Token has expired, please login again",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: "failed",
        message: "Invalid token",
      });
      return;
    }

    console.error("Error in auth middleware:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export default verify;
