import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 0,
      max: 5,
      default: 0,
    },

    menu: [
      {
        name: {
          type: String,
          required: [true, "Dish name is required"],
        },
        price: {
          type: Number,
          required: [true, "Dish price is required"],
          min: 10,
        },
        description: {
          type: String,
          required: [true, "Dish description is required"],
          maxLength: [300, "Description cannot exceed 300 characters"],
        },
        isVeg: {
          type: Boolean,
          required: [true, "Dish type is required"],
        },
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: [true, "Rating is required"],
          min: 0,
          max: 5,
        },
        reviewText: {
          type: String,
          required: [true, "Review text is required"],
          trim: true,
          maxLength: [300, "Review cannot exceed 300 characters"],
        },
        sentiment: {
          type: String,
          enum: ["positive", "neutral", "negative"],
          default: "undefined",
        },
        themes: {
          type: [String],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

type RestaurantType = mongoose.InferSchemaType<typeof restaurantSchema>;

export type { RestaurantType };

export default Restaurant;
