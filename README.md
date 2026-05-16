# Tastelytics API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg?style=flat-square)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg?style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.3-green.svg?style=flat-square)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Project Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=flat-square)](https://github.com/joejohn98/tastelytics-api)

---

A comprehensive restaurant management and analytics API built with **Express 5**, **TypeScript**, and **MongoDB**. Features AI-powered review analysis using **Google Gemini API** for sentiment analysis, theme extraction, and review summarization.

## Features

- **JWT Authentication** with role-based access control (`customer` / `admin`)
- **Restaurant Management** — full CRUD operations (admin only)
- **Menu Management** — add/remove dishes per restaurant (admin only)
- **Review System** — submit, update, and fetch reviews with AI sentiment analysis
- **Search & Filtering** — by location (city), cuisine type, and minimum rating
- **AI Analytics** — AI-generated review summaries and sentiment analysis via Google Gemini
- **User Profiles** — view, update, and delete your own profile
- **Swagger Documentation** — interactive API docs at `/api-docs`
- **Docker Support** — development and production Docker configurations

## Tech Stack

| Category          | Technology                                      |
| ----------------- | ----------------------------------------------- |
| **Runtime**       | Node.js                                         |
| **Framework**     | Express.js 5.x                                  |
| **Language**      | TypeScript 5.4                                  |
| **Database**      | MongoDB 7.0 with Mongoose 9.3 ODM               |
| **Authentication**| JWT (JSON Web Tokens) via `jsonwebtoken`         |
| **AI Integration**| Google Gemini API (`@google/genai`)              |
| **Validation**    | Zod 4.x                                         |
| **Security**      | bcryptjs for password hashing, CORS, cookie-parser |
| **Logging**       | Morgan HTTP request logger                      |
| **Documentation** | Swagger UI Express + swagger-jsdoc              |
| **Linting**       | ESLint with TypeScript + Prettier               |
| **Dev Server**    | ts-node-dev (hot reload)                        |
| **Containerization** | Docker & Docker Compose                      |

## Project Structure

```
tastelytics-api/
├── src/
│   ├── app.ts                    # Express app configuration & middleware setup
│   ├── index.ts                  # Server entry point
│   ├── config/
│   │   ├── config.ts             # Centralized environment configuration
│   │   ├── db.ts                 # MongoDB connection
│   │   └── swagger.ts            # Swagger/OpenAPI specification
│   ├── controllers/
│   │   ├── ai.controller.ts      # AI review summary endpoint
│   │   ├── auth.controller.ts    # Register, login, logout, role management
│   │   ├── menu.controller.ts    # Add/remove menu items
│   │   ├── restaurant.controller.ts  # Restaurant CRUD
│   │   ├── review.controller.ts  # Submit/update reviews, fetch user reviews
│   │   ├── search.controller.ts  # Search by location, cuisine, rating
│   │   └── user.controller.ts    # Profile management (get, update, delete)
│   ├── middleware/
│   │   ├── authorize.middleware.ts   # Role-based authorization
│   │   └── verify.middleware.ts      # JWT verification
│   ├── models/
│   │   ├── restaurant.model.ts   # Restaurant schema with embedded menu & reviews
│   │   └── user.model.ts         # User schema with password hashing
│   ├── routes/
│   │   ├── ai.routes.ts          # AI analytics endpoints
│   │   ├── auth.routes.ts        # Authentication endpoints
│   │   ├── restaurant.routes.ts  # Restaurant, search, review, menu endpoints
│   │   └── user.routes.ts        # User profile endpoints
│   ├── services/
│   │   └── ai.services.ts        # Google Gemini AI integration
│   ├── types/
│   │   └── express.d.ts          # Express Request type augmentation
│   ├── utils/
│   │   ├── generateToken.ts      # JWT token generation & cookie setting
│   │   └── validation.ts         # MongoDB ObjectId validation utility
│   └── validators/
│       ├── auth.validators.ts    # Zod schemas for auth requests
│       ├── restaurant.validators.ts  # Zod schemas for restaurant requests
│       └── user.validators.ts    # Zod schemas for user profile updates
├── Dockerfile                    # Production Docker image
├── Dockerfile.dev                # Development Docker image
├── docker-compose.dev.yml        # Docker Compose for local development
├── .eslintrc.js                  # ESLint configuration
├── .dockerignore                 # Docker ignore rules
├── .gitignore                    # Git ignore rules
├── package.json
└── tsconfig.json
```

