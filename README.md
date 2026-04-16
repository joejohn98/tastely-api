# Tastelytics API

[![Build Status](https://img.shields.io/travis/com/joejohn98/tastelytics-api.svg?style=flat-square)](https://travis-ci.com/joejohn98/tastelytics-api)
[![NPM Version](https://img.shields.io/npm/v/tastelytics-api.svg?style=flat-square)](https://www.npmjs.com/package/tastelytics-api)
[![License](https://img.shields.io/npm/l/tastelytics-api.svg?style=flat-square)](https://github.com/joejohn98/tastelytics-api/blob/main/LICENSE)

---

A comprehensive restaurant review and analytics API built with Node.js, Express, TypeScript, and MongoDB. Features AI-powered review analysis using Google's Gemini API.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control (customer/admin)
- **Restaurant Management**: CRUD operations for restaurants with menu management
- **Review System**: Users can submit reviews and ratings for restaurants
- **AI-Powered Analytics**:
  - Sentiment analysis of reviews
  - AI-generated review summaries
  - Theme extraction from reviews
- **Search & Filtering**: Search by location, cuisine type, and rating
- **User Profiles**: User management with profile updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini API
- **Validation**: Zod
- **Security**: bcryptjs for password hashing
- **Logging**: Morgan
- **CORS**: Enabled with credentials support

## Project Structure

```
tastely-api/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── index.ts           # Server entry point
│   ├── config/
│   │   ├── config.ts      # Environment configuration
│   │   └── db.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── ai.controller.ts       # AI review summary controller
│   │   ├── auth.controller.ts     # Authentication controller
│   │   ├── menu.controller.ts     # Menu management controller
│   │   ├── restaurant.controller.ts # Restaurant CRUD controller
│   │   ├── review.controller.ts   # Review management controller
│   │   ├── search.controller.ts   # Search functionality controller
│   │   └── user.controller.ts     # User profile controller
│   ├── middleware/
│   │   ├── authorize.middleware.ts # Role-based authorization
│   │   └── verify.middleware.ts   # JWT verification
│   ├── models/
│   │   ├── restaurant.model.ts    # Restaurant schema
│   │   └── user.model.ts          # User schema
│   ├── routes/
│   │   ├── ai.routes.ts           # AI endpoints
│   │   ├── auth.routes.ts         # Authentication endpoints
│   │   ├── restaurant.routes.ts   # Restaurant endpoints
│   │   └── user.routes.ts         # User endpoints
│   ├── services/
│   │   └── ai.services.ts         # Gemini AI service integration
│   ├── types/
│   │   └── express.d.ts           # Express type extensions
│   ├── utils/
│   │   ├── generateToken.ts       # JWT token generation
│   │   └── validation.ts          # Validation utilities
│   └── validators/
│       ├── auth.validators.ts     # Authentication validators
│       ├── restaurant.validators.ts # Restaurant validators
│       └── user.validators.ts     # User validators
├── package.json
├── tsconfig.json
├── .eslintrc.js
└── .gitignore
```

## API Endpoints

> **Note**: For detailed information on request bodies, parameters, and example responses, consider generating and linking to API documentation using tools like [Swagger](https://swagger.io/) or [Postman](https://www.postman.com/product/api-documentation/).

### Authentication (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /admin/users` - Create admin user (admin only)
- `PATCH /users/:userId/role` - Update user role (admin only)

### Users (`/api/users`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `DELETE /profile` - Delete user account

### Restaurants (`/api/restaurants`)

- `GET /` - Get all restaurants
- `GET /by-name/:name` - Get restaurant by name
- `POST /` - Create restaurant (admin only)
- `PUT /:restaurantId` - Update restaurant (admin only)
- `DELETE /:restaurantId` - Delete restaurant (admin only)

### Restaurant Search (`/api/restaurants/search`)

- `GET /location` - Search restaurants by location (e.g., `/location?city=New+York`)
- `GET /cuisine/:cuisineType` - Get restaurants by cuisine
- `GET /rating/:rating` - Filter restaurants by minimum rating

### Menu Management (`/api/restaurants/:restaurantId/menu`)

- `POST /` - Add dish to menu (admin only)
- `DELETE /:dishName` - Remove dish from menu (admin only)

### Reviews and Ratings (`/api/restaurants`)

- `POST /:restaurantId/review` - Add review and rating
- `GET /:restaurantId/reviews/user` - Get current user's review for a restaurant
- `GET /reviews/user` - Get all reviews by the current user

### AI Features (`/api/ai`)

- `GET /summary/restaurant/:restaurantId` - Get AI-generated review summary for a restaurant

## Data Models

### User Model

```typescript
{
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: "customer" | "admin"
}
```

### Restaurant Model

```typescript
{
  name: string,
  cuisine: string,
  address: string,
  city: string,
  rating: number,
  averageRating: number,
  menu: Array<{
    name: string,
    price: number,
    description: string,
    isVeg: boolean
  }>,
  reviews: Array<{
    userId: { type: ObjectId, ref: 'User' },
    rating: number,
    reviewText: string,
    sentiment: "positive" | "neutral" | "negative",
    themes: string[]
  }>
}
```

## AI Features

The API integrates with Google's Gemini API to provide:

1. **Sentiment Analysis**: Automatically analyzes review text to determine sentiment (positive, neutral, negative)
2. **Theme Extraction**: Identifies key topics mentioned in reviews
3. **Review Summarization**: Generates concise summaries of all reviews for a restaurant

## Environment Variables

Create a `.env` file in the root directory with the following variables:

> **Tip**: Create a `.env.example` file in your repository to list all the required environment variables.

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/tastelytics
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
GEMINI_API_KEY=your_google_gemini_api_key
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/joejohn98/tastelytics-api.git
cd tastelytics-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see above)

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Type check without emitting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcryptjs
3. JWT token is generated upon successful login
4. Token is sent in Authorization header for protected routes
5. Middleware verifies token and checks user roles

## Error Handling

The API includes comprehensive error handling:

- Global error handler middleware
- Unhandled rejection and exception handlers
- Validation errors using Zod
- MongoDB connection error handling
- AI service rate limiting (429 errors)

## Rate Limiting

The AI service includes rate limiting for the Gemini API. If the rate limit is exceeded, the API returns a 429 status code.

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- CORS configuration
- Environment variable protection
- Input validation with Zod

## Development

### Code Quality

- TypeScript for type safety
- ESLint with Prettier for code formatting
- Strict TypeScript compiler options

### Database

- MongoDB with Mongoose ODM
- Schema validation
- Timestamps automatically added

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Acknowledgments

- Google Gemini API for AI capabilities
- Express.js team for the web framework
- MongoDB for the database
- All contributors to the project
