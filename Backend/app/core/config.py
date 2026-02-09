"""
Configuration settings for the Backend API
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file in the Backend directory
current_file_dir = os.path.dirname(os.path.abspath(__file__))  # app/core/
backend_dir = os.path.join(current_file_dir, "..", "..")  # Go to Backend/
env_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database settings - will be loaded from environment variable
    database_url: str = "sqlite:///./todo_app.db"  # Default fallback if env var not set

    # CORS settings
    backend_cors_origins: List[str] = [
        "http://localhost:3005",
        "http://localhost:3000",
        "http://127.0.0.1:3005",
        "http://127.0.0.1:3000"
    ]

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
        env_file = "../../.env"  # Look for .env in Backend directory (since we're in app/core/)
        env_file_encoding = "utf-8"


# Initialize settings
settings = Settings()