## Data Models

### User Model

```typescript
{
  firstName: String,       // Required
  lastName: String,        // Required
  email: String,           // Required, Unique
  password: String,        // Required, Hashed via bcrypt pre-save hook, select: false
  role: String,            // Enum: "customer" | "admin", Default: "customer"
  timestamps: true         // createdAt, updatedAt
}
```

### Restaurant Model

```typescript
{
  name: String,            // Required
  cuisine: String,         // Required
  address: String,         // Required
  city: String,            // Required
  rating: Number,          // Required, 0–5, Default: 0
  averageRating: Number,   // 0–5, Default: 0 (auto-calculated from reviews)
  menu: [{
    name: String,          // Required
    price: Number,         // Required, min: 10
    description: String,   // Required, max: 300 chars
    isVeg: Boolean         // Required
  }],
  reviews: [{
    userId: ObjectId,      // Reference to User
    rating: Number,        // Required, 0–5
    reviewText: String,    // Required, max: 300 chars
    sentiment: String,     // Enum: "positive" | "neutral" | "negative" (AI-enriched)
    themes: [String]       // AI-extracted key topics
  }],
  timestamps: true         // createdAt, updatedAt
}
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/register` | Register a new user (role always `customer`) | No | — |
| POST | `/login` | Login with email & password | No | — |
| POST | `/logout` | Clear authentication cookie | No | — |
| POST | `/admin/users` | Create a new admin user | Yes | Admin |
| PATCH | `/users/:userId/role` | Update a user's role | Yes | Admin |

### User Profile (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get current user's profile | Yes |
| PUT | `/profile` | Update profile (firstName, lastName, email, password) | Yes |
| DELETE | `/profile` | Delete account & remove all associated reviews | Yes |

### Restaurants (`/api/restaurants`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Create a new restaurant | Yes | Admin |
| GET | `/` | Get all restaurants | No | — |
| GET | `/:name` | Get restaurant by exact name | No | — |
| PUT | `/:restaurantId` | Update restaurant details | Yes | Admin |
| DELETE | `/:restaurantId` | Delete a restaurant | Yes | Admin |

### Search & Filtering (`/api/restaurants`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search?location=CityName` | Search restaurants by city | No |
| GET | `/cuisine/:cuisineType` | Get restaurants by cuisine type | No |
| GET | `/rating/:rating` | Filter restaurants by minimum rating (0–5) | No |

### Menu Management (`/api/restaurants`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/:restaurantId/menu` | Add a dish to the menu | Yes | Admin |
| DELETE | `/:restaurantId/menu/:dishName` | Remove a dish from the menu | Yes | Admin |

### Reviews (`/api/restaurants`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/:restaurantId/review` | Add or update a review (with AI sentiment analysis) | Yes |
| GET | `/:restaurantId/reviews` | Get current user's review for a restaurant | Yes |
| GET | `/reviews` | Get all reviews by the current user across all restaurants | Yes |

### AI Analytics (`/api/restaurants`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:restaurantId/ai-summary` | Get AI-generated summary of all reviews for a restaurant | Yes |

## AI Features

The API integrates with **Google Gemini API** (`gemini-3.1-flash-lite-preview` model) to provide:

1. **Sentiment Analysis** — Automatically analyzes each review to determine sentiment (`positive`, `neutral`, or `negative`)
2. **Theme Extraction** — Identifies key topics mentioned in reviews (e.g., `["food quality", "ambiance", "service"]`)
3. **Review Summarization** — Generates concise 2–3 sentence summaries of all reviews for a restaurant

