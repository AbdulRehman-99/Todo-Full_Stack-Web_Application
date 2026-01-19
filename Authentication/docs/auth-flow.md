# Authentication Flow Documentation

## Overview
This document describes the JWT-based authentication flow between the Frontend (Next.js + Better Auth) and Backend (FastAPI) systems.

## Authentication Process

### 1. User Login
1. User provides credentials (email/password) to Better Auth
2. Better Auth validates credentials
3. Better Auth issues JWT tokens:
   - Access token: Valid for 15 minutes (RS256 signed)
   - Refresh token: Valid for 7 days (RS256 signed)

### 2. Token Storage (Frontend)
- Access token stored in HttpOnly cookie for security
- Refresh token stored securely in memory/localStorage as needed
- Both tokens contain user_id in the payload

### 3. API Requests (Frontend to Backend)
1. Frontend retrieves access token from storage
2. Frontend adds `Authorization: Bearer <access_token>` header to API requests
3. Request sent to backend API

### 4. Token Validation (Backend)
1. Backend receives request with Authorization header
2. Backend extracts JWT from Authorization header
3. Backend verifies JWT signature using shared secret
4. Backend validates token hasn't expired
5. Backend extracts user_id from token payload
6. Backend attaches user context to request
7. Request processed with authenticated user context

### 5. Data Access Control
1. Backend identifies authenticated user from token
2. Backend filters all data queries by authenticated user_id
3. Backend returns only data belonging to authenticated user

## Token Lifecycle

### Access Token (15 minutes)
- Used for all API requests
- Expires after 15 minutes
- Cannot be renewed - requires refresh token
- Stored in HttpOnly cookie for security

### Refresh Token (7 days)
- Used to obtain new access tokens
- Expires after 7 days
- Used in refresh requests to get new access tokens
- Stored securely on the client

## Error Handling

### Invalid/Expired Access Token
- Backend returns HTTP 401 Unauthorized
- Frontend detects 401 response
- Frontend attempts to refresh token using refresh token
- If refresh successful, retry original request with new access token
- If refresh fails, redirect to login

### Invalid Refresh Token
- Refresh token requests return HTTP 401
- Frontend redirects to login page
- All tokens cleared from storage

## Security Measures

### Stateless Authentication
- No server-side session storage
- All authentication data contained in JWT
- Backend validates JWT signature and expiration only

### Token Security
- RS256 algorithm for strong security
- HttpOnly cookies prevent XSS attacks
- HTTPS required for all authenticated requests
- Short-lived access tokens (15 min) limit exposure window

### Data Isolation
- All data queries filtered by authenticated user_id
- Users cannot access other users' data
- Backend middleware enforces data access controls

## Integration Points

### Frontend Integration
- Better Auth handles login and token issuance
- Http interceptors add Authorization headers
- Token refresh logic handles expired access tokens
- Logout clears all tokens from storage

### Backend Integration
- JWT validation middleware
- User context injection
- Data filtering middleware
- Error response formatting

## Environment Configuration

### Development
- `BETTER_AUTH_SECRET`: Development secret key
- CORS configured for localhost origins

### Production
- `BETTER_AUTH_SECRET`: Strong production secret key
- CORS configured for production domain only