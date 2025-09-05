#!/usr/bin/env python3
"""
Test script to verify database and API functionality
"""

import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Lesson, LessonContent, QuizQuestion
from app.crud import get_lesson, get_lessons

# Create database session
DATABASE_URL = "sqlite:///./finesse.db"
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_database():
    """Test database connectivity and data"""
    db = SessionLocal()
    
    try:
        # Check if lessons exist
        lessons = db.query(Lesson).all()
        print(f"Found {len(lessons)} lessons in database:")
        
        for lesson in lessons:
            print(f"  - {lesson.id}: {lesson.title}")
            content_count = db.query(LessonContent).filter(LessonContent.lesson_id == lesson.id).count()
            print(f"    Content items: {content_count}")
        
        # Test getting a specific lesson
        if lessons:
            lesson_id = lessons[0].id
            lesson = get_lesson(db, lesson_id)
            if lesson:
                print(f"\nTesting lesson {lesson_id}:")
                print(f"  Title: {lesson.title}")
                print(f"  Content items: {len(lesson.content_items)}")
                for content in lesson.content_items:
                    print(f"    - {content.content_type}: {content.title}")
            else:
                print(f"Could not retrieve lesson {lesson_id}")
        
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        db.close()

def seed_simple_lesson():
    """Create a simple lesson for testing"""
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(QuizQuestion).delete()
        db.query(LessonContent).delete()
        db.query(Lesson).delete()
        db.commit()
        
        # Create a simple lesson
        lesson = Lesson(
            title="Test Lesson",
            description="A simple test lesson",
            icon="📚",
            xp_reward=100,
            estimated_duration=15,
            order_index=1
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        
        # Add content
        content1 = LessonContent(
            lesson_id=lesson.id,
            content_type="text",
            title="Introduction",
            content=json.dumps({"text": "Welcome to this lesson!"}),
            order_index=1
        )
        db.add(content1)
        
        content2 = LessonContent(
            lesson_id=lesson.id,
            content_type="quiz",
            title="Quick Quiz",
            content=json.dumps({
                "question": "What is 2+2?",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 1,
                "explanation": "2+2 equals 4"
            }),
            order_index=2
        )
        db.add(content2)
        
        db.commit()
        print(f"Created test lesson with ID: {lesson.id}")
        
    except Exception as e:
        print(f"Error creating test lesson: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Database Test ===")
    test_database()
    
    print("\n=== Creating Simple Test Lesson ===")
    seed_simple_lesson()
    
    print("\n=== Testing After Seeding ===")
    test_database()
