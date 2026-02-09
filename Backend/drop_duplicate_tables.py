"""
Script to drop duplicate tables (tasks and users) that were created in error
Keeping the original singular-named tables (task and user) that contain the data
"""
from app.db.session import engine
from sqlalchemy import text

def drop_duplicate_tables():
    """
    Drop the duplicate plural-named tables
    """
    print("Dropping duplicate tables (tasks and users)...")

    with engine.connect() as conn:
        # Begin a transaction
        trans = conn.begin()

        try:
            # Drop the duplicate tables
            conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))

            # Commit the transaction
            trans.commit()
            print("Duplicate tables dropped successfully!")

            # Show remaining tables
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"))
            tables = result.fetchall()

            print("\nRemaining tables in the database:")
            for table in tables:
                print(f"- {table[0]}")

        except Exception as e:
            # Rollback the transaction if there's an error
            trans.rollback()
            print(f"Error dropping tables: {e}")
            raise

if __name__ == "__main__":
    drop_duplicate_tables()