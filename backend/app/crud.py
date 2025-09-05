from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from datetime import datetime
import json
from typing import Dict, Any, List, Optional
from . import models, schemas, security


def get_user(db: Session, user_id: int):
    """
    Retrieves a single user from the database by their ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, username: str, email: str, password: str):
    hashed_password = security.get_password_hash(password)
    db_user = models.User(username=username, email=email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Additional user helpers
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_leaderboard(db: Session, limit: int = 10):
    """Return top users ordered by xp_points descending."""
    return (db.query(models.User)
            .order_by(models.User.xp_points.desc())
            .limit(limit)
            .all())

def set_user_xp(db: Session, user_id: int, xp_points: int):
    """Set a user's total XP points to the given value and return the user."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    user.xp_points = xp_points
    db.commit()
    db.refresh(user)
    return user

def set_user_streak(db: Session, user_id: int, streak_days: int):
    """Set a user's current streak days and return the user."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    user.streak_days = streak_days
    db.commit()
    db.refresh(user)
    return user

# Content CRUD operations
def create_lesson_content(db: Session, content, lesson_id: int):
    db_content = models.LessonContent(
        lesson_id=lesson_id,
        content_type=content.content_type,
        title=content.title,
        content=content.content,
        order_index=content.order_index
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

def create_quiz_question(db: Session, question, lesson_content_id: int):
    db_question = models.QuizQuestion(
        lesson_content_id=lesson_content_id,
        question=question.question,
        options=question.options,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        order_index=question.order_index
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

# Lesson CRUD operations
def get_lessons(db: Session, skip: int = 0, limit: int = 100):
    # Eager-load related content to avoid lazy-load access during response serialization
    return (db.query(models.Lesson)
            .options(joinedload(models.Lesson.content_items))
            .filter(models.Lesson.is_active == True)
            .order_by(models.Lesson.order_index)
            .offset(skip).limit(limit)
            .all())

def get_lesson(db: Session, lesson_id: int):
    return (db.query(models.Lesson)
            .options(
                joinedload(models.Lesson.content_items)
                .joinedload(models.LessonContent.quiz_questions)
            )
            .filter(models.Lesson.id == lesson_id)
            .first())

def create_lesson(db: Session, lesson):
    db_lesson = models.Lesson(
        title=lesson.title,
        description=lesson.description,
        icon=lesson.icon,
        xp_reward=lesson.xp_reward,
        estimated_duration=lesson.estimated_duration,
        order_index=lesson.order_index,
        is_active=lesson.is_active
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    
    # Add content items
    for content_item in lesson.content_items:
        db_content = create_lesson_content(db, content_item, db_lesson.id)
        
        # If it's a quiz, add questions
        if content_item.content_type == 'quiz' and 'questions' in content_item.content:
            for question in content_item.content['questions']:
                create_quiz_question(db, question, db_content.id)
    
    db.refresh(db_lesson)
    return db_lesson

# User Progress CRUD operations
def get_user_progress(db: Session, user_id: int):
    return db.query(models.UserProgress).filter(models.UserProgress.user_id == user_id).all()

def get_user_lesson_progress(db: Session, user_id: int, lesson_id: int):
    return db.query(models.UserProgress).filter(
        and_(models.UserProgress.user_id == user_id, models.UserProgress.lesson_id == lesson_id)
    ).first()

def update_user_progress(db: Session, user_id: int, lesson_id: int, progress_percentage: int):
    # Check if progress record exists
    progress = get_user_lesson_progress(db, user_id, lesson_id)
    
    if not progress:
        # Create new progress record
        progress = models.UserProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            progress_percentage=progress_percentage,
            is_completed=progress_percentage >= 100
        )
        db.add(progress)
    else:
        # Update existing progress
        progress.progress_percentage = progress_percentage
        progress.is_completed = progress_percentage >= 100
        if progress_percentage >= 100 and not progress.completed_at:
            progress.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    return progress