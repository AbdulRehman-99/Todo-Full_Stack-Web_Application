"""
Test script to verify database connection and check for data
"""
from sqlmodel import select
from app.db.session import engine
from app.models.task import Task
from app.core.config import settings

def test_db_connection():
    """
    Test the database connection and check for existing data
    """
    print(f"Using database URL: {settings.database_url[:50]}...")  # Print first 50 chars to verify

    # Try to connect and query
    try:
        from sqlmodel import Session, select

        with Session(engine) as session:
            # Count existing tasks
            statement = select(Task)
            results = session.exec(statement)
            tasks = results.all()

            print(f"Connected to database successfully!")
            print(f"Number of tasks found: {len(tasks)}")

            if tasks:
                print("Task IDs found:")
                for task in tasks:
                    print(f"  - ID: {task.id}, Title: {task.title}, User: {task.user_id}")
            else:
                print("No tasks found in the database.")

    except Exception as e:
        print(f"Error connecting to database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_db_connection()