> **Note**: AI features are subject to Gemini API rate limits. If exceeded, the API returns a `429` status code.

## Authentication

Two methods are supported for authenticated requests:

1. **Bearer Token** — `Authorization: Bearer <token>` header
2. **HTTP Cookie** — `token` cookie automatically set on login/register

### Role-Based Access

- **`customer`** — default role on registration. Can read restaurants, submit reviews, manage own profile.
- **`admin`** — can create/update/delete restaurants and menu items, create admin users, change user roles.

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:4000/api-docs
```

The Swagger UI provides:
- Full endpoint documentation with request/response schemas
- "Try it out" functionality for testing endpoints
- Authorization support (Bearer token & cookie)
- Request duration display

## Environment Variables

Create a `.env.local` file (for Docker development) or `.env` file in the root directory:

```env
PORT=4000
DATABASE_URL=mongodb://localhost:27017/tastelytics
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
GEMINI_API_KEY=your_google_gemini_api_key
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MongoDB connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRATION` | JWT token expiration duration | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key | — |

## Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/joejohn98/tastelytics-api.git
   cd tastelytics-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see above)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Docker Development

1. **Create a `.env.local` file** with the required environment variables

2. **Start the services** (server + MongoDB)
   ```bash
   docker compose -f docker-compose.dev.yml up
   ```

   This starts:
   - **Server** on port `4000` with hot reload (code changes are reflected immediately via volume mount)
   - **MongoDB 7.0** on port `27017` with persistent data volume

3. **Stop the services**
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

### Docker Production

1. **Build the production image**
   ```bash
   docker build -t tastelytics-api .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env tastelytics-api
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server from `dist/` |
| `npm run type-check` | Type check without emitting files |
| `npm run lint` | Run ESLint across all source files |
| `npm run lint:fix` | Run ESLint with auto-fix |

## Authentication Flow

1. **Registration**: User provides `firstName`, `lastName`, `email`, and `password`
   - Password is hashed using bcrypt (10 salt rounds) via Mongoose pre-save hook
   - JWT token is generated and set as an HTTP-only cookie
   - User role defaults to `customer`

2. **Login**: User provides `email` and `password`
   - Credentials are validated against the database
   - JWT token is generated and set as an HTTP-only cookie

3. **Protected Routes**: The `verify` middleware checks for a valid JWT token
   - Token can be provided via `Authorization: Bearer <token>` header or `token` cookie
   - The `authorizeRoles` middleware checks user roles for fine-grained access control

## Error Handling

The API uses consistent error response format:

```json
{
  "status": "failed",
  "error": "Error message description",
  "message": "Error message description",
  "errors": { /* Zod validation field errors */ }
}
```

**HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate email/restaurant name) |
| 429 | Rate limit exceeded (AI service) |
| 500 | Internal Server Error |

The app also includes global handlers for:
- **Unhandled Promise Rejections** — logs and exits
- **Uncaught Exceptions** — logs and exits
- **Global Express Error Middleware** — catches unhandled route errors

## Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds via Mongoose pre-save hook
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **HTTP-only Cookies**: Tokens stored in secure, httpOnly cookies
- **CORS**: Configured with credentials support
- **Input Validation**: Comprehensive Zod schemas for all request bodies and parameters
- **Role-based Access Control**: Fine-grained permission system (`customer` / `admin`)
- **Environment Variables**: Sensitive data (JWT secret, DB URL, API keys) stored in `.env` files
- **Password Field Exclusion**: Password field has `select: false` by default

## Code Quality

- **TypeScript** with strict mode enabled
- **ESLint** with TypeScript-specific rules and Prettier integration
- **Strict compiler options**: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **Source maps** enabled for debugging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

ISC

## Acknowledgments

- **Google Gemini API** for AI-powered review analysis
- **Express.js team** for the web framework
- **MongoDB** for the database
