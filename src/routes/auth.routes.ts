import express from "express";

import { createAdmin, login, logout, register, updateUserRole } from "../controllers/auth.controller";
import verify from "../middleware/verify.middleware";
import authorizeRoles from "../middleware/authorize.middleware";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/admin/users", verify, authorizeRoles("admin"), createAdmin);

router.patch(
  "/users/:userId/role",
  verify,
  authorizeRoles("admin"),
  updateUserRole,
);

export default router;
