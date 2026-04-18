import express from "express";
import verify from "../middleware/verify.middleware";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/user.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management — all routes require authentication
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get my profile
 *     description: >
 *       Returns the authenticated user's profile. Password is never included.
 *       Note: Users cannot update their own role via this endpoint — use the admin
 *       `PATCH /api/auth/users/:userId/role` route instead.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *                   example: "Profile fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               status: success
 *               message: "Profile fetched successfully"
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 role: "customer"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized — token missing, expired, or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: No token provided
 *                 value:
 *                   status: failed
 *                   message: "Unauthorized, no token provided"
 *               expiredToken:
 *                 summary: Expired token
 *                 value:
 *                   status: failed
 *                   message: "Token has expired, please login again"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Internal server error, failed to fetch profile"
 */
router.get("/profile", verify, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update my profile
 *     description: >
 *       Updates the authenticated user's profile. All fields are optional — provide
 *       only what you want to change. At least one field must be provided.
 *       The `role` field **cannot** be updated via this endpoint.
 *       If a new password is provided, it will be hashed before saving.
 *       If a new email is provided, it must not already belong to another user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             updateName:
 *               summary: Update first and last name
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *             updateEmail:
 *               summary: Update email only
 *               value:
 *                 email: "newemail@example.com"
 *             updatePassword:
 *               summary: Update password only
 *               value:
 *                 password: "newpassword123"
 *             updateAll:
 *               summary: Update all fields
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 email: "jane@example.com"
 *                 password: "newpassword123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               status: success
 *               message: "Profile updated successfully"
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 email: "jane@example.com"
 *                 role: "customer"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noFields:
 *                 summary: No fields provided
 *                 value:
 *                   status: failed
 *                   message: "At least one field (firstName, lastName, email, or password) must be provided for update"
 *               roleNotAllowed:
 *                 summary: Attempted to update role
 *                 value:
 *                   status: failed
 *                   message: "You are not allowed to update the role field"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Unauthorized, no token provided"
 *       409:
 *         description: Email already in use by another account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Email is already in use"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               error: "Internal server error, failed to update profile"
 */
router.put("/profile", verify, updateProfile);

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete my account
 *     description: >
 *       **Permanently deletes** the authenticated user's account.
 *       Also removes all reviews submitted by this user from every restaurant.
 *       Clears the authentication cookie. This action is **irreversible**.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account and all associated review data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *             example:
 *               status: success
 *               message: "Account and associated data deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Internal server error, failed to delete profile"
 */
router.delete("/profile", verify, deleteProfile);

export default router;
