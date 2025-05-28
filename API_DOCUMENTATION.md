# API Documentation - Backend Portfolio

## Overview

Backend API untuk website portfolio yang dibangun dengan Express.js, TypeScript, dan MongoDB. API ini menyediakan fitur autentikasi, manajemen portfolio, dan form kontak.

**Base URL:** `http://localhost:5002/api` (development)  
**Production URL:** `https://api.inyx.site/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Portfolio Management](#portfolio-management)
3. [Contact Management](#contact-management)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Security Features](#security-features)

---

## Authentication

### Base URL: `/api/auth`

#### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Mendaftarkan user baru (admin)

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimal 8 karakter
- Harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus
- Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`

**Response (201 Created):**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Email already registered"
}
```

---

#### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Login user dan mendapatkan access token

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Incorrect email or password"
}
```

**Security Features:**
- Account locking setelah 5 kali percobaan login gagal
- Lock duration: 30 menit
- Refresh token disimpan dalam HTTP-only cookie

---

#### 3. Logout User

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user dan invalidate refresh token

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

---

#### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Mendapatkan access token baru menggunakan refresh token

**Note:** Refresh token dikirim otomatis melalui HTTP-only cookie

**Response (200 OK):**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid refresh token"
}
```

---

#### 5. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Mengirim token reset password ke email

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset token sent to email",
  "resetToken": "abc123..." // Remove in production
}
```

---

#### 6. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password menggunakan token

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password has been reset successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Token is invalid or has expired"
}
```

---

## Portfolio Management

### Base URL: `/api/portfolio`

#### 1. Get All Portfolios (Public)

**Endpoint:** `GET /api/portfolio`

**Description:** Mendapatkan semua portfolio dengan pagination dan filtering

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `category` (optional): Filter berdasarkan kategori
- `client` (optional): Filter berdasarkan client
- `technologies` (optional): Filter berdasarkan teknologi (comma-separated)

**Example Request:**
```
GET /api/portfolio?page=1&limit=5&category=web&technologies=React,Node.js
```

**Response (200 OK):**
```json
{
  "status": "success",
  "results": 5,
  "total": 25,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "E-Commerce Website",
      "category": "web",
      "client": "ABC Company",
      "completionDate": "2023-12-01",
      "technologies": ["React", "Node.js", "MongoDB"],
      "description": "Modern e-commerce platform with advanced features",
      "challenge": "Building scalable architecture for high traffic",
      "solution": "Implemented microservices with Redis caching",
      "imageUrls": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "liveUrl": "https://example.com",
      "githubUrl": "https://github.com/user/repo",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

---

#### 2. Get Single Portfolio (Public)

**Endpoint:** `GET /api/portfolio/:id`

**Description:** Mendapatkan detail portfolio berdasarkan ID

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "E-Commerce Website",
    "category": "web",
    "client": "ABC Company",
    "completionDate": "2023-12-01",
    "technologies": ["React", "Node.js", "MongoDB"],
    "description": "Modern e-commerce platform with advanced features",
    "challenge": "Building scalable architecture for high traffic",
    "solution": "Implemented microservices with Redis caching",
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "liveUrl": "https://example.com",
    "githubUrl": "https://github.com/user/repo",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "No portfolio found with that ID"
}
```

---

#### 3. Create Portfolio (Protected)

**Endpoint:** `POST /api/portfolio`

**Description:** Membuat portfolio baru (memerlukan autentikasi)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Mobile App Development",
  "category": "mobile",
  "client": "XYZ Startup",
  "completionDate": "2024-01-15",
  "technologies": ["React Native", "Firebase", "TypeScript"],
  "description": "Cross-platform mobile application for food delivery",
  "challenge": "Real-time tracking and payment integration",
  "solution": "Used WebSocket for real-time updates and Stripe for payments",
  "imageUrls": [
    "https://example.com/mobile1.jpg",
    "https://example.com/mobile2.jpg"
  ],
  "liveUrl": "https://play.google.com/store/apps/details?id=com.example",
  "githubUrl": "https://github.com/user/mobile-app"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "title": "Mobile App Development",
    "category": "mobile",
    "client": "XYZ Startup",
    "completionDate": "2024-01-15",
    "technologies": ["React Native", "Firebase", "TypeScript"],
    "description": "Cross-platform mobile application for food delivery",
    "challenge": "Real-time tracking and payment integration",
    "solution": "Used WebSocket for real-time updates and Stripe for payments",
    "imageUrls": [
      "https://example.com/mobile1.jpg",
      "https://example.com/mobile2.jpg"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.example",
    "githubUrl": "https://github.com/user/mobile-app",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Required Fields:**
- `title`: String (required)
- `category`: String (required)
- `client`: String (required)
- `completionDate`: String (required)
- `technologies`: Array of strings (required, minimal 1 item)
- `description`: String (required)
- `challenge`: String (required)
- `solution`: String (required)
- `imageUrls`: Array of strings (required, minimal 1 item)

**Optional Fields:**
- `liveUrl`: String
- `githubUrl`: String

---

#### 4. Update Portfolio (Protected)

**Endpoint:** `PATCH /api/portfolio/:id`

**Description:** Update portfolio berdasarkan ID (memerlukan autentikasi)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** (Partial update - hanya field yang ingin diubah)
```json
{
  "title": "Updated Portfolio Title",
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "liveUrl": "https://updated-url.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Updated Portfolio Title",
    "category": "web",
    "client": "ABC Company",
    "completionDate": "2023-12-01",
    "technologies": ["React", "Node.js", "PostgreSQL"],
    "description": "Modern e-commerce platform with advanced features",
    "challenge": "Building scalable architecture for high traffic",
    "solution": "Implemented microservices with Redis caching",
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "liveUrl": "https://updated-url.com",
    "githubUrl": "https://github.com/user/repo",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 5. Delete Portfolio (Protected)

**Endpoint:** `DELETE /api/portfolio/:id`

**Description:** Hapus portfolio berdasarkan ID (memerlukan autentikasi)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content):**
```json
{
  "status": "success",
  "data": null
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "No portfolio found with that ID"
}
```

