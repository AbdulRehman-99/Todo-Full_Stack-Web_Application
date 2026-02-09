"""
SQLModel models for the Todo application
This file defines the Task model that links to the User model in the same database
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


import sys
import os

# Add Backend root to path to import the main models
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Go from app/models/ to Backend/
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# Import the Task model from the main models file to avoid duplicate table definitions
import sys
import os

# Add Backend root to path to import the main models
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Go from app/models/ to Backend/
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from models import Task