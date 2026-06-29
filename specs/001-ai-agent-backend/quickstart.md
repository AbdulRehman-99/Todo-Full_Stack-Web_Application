# Quickstart Guide: AI-Todo-Agent Backend

## Prerequisites

- Python 3.11+
- pip package manager
- Git
- Neon PostgreSQL account (or local PostgreSQL for development)
- OpenAI API key
- MCP SDK access

## Environment Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd <repository-root>
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install openai python-mcp sqlmodel fastapi uvicorn psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-dotenv
```

### 4. Environment Variables
Create a `.env` file in the Backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
NEON_DATABASE_URL=your_neon_database_url_here
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Database Setup

### 1. Initialize Database
```bash
cd Backend
python init_db.py
```

### 2. Run Migrations (if using Alembic)
```bash
alembic revision --autogenerate -m "Add conversation models"
alembic upgrade head
```

## Running the Application

### 1. Start the Server
```bash
cd Backend
uvicorn main:app --reload --port 8000
```

### 2. Verify Installation
Visit `http://localhost:8000/docs` to see the API documentation.

## API Usage

### 1. Chat Endpoint
Send a POST request to `/api/{user_id}/chat`:

```bash
curl -X POST http://localhost:8000/api/user123/chat \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a new task: Buy groceries",
    "conversation_id": null
  }'
```

### 2. Expected Response
```json
{
  "response": "I've added the task 'Buy groceries' to your list.",
  "conversation_id": 123,
  "timestamp": "2023-12-01T10:00:00Z"
}
```

## Development Workflow

### 1. Adding New MCP Tools
1. Create tool in `Backend/mcp/task_tools.py`
2. Register tool with MCP server in `Backend/mcp/server.py`
3. Update tool schemas as needed

### 2. Modifying Agent Behavior
1. Update system prompt in `Backend/Agent/config.py`
2. Adjust agent parameters as needed
3. Test with various conversation scenarios

### 3. Running Tests
```bash
cd Backend
pytest tests/test_ai_chat.py -v
```

## Configuration Options

### 1. Agent Settings
Modify `Backend/Agent/config.py` to adjust:
- Model selection
- Temperature settings
- System prompt
- Conversation history window size

### 2. MCP Server Settings
Modify `Backend/mcp/server.py` to configure:
- Tool availability
- Authentication requirements
- Rate limiting
- Logging levels

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check credentials in environment variables

2. **Authentication Failures**
   - Verify JWT token format and validity
   - Check that user_id matches token claims
   - Ensure auth middleware is properly configured

3. **MCP Tool Registration Failures**
   - Confirm all required MCP SDK dependencies are installed
   - Check that tools are properly registered with the server
   - Verify tool function signatures match expected patterns

### Debugging
Enable debug logging by setting:
```env
LOG_LEVEL=DEBUG
```

## Next Steps

1. Implement additional MCP tools as needed
2. Fine-tune agent prompts for better user experience
3. Add monitoring and alerting for production deployments
4. Expand test coverage for edge cases