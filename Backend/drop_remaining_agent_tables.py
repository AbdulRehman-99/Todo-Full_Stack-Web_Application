#!/usr/bin/env python3
"""
Script to drop any remaining Agent-related tables from the local SQLite database
"""
import sqlite3
import os

# Connect to the local SQLite database
db_path = "todo_app.db"
if not os.path.exists(db_path):
    print(f"Database file {db_path} does not exist.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get list of all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Current tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Drop Agent-related tables if they exist (using the correct singular names)
agent_tables = ['conversation', 'message', 'toolcall']  # Based on the output from previous command
dropped_tables = []

for table in agent_tables:
    try:
        cursor.execute(f"DROP TABLE IF EXISTS {table};")
        dropped_tables.append(table)
        print(f"Dropped table: {table}")
    except sqlite3.Error as e:
        print(f"Error dropping table {table}: {e}")

# Commit changes and close connection
conn.commit()
conn.close()

print(f"\nSuccessfully dropped {len(dropped_tables)} Agent-related tables: {', '.join(dropped_tables)}")
print("Database cleanup completed.")