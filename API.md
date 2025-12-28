# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Health Check

#### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

---

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "phoneNumber": "+1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token"
}
```

#### POST /api/auth/login
Login with phone number and password.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "phoneNumber": "+1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token"
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "id": "uuid",
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePicture": null,
  "preferences": {},
  "lastSeenAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/auth/profile
Update user profile (requires authentication).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "preferences": {
    "notifications": true
  }
}
```

---

### Sessions

#### GET /api/sessions
Get all sessions for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 10)
- `offset` (optional): Number of results to skip (default: 0)
- `status` (optional): Filter by status (active, completed, archived)

**Response:**
```json
{
  "total": 25,
  "sessions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Session 2024-01-01",
      "description": null,
      "type": "daily",
      "status": "active",
      "metadata": {},
      "startedAt": "2024-01-01T00:00:00.000Z",
      "completedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "messages": []
    }
  ]
}
```

#### GET /api/sessions/:sessionId
Get a specific session with all messages and artifacts.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Session 2024-01-01",
  "description": null,
  "type": "daily",
  "status": "active",
  "metadata": {},
  "startedAt": "2024-01-01T00:00:00.000Z",
  "completedAt": null,
  "messages": [
    {
      "id": "uuid",
      "content": "Hello!",
      "type": "text",
      "direction": "inbound",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "artifacts": []
}
```

#### POST /api/sessions
Create a new session.

**Request Body:**
```json
{
  "title": "My Project",
  "description": "Building a new feature",
  "type": "project"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "My Project",
  "description": "Building a new feature",
  "type": "project",
  "status": "active",
  "startedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/sessions/:sessionId
Update a session.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed"
}
```

#### DELETE /api/sessions/:sessionId
Archive a session (soft delete).

**Response:**
```json
{
  "message": "Session archived successfully"
}
```

#### GET /api/sessions/:sessionId/stats
Get statistics for a specific session.

**Response:**
```json
{
  "sessionId": "uuid",
  "stats": {
    "messages": 50,
    "media": 10,
    "artifacts": 2,
    "duration": 3600000
  }
}
```

---

### Webhook

#### GET /webhook
Webhook verification endpoint (used by WhatsApp).

**Query Parameters:**
- `hub.mode`: Should be "subscribe"
- `hub.verify_token`: Your verification token
- `hub.challenge`: Challenge string to echo back

#### POST /webhook
Webhook message handling endpoint (used by WhatsApp).

**Note:** This endpoint is called by WhatsApp's servers and should not be called directly.

---

## Rate Limiting

Rate limits are applied to prevent abuse:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Webhook**: 60 requests per minute

When rate limit is exceeded, the API returns:
```json
{
  "error": "Too many requests",
  "message": "Please try again later."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": []  // Optional array of validation errors
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Webhooks & Events

The application receives events from WhatsApp via webhooks. These are processed asynchronously:

### Supported Message Types
- Text messages
- Images (with OCR processing)
- Documents
- Audio
- Video

### Message Processing Flow
1. Message received via webhook
2. User and session created/retrieved
3. Message saved to database
4. Media downloaded and stored (if applicable)
5. OCR processing queued for images
6. AI response generated
7. Response sent back to user

---

## Job Queue Status

The application uses Bull queues for async processing:

### Queue Types
1. **media-processing**: OCR and image classification
2. **github-build**: Repository creation and code generation
3. **ai-task**: AI-related background tasks

Jobs are automatically retried on failure with exponential backoff.
