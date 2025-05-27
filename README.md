# Portfolio Backend API

A secure RESTful API built with Express.js and TypeScript for managing portfolio items. This API implements industry-standard security practices and provides comprehensive authentication and CRUD operations.

## Features

- 🔐 Secure Authentication System
  - JWT-based authentication with refresh tokens
  - Password hashing with bcrypt
  - Account lockout after failed attempts
  - Password reset functionality
  - Device tracking
  - Session management
- 🛡️ Security Features
  - Rate limiting
  - CORS protection
  - Security headers with Helmet
  - Input validation
  - XSS protection
  - CSRF protection
- 📦 Database
  - MongoDB integration
  - Mongoose ODM
  - Data validation
- 🎯 Portfolio Management
  - CRUD operations
  - Pagination
  - Filtering
  - Search functionality
- 🛠️ Development
  - TypeScript support
  - Hot reload
  - Error handling
  - Request validation
  - Logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-porto
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongP@ss123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Response:**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
```json
{
  "status": "fail",
  "message": "Email already registered"
}
```
```json
{
  "status": "fail",
  "message": "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongP@ss123"
}
```

**Response:**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
```json
{
  "status": "fail",
  "message": "Incorrect email or password"
}
```
```json
{
  "status": "fail",
  "message": "Account is locked. Try again after [timestamp]"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Cookie: refreshToken=your_refresh_token
```

**Response:**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your_access_token
Cookie: refreshToken=your_refresh_token
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset token sent to email",
  "resetToken": "reset_token" // Only in development
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "NewStrongP@ss123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password has been reset successfully"
}
```

### Portfolio Management

#### Create Portfolio Item
```http
POST /api/portfolio
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "title": "E-Commerce Website",
  "category": "Web Development",
  "client": "Fashion Store",
  "completionDate": "March 2024",
  "technologies": ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
  "description": "A full-stack e-commerce platform with features like user authentication, product management, shopping cart, and payment integration.",
  "challenge": "Implementing real-time inventory management and handling concurrent user sessions during high-traffic periods.",
  "solution": "Developed a scalable architecture using microservices, implemented Redis for caching, and used WebSocket for real-time updates.",
  "imageUrls": [
    "https://example.com/ecommerce-home.jpg",
    "https://example.com/ecommerce-products.jpg",
    "https://example.com/ecommerce-cart.jpg"
  ],
  "liveUrl": "https://fashion-store.com",
  "githubUrl": "https://github.com/username/ecommerce-project"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "portfolio_id",
    "title": "E-Commerce Website",
    ...
  }
}
```

#### Get All Portfolio Items
```http
GET /api/portfolio?page=1&limit=10&category=Web Development&client=Fashion Store&technologies=React,Node.js
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `client`: Filter by client
- `technologies`: Filter by technologies (comma-separated)

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "total": 1,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "portfolio_id",
      "title": "E-Commerce Website",
      ...
    }
  ]
}
```

#### Get Single Portfolio Item
```http
GET /api/portfolio/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "portfolio_id",
    "title": "E-Commerce Website",
    ...
  }
}
```

#### Update Portfolio Item
```http
PATCH /api/portfolio/:id
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "portfolio_id",
    "title": "Updated Title",
    ...
  }
}
```

#### Delete Portfolio Item
```http
DELETE /api/portfolio/:id
Authorization: Bearer your_access_token
```

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

## Error Handling

All errors follow this format:
```json
{
  "status": "fail" | "error",
  "message": "Error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Security

### Rate Limiting
- 100 requests per 15 minutes per IP
- Customizable in `src/middleware/rateLimiter.ts`

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are stored in HTTP-only cookies
- Access tokens must be included in Authorization header

### Password Security
- Passwords are hashed using bcrypt
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Account lockout after 5 failed attempts
- 30-minute lockout period

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## License

MIT 