"""
Database initialization script for the Todo application using SQLModel
"""
from sqlmodel import SQLModel
from app.db.session import engine
from app.models.task import Task

def create_tables():
    """
    Create all tables in the database using SQLModel
    """
    print("Creating database tables using SQLModel...")
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()