"""
Database session management for the Backend API
"""
from sqlmodel import create_engine, Session
from typing import Generator
from app.core.config import settings
import os


# Create the database engine
# Use SQLite for easier setup, but keep the same interface for PostgreSQL migration
if settings.database_url.startswith("postgresql"):
    # Use PostgreSQL if the URL is provided
    from sqlalchemy import create_engine as sqlalchemy_create_engine
    engine = create_engine(
        settings.database_url,
        echo=False,  # Set to True to see SQL queries in logs
        pool_pre_ping=True,  # Verify connections before using them
    )
else:
    # Default to SQLite for easier local development
    sqlite_url = "sqlite:///./todo_app.db"
    engine = create_engine(
        sqlite_url,
        echo=False,  # Set to True to see SQL queries in logs
        # For SQLite, we need to add connect_args for proper threading
        connect_args={"check_same_thread": False} if sqlite_url.startswith("sqlite") else {}
    )


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get a database session

    Yields:
        Session: Database session for the request
    """
    with Session(engine) as session:
        yield session