"""
Main FastAPI application for the Backend API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import tasks


# Create the FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")


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
app.include_router(tasks.router, prefix="/api/{user_id}", tags=["tasks"])


@app.get("/")
def read_root():
    """Root endpoint for health check"""
    return {"message": "Todo API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "todo-backend"}