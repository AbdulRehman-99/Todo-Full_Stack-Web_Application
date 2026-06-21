---
title: AI Todo Backend
emoji: 📝
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# AI Todo Backend

FastAPI backend for the AI Todo Application. It performs CRUD operations.

## Deployment to Hugging Face Spaces

This backend is configured to run on Hugging Face Spaces using Docker.

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Docker

Build and run locally:
```bash
docker build -t todo-backend .
docker run -p 7860:7860 todo-backend
```
kkk