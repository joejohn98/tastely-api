import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (userId: string, res: Response): string => {
  const payload = { id: userId };

  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: (JWT_EXPIRATION || "7d") as any,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};

export default generateToken;
