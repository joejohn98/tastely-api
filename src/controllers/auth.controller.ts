import {Request, Response} from "express";
import User from "../models/user.model";
import generateToken from "../utils/generateToken";

const register = async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({
      message: "All fields are required",
    });
    return;
  }

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
}


export { register };