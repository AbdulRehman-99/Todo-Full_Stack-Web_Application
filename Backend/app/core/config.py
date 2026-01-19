"""
Configuration settings for the Backend API
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database settings - will be loaded from environment variable
    database_url: str = "sqlite:///./todo_app.db"  # Default fallback

    # CORS settings
    backend_cors_origins: List[str] = ["http://localhost:3005"]

    # JWT settings (for future auth)
    secret_key: Optional[str] = None
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Better Auth secret
    better_auth_secret: Optional[str] = None

    # Additional settings from .env file
    neon_database_url: Optional[str] = None
    server_host: str = "localhost"
    server_port: int = 8000

    class Config:
        env_file = "Backend/.env"  # Look for .env in Backend directory
        env_file_encoding = "utf-8"


# Initialize settings
settings = Settings()