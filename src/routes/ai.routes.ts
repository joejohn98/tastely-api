import express from "express";
import { getAIReviewSummary } from "../controllers/ai.controller";
import verify from "../middleware/verify.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered analytics using Google Gemini
 */

/**
 * @swagger
 * /api/restaurants/{restaurantId}/ai-summary:
 *   get:
 *     summary: Get an AI-generated summary of all reviews for a restaurant
 *     description: >
 *       Uses **Google Gemini AI** to generate a concise 2–3 sentence summary of all
 *       customer reviews for the specified restaurant. The summary is balanced —
 *       highlighting both common praises and complaints.
 *
 *       **Requirements:**
 *       - The restaurant must exist
 *       - The restaurant must have at least one review
 *       - Authentication is required
 *
 *       **Note:** This endpoint is subject to Gemini API **rate limiting**.
 *       If the limit is exceeded, a `429` response is returned.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant to summarize reviews for
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *     responses:
 *       200:
 *         description: AI review summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 summary:
 *                   type: string
 *                   description: AI-generated 2–3 sentence summary of all reviews
 *                   example: >
 *                     Spice Garden is widely praised for its exceptional North Indian cuisine,
 *                     particularly the Paneer Tikka and Butter Chicken. Customers frequently
 *                     highlight the warm ambiance and attentive service. A few reviewers
 *                     mention occasional wait times during peak hours, though the overall
 *                     experience is rated highly.
 *             example:
 *               status: success
 *               summary: >
 *                 Spice Garden is widely praised for its exceptional North Indian cuisine,
 *                 particularly the Paneer Tikka and Butter Chicken. Customers frequently
 *                 highlight the warm ambiance and attentive service. A few reviewers
 *                 mention occasional wait times during peak hours.
 *       400:
 *         description: Invalid restaurant ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Invalid restaurant ID"
 *       401:
 *         description: Unauthorized — token missing, expired, or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: No token
 *                 value:
 *                   status: failed
 *                   message: "Unauthorized, no token provided"
 *               expiredToken:
 *                 summary: Expired token
 *                 value:
 *                   status: failed
 *                   message: "Token has expired, please login again"
 *       404:
 *         description: Restaurant not found or has no reviews yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "No reviews found"
 *       429:
 *         description: Gemini AI rate limit exceeded — try again later
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "AI service rate limit exceeded. Please try again later."
 *       500:
 *         description: Internal server error or AI generation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Failed to generate summary"
 */
router.get("/:restaurantId/ai-summary", verify, getAIReviewSummary);

export default router;