---

## Contact Management

### Base URL: `/api/contact`

#### 1. Submit Contact Form (Public)

**Endpoint:** `POST /api/contact`

**Description:** Submit form kontak dari pengunjung website

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "Hi, I'm interested in your web development services. Could we discuss a potential project?"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "Hi, I'm interested in your web development services. Could we discuss a potential project?",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Required Fields:**
- `name`: String (required)
- `email`: String (required, valid email format)
- `subject`: String (required)
- `message`: String (required)

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Please provide a valid email address"
}
```

---

#### 2. Get All Contact Messages (Protected)

**Endpoint:** `GET /api/contact`

**Description:** Mendapatkan semua pesan kontak (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `isRead` (optional): Filter berdasarkan status baca (true/false)
- `email` (optional): Filter berdasarkan email (case-insensitive search)

**Example Request:**
```
GET /api/contact?page=1&limit=5&isRead=false
```

**Response (200 OK):**
```json
{
  "status": "success",
  "results": 3,
  "total": 15,
  "totalPages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Project Inquiry",
      "message": "Hi, I'm interested in your web development services.",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "subject": "Collaboration",
      "message": "Would you be interested in collaborating on a project?",
      "isRead": true,
      "createdAt": "2024-01-14T15:30:00.000Z",
      "updatedAt": "2024-01-14T16:00:00.000Z"
    }
  ]
}
```

---

#### 3. Get Single Contact Message (Protected)

**Endpoint:** `GET /api/contact/:id`

**Description:** Mendapatkan detail pesan kontak berdasarkan ID (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "Hi, I'm interested in your web development services. Could we discuss a potential project?",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### 4. Mark Contact as Read (Protected)

**Endpoint:** `PATCH /api/contact/:id/read`

**Description:** Tandai pesan kontak sebagai sudah dibaca (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "Hi, I'm interested in your web development services.",
    "isRead": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### 5. Delete Contact Message (Protected)

**Endpoint:** `DELETE /api/contact/:id`

**Description:** Hapus pesan kontak berdasarkan ID (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content):**
```json
{
  "status": "success",
  "data": null
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- **200 OK**: Request berhasil
- **201 Created**: Resource berhasil dibuat
- **204 No Content**: Request berhasil, tidak ada content yang dikembalikan
- **400 Bad Request**: Request tidak valid
- **401 Unauthorized**: Authentication diperlukan atau gagal
- **403 Forbidden**: Access ditolak
- **404 Not Found**: Resource tidak ditemukan
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Validation Errors

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

## Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:

- **Limit**: 100 requests per 15 menit per IP address
- **Headers yang dikembalikan**:
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

**Response saat limit terlampaui (429):**
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Security Features

### 1. Authentication & Authorization
- JWT-based authentication
- Access token (15 menit) + Refresh token (7 hari)
- HTTP-only cookies untuk refresh token
- Account locking setelah 5 kali login gagal

### 2. Security Headers
- Helmet.js untuk security headers
- CORS configuration
- Content Security Policy

### 3. Input Validation
- Joi validation untuk request body
- Email format validation
- Password strength requirements
- XSS protection

### 4. Database Security
- MongoDB injection protection
- Input sanitization
- Indexed queries untuk performance

### 5. Logging & Monitoring
- Morgan untuk HTTP request logging
- Winston untuk application logging
- Error tracking dan monitoring

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/portfolio

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5002
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=https://api.inyx.site,http://localhost:3000
```

---

## Example Usage with JavaScript/Fetch

### 1. Login dan Simpan Token

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important untuk cookies
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'SecurePass123!'
  })
});

const loginData = await loginResponse.json();
const accessToken = loginData.accessToken;

// Simpan access token (localStorage, sessionStorage, atau state management)
localStorage.setItem('accessToken', accessToken);
```

### 2. Request dengan Authentication

```javascript
// Get access token
const accessToken = localStorage.getItem('accessToken');

// Request ke protected endpoint
const response = await fetch('/api/portfolio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  credentials: 'include',
  body: JSON.stringify({
    title: 'New Portfolio',
    category: 'web',
    client: 'Client Name',
    // ... other fields
  })
});

if (response.status === 401) {
  // Token expired, try refresh
  const refreshResponse = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    credentials: 'include'
  });
  
  if (refreshResponse.ok) {
    const refreshData = await refreshResponse.json();
    localStorage.setItem('accessToken', refreshData.accessToken);
    // Retry original request
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### 3. Submit Contact Form

```javascript
const submitContact = async (formData) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Message sent successfully!');
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
};

