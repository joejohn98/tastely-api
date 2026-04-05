import { UserType } from "../models/user.model";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: UserType & Document;
    }
  }
}
