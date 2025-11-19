# MMW Hubix API Documentation

## Overview

The MMW Hubix API provides endpoints for managing announcements, events, resources, users, and more. All API endpoints require authentication and include rate limiting for security.

## Base URL

```
Production: https://mmw-hubix.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints (except public ones) require authentication via NextAuth.js session cookies.

### Headers Required

```http
Cookie: next-auth.session-token=<session-token>
Content-Type: application/json
X-CSRF-Token: <csrf-token> (for POST/PUT/DELETE requests)
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per hour
- **Chat API**: 20 requests per minute
- **Admin Operations**: 30 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Health Check

#### GET /api/health

Check the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": "up",
    "memory": "ok",
    "disk": "ok"
  },
  "metrics": {
    "memoryUsage": 45.2,
    "diskUsage": 23.1,
    "responseTime": 12
  }
}
```

### Authentication

#### POST /api/auth/[...nextauth]

NextAuth.js authentication endpoints. See [NextAuth.js documentation](https://next-auth.js.org/) for details.

### Users (Admin Only)

#### GET /api/admin/users

Get all users.

**Response:**
```json
[
  {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "ADMIN",
    "department": "IT",
    "isActive": true,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/admin/users

Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePassword123",
  "role": "ADMIN",
  "department": "IT",
  "isActive": true
}
```

#### PATCH /api/admin/users

Update multiple users.

**Request Body:**
```json
[
  {
    "id": "1",
    "name": "John Smith",
    "role": "HELPER"
  }
]
```

#### DELETE /api/admin/users

Delete users.

**Request Body:**
```json
{
  "ids": ["1", "2", "3"]
}
```

### Announcements

#### GET /api/announcements

Get all announcements (admin only).

#### GET /api/public/announcements

Get public announcements.

#### POST /api/announcements

Create a new announcement.

**Request Body:**
```json
{
  "title": "Club Meeting",
  "club": "IT Club",
  "date": "2024-01-15T00:00:00.000Z",
  "time": "14:30",
  "location": "Room 101",
  "description": "Monthly IT Club meeting",
  "maxAttendees": 50,
  "type": "meeting",
  "isPublic": true
}
```

#### PUT /api/announcements/[id]

Update an announcement.

#### DELETE /api/announcements/[id]

Delete an announcement.

#### POST /api/announcements/[id]/join

Join an event.

### Events

#### GET /api/admin/calendar

Get all calendar events (admin only).

#### POST /api/admin/calendar

Create a new public event.

**Request Body:**
```json
{
  "title": "School Assembly",
  "description": "Monthly school assembly",
  "startTime": "2024-01-15T09:00:00.000Z",
  "endTime": "2024-01-15T10:00:00.000Z",
  "location": "Main Hall",
  "eventType": "assembly",
  "isVisible": true
}
```

#### GET /api/public/calendar

Get public calendar events.

### Resources

#### GET /api/training

Get training resources.

#### POST /api/training

Create a new training resource.

**Request Body:**
```json
{
  "title": "JavaScript Basics",
  "description": "Introduction to JavaScript programming",
  "contentType": "VIDEO",
  "videoUrl": "https://youtube.com/watch?v=example",
  "category": "Programming",
  "difficulty": "beginner",
  "instructor": "John Doe",
  "isPublic": true
}
```

### File Upload

#### POST /api/upload

Upload a file.

**Request Body:** `multipart/form-data`
- `file`: File to upload
- `category`: Optional category

**Response:**
```json
{
  "success": true,
  "fileName": "1234567890_abc123.pdf",
  "originalName": "document.pdf",
  "url": "/uploads/documents/1234567890_abc123.pdf",
  "size": 1024000,
  "type": "application/pdf",
  "category": "documents"
}
```

### Chat

#### POST /api/chat

Send a message to the AI assistant.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What time is the school assembly?"
    }
  ]
}
```

**Response:**
```json
{
  "message": "The school assembly is scheduled for 9:00 AM in the Main Hall."
}
```

## Data Models

### User

```typescript
interface User {
  id: string
  name: string
  email: string
  username: string
  role: 'ADMIN' | 'HELPER' | 'STUDENT'
  department: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}
```

### Announcement

```typescript
interface Announcement {
  id: string
  title: string
  club: string
  date: string
  time: string
  location?: string
  description?: string
  maxAttendees?: number
  attendees: number
  type: string
  status: 'active' | 'cancelled' | 'completed'
  isPublic: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### Event

```typescript
interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  eventType: string
  isVisible: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### Resource

```typescript
interface Resource {
  id: string
  name: string
  url: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'archived'
  clicks: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

## Security Features

### CSRF Protection

All state-changing requests (POST, PUT, DELETE) require a CSRF token in the `X-CSRF-Token` header.

### Rate Limiting

API endpoints are protected by rate limiting to prevent abuse and ensure fair usage.

### Input Validation

All input data is validated using Zod schemas to prevent injection attacks and ensure data integrity.

### File Upload Security

File uploads are validated by:
- File type checking (MIME type)
- File signature verification (magic numbers)
- File size limits (50MB max)
- Secure filename generation

### Security Headers

All responses include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: ...`

## Monitoring

### Health Checks

The API provides health check endpoints for monitoring:
- `/api/health` - Detailed health status
- `/api/health` (HEAD) - Simple liveness check

### Metrics

The API tracks various metrics:
- Request duration
- Error rates
- Memory usage
- Database performance
- User actions

### Error Tracking

All errors are logged and can be monitored for debugging and improvement.

## Examples

### Creating a User

```bash
curl -X POST https://mmw-hubix.vercel.app/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -H "X-CSRF-Token: <csrf-token>" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "username": "janedoe",
    "password": "SecurePassword123",
    "role": "HELPER",
    "department": "IT",
    "isActive": true
  }'
```

### Creating an Announcement

```bash
curl -X POST https://mmw-hubix.vercel.app/api/announcements \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -H "X-CSRF-Token: <csrf-token>" \
  -d '{
    "title": "IT Club Meeting",
    "club": "IT Club",
    "date": "2024-01-15T00:00:00.000Z",
    "time": "14:30",
    "location": "Room 101",
    "description": "Monthly IT Club meeting to discuss upcoming projects",
    "maxAttendees": 30,
    "type": "meeting",
    "isPublic": true
  }'
```

### Uploading a File

```bash
curl -X POST https://mmw-hubix.vercel.app/api/upload \
  -H "Cookie: next-auth.session-token=<token>" \
  -H "X-CSRF-Token: <csrf-token>" \
  -F "file=@document.pdf" \
  -F "category=documents"
```

## Support

For API support or questions, please contact the development team or create an issue in the project repository.