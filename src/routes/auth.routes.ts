import express from "express";

import { login, logout, register, updateUserRole } from "../controllers/auth.controller";
import verify from "../middleware/verify.middleware";
import authorizeRoles from "../middleware/authorize.middleware";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.patch(
  "/users/:userId/role",
  verify,
  authorizeRoles("admin"),
  updateUserRole,
);

export default router;