// Usage
submitContact({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Project Inquiry',
  message: 'Hello, I would like to discuss a project...'
});
```

---

## Testing dengan Postman/cURL

### 1. Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

### 2. Create Portfolio
```bash
curl -X POST http://localhost:5002/api/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Test Portfolio",
    "category": "web",
    "client": "Test Client",
    "completionDate": "2024-01-15",
    "technologies": ["React", "Node.js"],
    "description": "Test description",
    "challenge": "Test challenge",
    "solution": "Test solution",
    "imageUrls": ["https://example.com/image.jpg"]
  }'
```

### 3. Get All Portfolios
```bash
curl -X GET "http://localhost:5002/api/portfolio?page=1&limit=5"
```

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Authentication system dengan JWT
- ✅ Portfolio CRUD operations
- ✅ Contact form management
- ✅ Rate limiting
- ✅ Security headers
- ✅ Input validation
- ✅ Error handling
- ✅ Pagination dan filtering

### Planned Features
- 🔄 Email notifications untuk contact form
- 🔄 File upload untuk portfolio images
- 🔄 Two-factor authentication
- 🔄 API versioning
- 🔄 Comprehensive logging
- 🔄 API analytics

---

## Support

Untuk pertanyaan atau bantuan terkait API ini, silakan hubungi:
- Email: admin@inyx.site
- GitHub: [Repository Link]
- API Endpoint: https://api.inyx.site

---

*Dokumentasi ini dibuat untuk Backend Portfolio API v1.0.0* 