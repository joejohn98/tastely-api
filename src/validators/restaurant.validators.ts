import z from "zod";

const menuItemSchema = z.object({
  name: z.string().trim().min(1, "Dish name is required"),
  price: z.coerce
    .number("Dish price must be a number")
    .pipe(z.number().min(10, "Dish price must be at least 10")),
  description: z
    .string()
    .trim()
    .min(1, "Dish description is required")
    .max(300, "Description cannot exceed 300 characters"),
  isVeg: z.boolean().default(false),
});

const createRestaurantSchema = z.object({
  name: z.string().trim().min(1, "Restaurant name is required"),
  cuisine: z.string().trim().min(1, "Cuisine is required"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  rating: z
    .number("Rating must be a number")
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .default(0),
  menu: z.array(menuItemSchema).default([]),
  averageRating: z
    .number()
    .min(0, "Average rating must be between 0 and 5")
    .max(5, "Average rating must be between 0 and 5")
    .default(0),
});

const updateRestaurantSchema = z.object({
  name: z.string().trim().min(1, "Restaurant name is required").optional(),
  cuisine: z.string().trim().min(1, "Cuisine is required").optional(),
  address: z.string().trim().min(1, "Address is required").optional(),
  city: z.string().trim().min(1, "City is required").optional(),
  rating: z
    .number("Rating must be a number")
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .optional(),
  menu: z.array(menuItemSchema).optional(),
  averageRating: z
    .number()
    .min(0, "Average rating must be between 0 and 5")
    .max(5, "Average rating must be between 0 and 5")
    .optional(),
});

export const cuisineTypeParamSchema = z.object({
  cuisineType: z.string().trim().min(1, "Cuisine type is required in path"),
});

export const ratingParamSchema = z.object({
  rating: z.coerce.number("Rating must be a number").min(0).max(5),
});

export const removeDishFromMenuParamsSchema = z.object({
  dishName: z.string().trim().min(1, "Dish name is required in path"),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export { createRestaurantSchema, updateRestaurantSchema, menuItemSchema };