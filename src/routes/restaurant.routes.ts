import { Router } from "express";
import {
  createRestaurant,
  deleteRestaurant,
  readAllRestaurants,
  updateRestaurant,
  readRestaurant,
} from "../controllers/restaurant.controller";
import {
  filterRestaurantsByRating,
  readRestaurantsByCuisine,
  searchRestaurantsByLocation,
} from "../controllers/search.controller";
import {
  addRestaurantReviewAndRating,
  getUserReviewsForAllRestaurants,
  getUserReviewsForRestaurant,
} from "../controllers/review.controller";
import {
  addDishToMenu,
  removeDishFromMenu,
} from "../controllers/menu.controller";
import verify from "../middleware/verify.middleware";
import authorizeRoles from "../middleware/authorize.middleware";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   - name: Restaurants
 *     description: Restaurant CRUD — read is public, write requires admin
 *   - name: Search
 *     description: Search and filter restaurants by location, cuisine, or rating
 *   - name: Reviews
 *     description: Submit and retrieve restaurant reviews (requires authentication)
 *   - name: Menu
 *     description: Manage restaurant menu items (admin only)
 */

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a restaurant (admin only)
 *     description: >
 *       Creates a new restaurant. **Admin role required.**
 *       Duplicate restaurant names are rejected with 409.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRestaurantRequest'
 *           example:
 *             name: "Spice Garden"
 *             cuisine: "Indian"
 *             address: "42 MG Road"
 *             city: "Hyderabad"
 *             rating: 4.2
 *             menu:
 *               - name: "Paneer Tikka"
 *                 price: 250
 *                 description: "Grilled cottage cheese with spices"
 *                 isVeg: true
 *     responses:
 *       201:
 *         description: Restaurant created successfully
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
 *                   example: "Restaurant created successfully"
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Restaurant name is required"
 *               errors:
 *                 name: ["Restaurant name is required"]
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
 *         description: Forbidden — not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Forbidden: You do not have the necessary permissions."
 *       409:
 *         description: Restaurant with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Restaurant with this name already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Failed to create restaurant"
 */
router.post("/", verify, authorizeRoles("admin"), createRestaurant);

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants (public)
 *     description: Returns a list of all restaurants. No authentication required.
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of all restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *             example:
 *               status: success
 *               results: 2
 *               data:
 *                 - _id: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                   name: "Spice Garden"
 *                   cuisine: "Indian"
 *                   city: "Hyderabad"
 *                   rating: 4.2
 *                   averageRating: 4.1
 *                   menu: []
 *                   reviews: []
 *                 - _id: "64f1a2b3c4d5e6f7a8b9c0d3"
 *                   name: "Pasta Palace"
 *                   cuisine: "Italian"
 *                   city: "Mumbai"
 *                   rating: 4.5
 *                   averageRating: 4.3
 *                   menu: []
 *                   reviews: []
 *       404:
 *         description: No restaurants found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: fail
 *               message: "No restaurants found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "failed to fetch all restaurants"
 */
