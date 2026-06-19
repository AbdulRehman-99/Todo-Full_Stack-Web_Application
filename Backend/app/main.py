"""
Main FastAPI application for the Backend API
"""
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter

from app.core.config import settings
from app.routes import tasks
from app.routes import auth
from chat.router import get_chat_router


# Create the FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # expose_headers=["Access-Control-Allow-Origin"]
)


# Include API routes
app.include_router(tasks.router, prefix="/api/{user_id}/tasks", tags=["tasks"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

# Include chat API routes
chat_router = get_chat_router()
app.include_router(chat_router)


@app.get("/")
def read_root():
    """Root endpoint for health check"""
    return {"message": "Todo API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "todo-backend"}