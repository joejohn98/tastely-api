import express from "express";
import {
  createAdmin,
  login,
  logout,
  register,
  updateUserRole,
} from "../controllers/auth.controller";
import verify from "../middleware/verify.middleware";
import authorizeRoles from "../middleware/authorize.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration, login, logout, and admin-only user management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: >
 *       Creates a new user account with the **customer** role (role is always fixed to
 *       `customer` on self-registration). On success, returns the user object and sets
 *       a JWT **httpOnly cookie** automatically.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               status: success
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 role: "customer"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationFailed:
 *                 summary: Zod validation error
 *                 value:
 *                   message: "Password must be at least 6 characters"
 *                   errors:
 *                     password: ["Password must be at least 6 characters"]
 *               emailExists:
 *                 summary: Email already registered
 *                 value:
 *                   status: failed
 *                   error: "User with this email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Internal server error, failed to register user"
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: >
 *       Authenticates a user and returns the user object. A JWT token is also set as
 *       an **httpOnly cookie** automatically. Use this token in the
 *       `Authorization: Bearer <token>` header for protected routes.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               status: success
 *               message: "User logged in successfully"
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 role: "customer"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationFailed:
 *                 summary: Zod validation error
 *                 value:
 *                   status: failed
 *                   error: "Invalid email address"
 *               userNotFound:
 *                 summary: Email not registered
 *                 value:
 *                   status: failed
 *                   error: "User with this email does not exist"
 *       401:
 *         description: Wrong password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Invalid email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Internal server error, failed to login user"
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     description: Clears the authentication cookie, logging the user out.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *             example:
 *               status: success
 *               message: "User logged out successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Internal server error, failed to logout user"
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/admin/users:
 *   post:
 *     summary: Create a new admin user (admin only)
 *     description: >
 *       Creates a new user with the **admin** role. Only accessible by existing admins.
 *       The `role` field must be set to `"admin"` explicitly in the request body.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Admin user created successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               status: success
 *               message: "Admin user created successfully"
 *               user:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d9"
 *                 firstName: "Admin"
 *                 lastName: "User"
 *                 email: "admin@example.com"
 *                 role: "admin"
 *       400:
 *         description: Validation error or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emailExists:
 *                 summary: Email already registered
 *                 value:
 *                   status: failed
 *                   error: "User with this email already exists"
 *               validationFailed:
 *                 summary: Zod validation error
 *                 value:
 *                   status: failed
 *                   error: "First name is required"
 *       401:
 *         description: Unauthorized — not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Unauthorized, no token provided"
 *       403:
 *         description: Forbidden — caller is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Forbidden: You do not have the necessary permissions."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Internal server error, failed to create admin user"
 */
router.post("/admin/users", verify, authorizeRoles("admin"), createAdmin);

/**
 * @swagger
 * /api/auth/users/{userId}/role:
 *   patch:
 *     summary: Update a user's role (admin only)
 *     description: >
 *       Updates the role of any user to either `"customer"` or `"admin"`.
 *       Only accessible by existing admins.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user whose role should be changed
 *         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *           examples:
 *             promoteToAdmin:
 *               summary: Promote user to admin
 *               value:
 *                 role: "admin"
 *             demoteToCustomer:
 *               summary: Demote admin to customer
 *               value:
 *                 role: "customer"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               status: success
 *               message: "User role updated successfully"
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 role: "admin"
 *       400:
 *         description: Invalid user ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: Malformed ObjectId
 *                 value:
 *                   status: failed
 *                   error: "Invalid user ID"
 *               invalidRole:
 *                 summary: Role not in allowed enum
 *                 value:
 *                   status: failed
 *                   error: "Invalid input"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Unauthorized, no token provided"
 *       403:
 *         description: Forbidden — caller is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Forbidden: You do not have the necessary permissions."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Internal server error, failed to update role"
 */
router.patch(
  "/users/:userId/role",
  verify,
  authorizeRoles("admin"),
  updateUserRole,
);

export default router;
