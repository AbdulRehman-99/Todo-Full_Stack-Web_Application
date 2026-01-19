# Research & Decisions: JWT-based Authentication Integration

## Technology Selection

### JWT Algorithm Decision
**Decision**: Use RS256 (RSA Signature with SHA-256) for JWT signing
**Rationale**:
- RS256 provides asymmetric encryption, allowing public key verification
- Better security than HS256 (symmetric) as the signing key stays on the auth server
- Public key can be distributed safely for verification
- Industry standard for distributed systems

**Alternative Considered**: HS256 (HMAC with SHA-256)
**Rejection Reason**: Symmetric algorithm means both parties share the same secret, creating security risks in distributed systems

### Token Storage Strategy
**Decision**: Use HttpOnly cookies for access tokens and secure storage for refresh tokens in frontend
**Rationale**:
- Access tokens in HttpOnly cookies provide protection against XSS attacks as they are inaccessible to JavaScript
- Automatic inclusion in requests by the browser for access tokens
- Secure flag ensures transmission over HTTPS only
- SameSite attribute prevents CSRF attacks
- Refresh tokens stored securely in memory/localStorage as needed (shorter lived, used less frequently)

**Alternative Considered**: localStorage/sessionStorage for all tokens
**Rejection Reason**: Vulnerable to XSS attacks where JavaScript can access tokens

### Token Expiration Strategy
**Decision**: 15-minute access tokens with 7-day refresh tokens
**Rationale**:
- Short-lived access tokens reduce window of attack if compromised
- Refresh tokens allow seamless user experience without frequent re-authentication
- 15 minutes is appropriate for most web applications
- 7-day refresh token balances security with user convenience

## Architecture Decisions

### Stateless vs Stateful Authentication
**Decision**: Stateless authentication (no server-side session storage)
**Rationale**:
- Aligns with microservices architecture
- Reduces server memory usage
- Simplifies horizontal scaling
- Matches requirement FR-007 (no server-side session storage)

**Considered Alternative**: Stateful with server-side session storage
**Rejection Reason**: Would require shared session store across services and create scaling complexity

### CORS Policy Decision
**Decision**: Configure CORS to allow specific origins only
**Rationale**:
- Prevents cross-site request forgery attacks
- Controls which domains can make requests to the API
- Maintains security while allowing legitimate cross-origin requests

**Configuration**:
- Allow specific frontend domains (development and production)
- Allow credentials to be sent with requests
- Support standard HTTP methods and headers

## Security Considerations

### Secret Management
**Decision**: Use environment variables for JWT secrets
**Implementation**:
- BETTER_AUTH_SECRET environment variable
- Different secrets per environment (dev, staging, prod)
- Secrets never stored in source code
- CI/CD pipeline injects secrets during deployment

### Token Revocation Strategy
**Decision**: No token revocation for access tokens (stateless approach)
**Rationale**:
- Aligns with stateless architecture
- Short token lifetime (15 min) limits risk
- Refresh tokens can be managed separately if needed

**Exception**: Logout clears tokens from frontend only
- No backend invalidation required
- User must re-authenticate after logout

## Implementation Patterns

### Error Handling Pattern
**Decision**: Return HTTP 401 for invalid/missing tokens
**Rationale**:
- Standard HTTP status code for authentication failures
- Allows frontend to handle redirect/login logic
- Clear separation of concerns between backend and frontend

### User Identification Pattern
**Decision**: Extract user_id from JWT payload and use for data filtering
**Implementation**:
- Backend middleware parses JWT and extracts user_id
- All data queries filtered by authenticated user_id
- Ensures data isolation between users

## Frontend Integration Patterns

### Token Attachment Pattern
**Decision**: Use HTTP interceptors to attach JWT to requests
**Rationale**:
- Centralized approach for token management
- Automatic attachment to all API requests
- Handles token refresh seamlessly

### Token Refresh Pattern
**Decision**: Silent refresh when access token expires
**Implementation**:
- Detect 401 responses due to expired tokens
- Use refresh token to obtain new access token
- Retry original request with new token
- Redirect to login if refresh token also expired

## Backend Integration Patterns

### Middleware Architecture
**Decision**: Implement JWT validation as FastAPI dependency
**Rationale**:
- Leverages FastAPI's dependency injection system
- Reusable across multiple endpoints
- Clean separation of authentication logic
- Easy to test and maintain

### User Context Injection
**Decision**: Inject authenticated user context into request handlers
**Implementation**:
- Middleware extracts user_id and adds to request state
- Handlers receive user context automatically
- Ensures all handlers have access to authenticated user