router.get("/", readAllRestaurants);

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH ROUTES (must be declared before /:restaurantId and /:name to avoid conflicts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/restaurants/search:
 *   get:
 *     summary: Search restaurants by city/location (public)
 *     description: >
 *       Searches for restaurants in a specific city. Pass the city name as the
 *       `location` query parameter. The match is **exact** (case-sensitive).
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: City name to search restaurants in
 *         example: "Hyderabad"
 *     responses:
 *       200:
 *         description: Restaurants found for the given location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Location query param missing or empty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: fail
 *               message: "Location is required in query"
 *       404:
 *         description: No restaurants found in the given location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "No restaurants found for this location"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/search/", searchRestaurantsByLocation);

/**
 * @swagger
 * /api/restaurants/reviews:
 *   get:
 *     summary: Get all my reviews across all restaurants
 *     description: >
 *       Returns a summary of all reviews the authenticated user has submitted,
 *       grouped by restaurant. Each entry includes the restaurant name, the user's
 *       rating, and their review text.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All user reviews fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       restaurantId:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                       restaurantName:
 *                         type: string
 *                         example: "Spice Garden"
 *                       rating:
 *                         type: number
 *                         example: 4.5
 *                       reviewText:
 *                         type: string
 *                         example: "Amazing food and great ambiance!"
 *             example:
 *               status: success
 *               results: 2
 *               data:
 *                 - restaurantId: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                   restaurantName: "Spice Garden"
 *                   rating: 4.5
 *                   reviewText: "Amazing food and great ambiance!"
 *                 - restaurantId: "64f1a2b3c4d5e6f7a8b9c0d3"
 *                   restaurantName: "Pasta Palace"
 *                   rating: 3
 *                   reviewText: "Good pasta but service was slow."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "User not authenticated"
 *       404:
 *         description: No reviews found for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "No reviews found for this user"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/reviews/", verify, getUserReviewsForAllRestaurants);

/**
 * @swagger
 * /api/restaurants/cuisine/{cuisineType}:
 *   get:
 *     summary: Get restaurants by cuisine type (public)
 *     description: Returns all restaurants matching the specified cuisine type. Exact match.
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: cuisineType
 *         required: true
 *         schema:
 *           type: string
 *         description: Cuisine type to filter by
 *         example: "Indian"
 *     responses:
 *       200:
 *         description: Restaurants found for the given cuisine
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: cuisineType path param missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Cuisine is required in path"
 *       404:
 *         description: No restaurants found for this cuisine
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "No restaurants found for this cuisine"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/cuisine/:cuisineType", readRestaurantsByCuisine);

/**
 * @swagger
 * /api/restaurants/rating/{rating}:
 *   get:
 *     summary: Filter restaurants by minimum rating (public)
 *     description: Returns all restaurants with a `rating` field **≥** the specified value.
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: rating
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating to filter by (0–5)
 *         example: 4
 *     responses:
 *       200:
 *         description: Restaurants matching the minimum rating
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid rating value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Invalid rating value"
 *       404:
 *         description: No restaurants found with that rating
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "No restaurants found with the specified rating"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/rating/:rating", filterRestaurantsByRating);

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT UPDATE & DELETE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/restaurants/{restaurantId}:
 *   put:
 *     summary: Update a restaurant (admin only)
 *     description: >
 *       Updates a restaurant's details. All fields are optional — send only what
 *       you want to change. **Admin role required.**
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant to update
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Spice Garden Premium"
 *               cuisine:
 *                 type: string
 *                 example: "North Indian"
 *               address:
 *                 type: string
 *                 example: "100 Jubilee Hills"
 *               city:
 *                 type: string
 *                 example: "Hyderabad"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               averageRating:
 *                 type: number
 *                 example: 4.3
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
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
 *                   example: "Restaurant updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid restaurant ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Invalid restaurant ID format"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Forbidden: You do not have the necessary permissions."
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:restaurantId", verify, authorizeRoles("admin"), updateRestaurant);

/**
 * @swagger
 * /api/restaurants/{restaurantId}:
 *   delete:
 *     summary: Delete a restaurant (admin only)
 *     description: Permanently deletes a restaurant and all its data. **Admin role required.**
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant to delete
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *             example:
 *               status: success
 *               message: "Restaurant deleted successfully"
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
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:restaurantId",
  verify,
  authorizeRoles("admin"),
  deleteRestaurant,
);

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/restaurants/{restaurantId}/review:
 *   post:
 *     summary: Add or update a review for a restaurant
 *     description: >
 *       Submits a review and rating for a restaurant. If the user has already
 *       reviewed this restaurant, their existing review is **updated** instead
 *       of creating a duplicate.
 *
 *       **AI enrichment**: Each review is automatically analyzed by Google Gemini to extract:
 *       - `sentiment` — "positive", "neutral", or "negative"
 *       - `themes` — key topics mentioned (e.g. ["food quality", "service", "ambiance"])
 *
 *       The restaurant's `averageRating` is recalculated and saved automatically.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant being reviewed
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewRequest'
 *           example:
 *             rating: 4.5
 *             reviewText: "Amazing food and great ambiance! The paneer tikka was outstanding."
 *     responses:
 *       200:
 *         description: Review added or updated successfully. Returns full restaurant object.
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
 *                   example: "Review and rating added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *             example:
 *               status: success
 *               message: "Review and rating added successfully"
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                 name: "Spice Garden"
 *                 averageRating: 4.5
 *                 reviews:
 *                   - userId: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     rating: 4.5
 *                     reviewText: "Amazing food and great ambiance!"
 *                     sentiment: "positive"
 *                     themes: ["food quality", "ambiance"]
 *       400:
 *         description: Invalid restaurant ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: Bad ObjectId
 *                 value:
 *                   status: failed
 *                   message: "Invalid restaurant ID"
 *               validationFailed:
 *                 summary: Missing review text
 *                 value:
 *                   status: failed
 *                   message: "Review text is required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: fail
 *               message: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Failed to add review and rating"
 */
router.post("/:restaurantId/review", verify, addRestaurantReviewAndRating);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/reviews:
 *   get:
 *     summary: Get my review for a specific restaurant
 *     description: >
 *       Returns the authenticated user's own review for the specified restaurant.
 *       Returns 404 if the user hasn't reviewed this restaurant yet.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *     responses:
 *       200:
 *         description: User's review for the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *             example:
 *               status: success
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d6"
 *                 userId: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 rating: 4.5
 *                 reviewText: "Amazing food and great ambiance!"
 *                 sentiment: "positive"
 *                 themes: ["food quality", "ambiance", "service"]
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
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Restaurant not found or user has not reviewed it yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noRestaurant:
 *                 summary: Restaurant not found
 *                 value:
 *                   status: failed
 *                   message: "Restaurant not found"
 *               noReview:
 *                 summary: User has not reviewed this restaurant
 *                 value:
 *                   status: failed
 *                   message: "User review not found for this restaurant"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:restaurantId/reviews", verify, getUserReviewsForRestaurant);

// ─────────────────────────────────────────────────────────────────────────────
// MENU MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu:
 *   post:
 *     summary: Add a dish to the menu (admin only)
 *     description: >
 *       Appends a new dish to a restaurant's menu using MongoDB `$push`.
 *       **Admin role required.**
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItemRequest'
 *           example:
 *             name: "Butter Chicken"
 *             price: 320
 *             description: "Creamy tomato-based chicken curry"
 *             isVeg: false
 *     responses:
 *       200:
 *         description: Dish added to menu. Returns full updated restaurant.
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
 *                   example: "Dish added to menu"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid restaurant ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: Bad ObjectId
 *                 value:
 *                   status: failed
 *                   message: "Invalid restaurant ID"
 *               lowPrice:
 *                 summary: Price below minimum
 *                 value:
 *                   status: failed
 *                   message: "Dish price must be at least 10"
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Failed to add dish to menu"
 */
router.post("/:restaurantId/menu", addDishToMenu);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/{dishName}:
 *   delete:
 *     summary: Remove a dish from the menu (admin only)
 *     description: >
 *       Removes a dish by name from a restaurant's menu using MongoDB `$pull`.
 *       The dish name must match exactly (case-sensitive). **Admin role required.**
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant
 *         example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *       - in: path
 *         name: dishName
 *         required: true
 *         schema:
 *           type: string
 *         description: Exact name of the dish to remove (case-sensitive)
 *         example: "Paneer Tikka"
 *     responses:
 *       200:
 *         description: Dish removed from menu. Returns full updated restaurant.
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
 *                   example: "Dish removed from menu"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid restaurant ID or dish name missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Invalid restaurant ID"
 *       404:
 *         description: Restaurant or dish not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               restaurantNotFound:
 *                 summary: Restaurant doesn't exist
 *                 value:
 *                   status: failed
 *                   message: "Restaurant not found"
 *               dishNotFound:
 *                 summary: Dish not on menu
 *                 value:
 *                   status: failed
 *                   message: "Dish not found in restaurant menu"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Failed to remove dish from menu"
 */
router.delete("/:restaurantId/menu/:dishName", removeDishFromMenu);

// ─────────────────────────────────────────────────────────────────────────────
// GET BY NAME (must be LAST to avoid swallowing other /:param routes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/restaurants/{name}:
 *   get:
 *     summary: Get a restaurant by name (public)
 *     description: >
 *       Looks up a single restaurant by its exact name. **Note:** In the actual
 *       route file this is registered as `GET /:name` — use the restaurant's full
 *       name as the path segment (spaces must be URL-encoded as `%20`).
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Exact restaurant name (case-sensitive)
 *         example: "Spice Garden"
 *     responses:
 *       200:
 *         description: Restaurant found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *             example:
 *               status: success
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                 name: "Spice Garden"
 *                 cuisine: "Indian"
 *                 address: "42 MG Road"
 *                 city: "Hyderabad"
 *                 rating: 4.2
 *                 averageRating: 4.1
 *       400:
 *         description: Name path param missing or empty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Restaurant name is required in path"
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: failed
 *               message: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:name", readRestaurant);

export default router;