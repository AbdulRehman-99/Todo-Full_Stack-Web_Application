# Quickstart Guide: Authentication Integration Testing

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- Better Auth configured
- FastAPI application running
- Environment variables set:
  - `BETTER_AUTH_SECRET`: JWT signing secret
  - `AUTH_ORIGIN`: Allowed origin for CORS

## Test Environment Setup

### 1. Install Dependencies
```bash
# Backend dependencies
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart

# Frontend dependencies
npm install @better-auth/react @better-auth/vue @better-auth/node
```

### 2. Configure Environment Variables
Create a `.env` file with:
```
BETTER_AUTH_SECRET="your-secret-key-here-at-least-32-characters-long"
AUTH_ORIGIN="http://localhost:3000"
```

## Basic Authentication Flow Test

### Test 1: JWT Token Issuance
**Objective**: Verify Better Auth issues valid JWT tokens

1. Start the Better Auth server
2. Simulate user login request
3. Verify JWT token is returned with proper structure
4. Check token contains user_id claim
5. Validate token signature

**Expected Result**: Valid JWT token with user_id and expiration claims

### Test 2: Token Verification
**Objective**: Verify backend can validate JWT tokens

1. Obtain a valid JWT token from Better Auth
2. Make request to protected endpoint with Authorization header
3. Verify backend accepts valid token
4. Verify backend extracts user_id correctly
5. Confirm request succeeds

**Expected Result**: Request processed successfully with authenticated user context

### Test 3: Invalid Token Handling
**Objective**: Verify backend rejects invalid tokens

1. Make request with malformed JWT token
2. Make request with expired JWT token
3. Make request with missing Authorization header
4. Confirm backend returns HTTP 401 for all cases

**Expected Result**: HTTP 401 Unauthorized for all invalid token scenarios

### Test 4: User Data Isolation
**Objective**: Verify users can only access their own data

1. Authenticate as User A
2. Request User A's data - should succeed
3. Request User B's data - should return only User A's data or HTTP 403
4. Authenticate as User B
5. Request User B's data - should succeed
6. Request User A's data - should return only User B's data or HTTP 403

**Expected Result**: Each user can only access their own data

## End-to-End Test Scenario

### Complete Authentication Flow
1. **Setup**: Start Better Auth and FastAPI servers
2. **Login**: User logs in via Better Auth → receives JWT
3. **Storage**: Frontend securely stores JWT
4. **API Call**: Frontend makes API request with JWT in header
5. **Validation**: Backend verifies JWT and extracts user_id
6. **Filtering**: Backend filters data by authenticated user_id
7. **Response**: Backend returns user-specific data
8. **Logout**: Frontend clears JWT from storage

### Expected Results
- User can access their own data after authentication
- User cannot access other users' data
- Invalid tokens are rejected with HTTP 401
- Token expiration is handled gracefully

## Common Test Commands

### Backend Testing
```bash
# Run backend with authentication
uvicorn main:app --reload

# Test protected endpoint
curl -H "Authorization: Bearer <valid-jwt-token>" http://localhost:8000/api/tasks
```

### Frontend Testing
```bash
# Run frontend with Better Auth
npm run dev

# Test authentication flow manually in browser
```

### Automated Testing
```bash
# Run unit tests for auth components
pytest tests/test_auth.py

# Run integration tests
pytest tests/test_integration.py
```

## Troubleshooting

### Common Issues
1. **JWT Signature Mismatch**: Verify BETTER_AUTH_SECRET matches between auth provider and verifier
2. **CORS Errors**: Check AUTH_ORIGIN configuration
3. **Token Not Refreshing**: Verify refresh token configuration
4. **User Data Not Filtered**: Confirm user_id extraction and filtering logic

### Debugging Steps
1. Check logs for authentication middleware
2. Verify JWT token structure using jwt.io
3. Confirm environment variables are loaded correctly
4. Test token validation with manual JWT decode