from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlmodel.ext.asyncio.session import AsyncSession
from contextlib import asynccontextmanager
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# Import models
from models import Task, User
from database import engine
from routers import tasks, auth

# CORS settings
import json
cors_env = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:3005", "http://127.0.0.1:3005", "http://localhost:3000", "http://127.0.0.1:3000"]')
try:
    # Parse as JSON if it's in JSON format, otherwise fall back to comma split
    ALLOWED_ORIGINS = json.loads(cors_env)
except json.JSONDecodeError:
    # Fallback to comma-separated string
    ALLOWED_ORIGINS = cors_env.split(",")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    # Using sync method since engine.begin() is not an async context manager
    with engine.begin() as conn:
        SQLModel.metadata.create_all(bind=conn)
    yield
    # Cleanup code here (if needed)


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router, prefix="/api/v1", tags=["tasks"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Todo API with Authentication"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)