import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tastelytics API",
      version: "1.0.0",
      description: `
A comprehensive restaurant management and analytics API built with **Express 5**, **TypeScript**, and **MongoDB**.
Features AI-powered review analysis using **Google Gemini API**.

## Features
- **JWT Authentication** with role-based access control (\`customer\` / \`admin\`)
- **Restaurant Management** — full CRUD (admin only)
- **Menu Management** — add/remove dishes per restaurant (admin only)
- **Review System** — submit, update, and fetch reviews with AI sentiment analysis
- **Search & Filtering** — by location (city), cuisine type, and minimum rating
- **AI Analytics** — AI-generated review summaries via Google Gemini

## Authentication
Two methods are supported:
- **Bearer Token** — \`Authorization: Bearer <token>\` header
- **HTTP Cookie** — \`token\` cookie automatically set on login/register

## Role-Based Access
- \`customer\` — default role on registration. Can read restaurants, submit reviews, manage own profile.
- \`admin\` — can create/update/delete restaurants and menu items, create admin users, change user roles.
      `,
      contact: {
        name: "Tastelytics API",
        url: "https://github.com/joejohn98/tastelytics-api",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
      {
        url: "",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token from /api/auth/login or /api/auth/register",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description:
            "JWT httpOnly cookie set automatically on login/register",
        },
      },
      schemas: {
        // ── User ──────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["customer", "admin"],
              example: "customer",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
          },
        },

        // ── MenuItem ──────────────────────────────────────────
        MenuItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d5" },
            name: { type: "string", example: "Paneer Tikka" },
            price: { type: "number", minimum: 10, example: 250 },
            description: {
              type: "string",
              maxLength: 300,
              example: "Grilled cottage cheese with spices",
            },
            isVeg: { type: "boolean", example: true },
          },
        },

        // ── Review ────────────────────────────────────────────
        Review: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d6" },
            userId: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            rating: { type: "number", minimum: 0, maximum: 5, example: 4.5 },
            reviewText: {
              type: "string",
              maxLength: 300,
              example: "Amazing food and great ambiance!",
            },
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
              example: "positive",
            },
            themes: {
              type: "array",
              items: { type: "string" },
              example: ["food quality", "ambiance", "service"],
            },
          },
        },

        // ── Restaurant ────────────────────────────────────────
        Restaurant: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d2" },
            name: { type: "string", example: "Spice Garden" },
            cuisine: { type: "string", example: "Indian" },
            address: { type: "string", example: "42 MG Road" },
            city: { type: "string", example: "Hyderabad" },
            rating: { type: "number", minimum: 0, maximum: 5, example: 4.2 },
            averageRating: {
              type: "number",
              minimum: 0,
              maximum: 5,
              example: 4.1,
            },
            menu: {
              type: "array",
              items: { $ref: "#/components/schemas/MenuItem" },
            },
            reviews: {
              type: "array",
              items: { $ref: "#/components/schemas/Review" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ── Request Bodies ────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: {
              type: "string",
              example: "John",
              description: "Required, min 1 character",
            },
            lastName: {
              type: "string",
              example: "Doe",
              description: "Required, min 1 character",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "secret123",
              minLength: 6,
              maxLength: 20,
              description:
                "6–20 characters. Role is always 'customer' on self-registration.",
            },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "secret123",
            },
          },
        },

        CreateAdminRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password", "role"],
          properties: {
            firstName: { type: "string", example: "Admin" },
            lastName: { type: "string", example: "User" },
            email: {
              type: "string",
              format: "email",
              example: "admin@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "adminpass123",
              minLength: 6,
              maxLength: 20,
            },
            role: {
              type: "string",
              enum: ["admin"],
              example: "admin",
              description: "Must be 'admin'",
            },
          },
        },

        UpdateUserRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              enum: ["customer", "admin"],
              example: "admin",
            },
          },
        },

        UpdateProfileRequest: {
          type: "object",
          description:
            "All fields optional — at least one required. Role cannot be updated via this endpoint.",
          properties: {
            firstName: { type: "string", example: "Jane" },
            lastName: { type: "string", example: "Smith" },
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "newpass123",
              minLength: 6,
              maxLength: 20,
            },
          },
        },

        CreateRestaurantRequest: {
          type: "object",
          required: ["name", "cuisine", "address", "city"],
          properties: {
            name: { type: "string", example: "Spice Garden" },
            cuisine: { type: "string", example: "Indian" },
            address: { type: "string", example: "42 MG Road" },
            city: { type: "string", example: "Hyderabad" },
            rating: {
              type: "number",
              minimum: 0,
              maximum: 5,
              default: 0,
              example: 4.2,
            },
            averageRating: {
              type: "number",
              minimum: 0,
              maximum: 5,
              default: 0,
              example: 4.1,
            },
            menu: {
              type: "array",
              items: { $ref: "#/components/schemas/MenuItemRequest" },
              default: [],
            },
          },
        },

        MenuItemRequest: {
          type: "object",
          required: ["name", "price", "description"],
          properties: {
            name: { type: "string", example: "Paneer Tikka" },
            price: {
              type: "number",
              minimum: 10,
              example: 250,
              description: "Minimum price: 10",
            },
            description: {
              type: "string",
              maxLength: 300,
              example: "Grilled cottage cheese with spices",
            },
            isVeg: { type: "boolean", default: false, example: true },
          },
        },

        ReviewRequest: {
          type: "object",
          required: ["rating", "reviewText"],
          properties: {
            rating: { type: "number", minimum: 0, maximum: 5, example: 4.5 },
            reviewText: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example:
                "Amazing food and great ambiance! Will definitely visit again.",
            },
          },
        },

        // ── Responses ─────────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "failed" },
            error: { type: "string", example: "Error message description" },
            message: { type: "string", example: "Error message description" },
          },
        },

        SuccessMessageResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
