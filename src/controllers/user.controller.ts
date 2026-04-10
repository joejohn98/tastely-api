import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/user.model";
import {
  updateProfileInput,
  updateProfileSchema,
} from "../validators/user.validators";

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        status: "failed",
        message: "Unauthorized",
      });
      return;
    }

    if (!isValidObjectId(userId.toString())) {
      res.status(400).json({
        status: "failed",
        message: "Invalid user ID",
      });
      return;
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      res.status(404).json({
        status: "failed",
        message: "User not found",
      });
      return;
    }
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Profile fetched successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error, failed to fetch profile",
    });
  }
};

const updateProfile = async (
  req: Request<{}, {}, updateProfileInput>,
  res: Response,
): Promise<void> => {
  const userId = req.user?._id.toString();

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized",
    });
    return;
  }

  if (!isValidObjectId(userId)) {
    rse.status(401).json({
      status: "failed",
      message: "Invalid user ID",
    });
    return;
  }

  const parsedData = updateProfileSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      status: "failed",
      message: parsedData.error?.issues[0]?.message || "Invalid input",
      errors: z.flattenError(parsedData.error).fieldErrors,
    });
    return;
  }
  const { firstName, lastName, email, password } = parsedData.data;

  const updateData: Partial<updateProfileInput> = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;
  if (password) updateData.password = password;

  try {
    // Check if the new email already belongs to another user
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
      });

      if (existingUser && existingUser._id.toString() !== userId) {
        res.status(409).json({
          status: "failed",
          error: "Email is already in use",
        });
        return;
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    ).select("-__v");

    if (!user) {
      res.status(404).json({
        status: "failed",
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.log("error updating profile", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error, failed to update profile",
    });
  }
};

export { getProfile, updateProfile };
