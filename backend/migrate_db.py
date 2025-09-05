#!/usr/bin/env python3
"""
Database migration script to recreate tables with correct schema
"""

import os
from sqlalchemy import create_engine
from app.database import Base
from app.models import User, Lesson, LessonContent, QuizQuestion, UserProgress

# Get database URL from config
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finesse.db")

def migrate_database():
    """Drop and recreate all tables with current schema"""
    print("Starting database migration...")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Drop all tables
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables with current schema
    print("Creating tables with updated schema...")
    Base.metadata.create_all(bind=engine)
    
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate_database()
