# Data Model: JWT-based Authentication Integration

## Core Entities

### User
- **user_id**: String (UUID) - Unique identifier for each user
- **email**: String - User's email address (unique)
- **username**: String - User's chosen username (optional, unique)
- **created_at**: DateTime - Timestamp of account creation
- **updated_at**: DateTime - Timestamp of last update
- **is_active**: Boolean - Whether the account is active

### JWT Token
- **token_id**: String (UUID) - Unique identifier for the token
- **user_id**: String (UUID) - Reference to the user who owns this token
- **token_type**: Enum ['access', 'refresh'] - Type of JWT token
- **payload**: Object - Claims contained in the JWT
- **expires_at**: DateTime - Expiration timestamp
- **created_at**: DateTime - Timestamp of token creation

## Relationships

### User : JWT Token (One-to-Many)
- One user can have multiple JWT tokens (though typically just one active pair)
- Foreign key: JWT Token.user_id references User.user_id

## Constraints

### User Entity
- Email must be unique and valid format
- Usernames must be unique if provided
- User_id must be globally unique
- Created_at timestamp is immutable after creation

### JWT Token Entity
- Token_id must be globally unique
- Expires_at must be in the future when created
- Token_type must be either 'access' or 'refresh'
- No server-side storage or revocation tracking (stateless approach)

## Indexes

### User
- Index on email (for authentication lookup)
- Index on username (if present, for identification)
- Index on user_id (primary lookup)

### JWT Token
- Index on user_id (for user token queries)
- Index on expires_at (for cleanup operations)
- Index on token_id (for validation)

## Data Flow

### Authentication Process
1. User provides credentials → System validates → Issues JWT
2. JWT contains user_id and expiration
3. Backend verifies JWT signature and extracts user_id
4. Backend filters data by authenticated user_id

### Token Lifecycle
1. User authenticates → Access token (15 min) and refresh token (7 days) issued
2. Access token used for API requests
3. When access token expires, refresh token used to get new access token
4. When refresh token expires, user must re-authenticate
5. No server-side token revocation (stateless approach)