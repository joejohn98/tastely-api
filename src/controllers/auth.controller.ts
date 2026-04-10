import { Request, Response } from "express";
import mongoose from "mongoose";
import z from "zod";

import bcrypt from "bcryptjs";
import User from "../models/user.model";
import generateToken from "../utils/generateToken";
import {
  CreateAdminUserInput,
  createAdminUserSchema,
  LoginInput,
  loginUserSchema,
  RegisterInput,
  registerUserSchema,
  UpdateUserRoleInput,
  updateUserRoleSchema,
} from "../validators/auth.validators";

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const register = async (
  req: Request<RegisterInput>,
  res: Response,
): Promise<void> => {

  const parsed = registerUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const { firstName, lastName, email, password } = parsed.data;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        status: "failed",
        error: "User with this email already exists",
      });
      return;
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });

    // Generate and set JWT token before saving to database
    const token = generateToken(newUser._id.toString(), res);

    await newUser.save();

    const { password: _, __v, ...userData } = newUser.toObject();

    res.status(201).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    console.log("error to register the user", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error, failed to register user",
    });
  }
};

const login = async (
  req: Request<LoginInput>,
  res: Response,
): Promise<void> => {
  const validate = loginUserSchema.safeParse(req.body);

  if (!validate.success) {
    res.status(400).json({
      status: "failed",
      error: validate.error?.issues[0]?.message || "Invalid input",
      errors: z.flattenError(validate.error).fieldErrors,
    });
    return;
  }

  const { email, password } = validate.data;

  try {
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      res.status(400).json({
        status: "failed",
        error: "User with this email does not exist",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      res.status(401).json({
        status: "failed",
        error: "Invalid email or password",
      });
      return;
    }
    // Generate and set JWT token
    const token = generateToken(existingUser._id.toString(), res);

    // Remove password and __v from the response
    const { password: _, __v, ...userResponse } = existingUser.toObject();

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: userResponse,
    });
  } catch (error) {
    console.log("error to login the user", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error, failed to login user",
    });
  }
};

const logout = (req: Request, res: Response): void => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({
      status: "success",
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("error to logout the user", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error, failed to logout user",
    });
  }
};

const updateUserRole = async (
  req: Request<{ userId: string }, {}, UpdateUserRoleInput>,
  res: Response,
): Promise<void> => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    res.status(400).json({
      status: "failed",
      error: "Invalid user ID",
    });
    return;
  }

  const parsed = updateUserRoleSchema.safeParse(req.body);

    if (!parsed.success) {
    res.status(400).json({
      status: "failed",
      error: parsed.error.issues[0]?.message || "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }
  const { role } = parsed.data;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedUser) {
      res.status(404).json({
        status: "failed",
        error: "User not found",
      });
      return;
    }

    const { password: _, __v, ...userData } = updatedUser.toObject();

    res.status(200).json({
      status: "success",
      message: "User role updated successfully",
      data: userData,
    });
  } catch (error) {
    console.log("error updating user role", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error, failed to update role",
    });
  }
};

const createAdmin = async (req: Request<{}, {}, CreateAdminUserInput>, res: Response): Promise<void> => {
  const userId = req.user?._id;


  if (!userId) {
    res.status(401).json({
      status: "failed",
      error: "Unauthorized, user not authenticated",
    });
    return;
  }

  if (!isValidObjectId(userId.toString())) {
    res.status(400).json({
      status: "failed",
      error: "Invalid user ID",
    });
    return;
  }

  const parsed = createAdminUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      status: "failed",
      error: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const { firstName, lastName, email, password, role } = parsed.data;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        status: "failed",
        error: "User with this email already exists",
      });
      return;
    }

    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    const token = generateToken(newAdmin._id.toString(), res);
    await newAdmin.save();

    res.status(201).json({
      status: "success",
      message: "Admin user created successfully",
      user: {
        _id: newAdmin._id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin user", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error, failed to create admin user",
    });
  }
};

export { register, login, logout, updateUserRole, createAdmin };
