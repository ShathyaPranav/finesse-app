from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
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

# Lesson CRUD operations
def get_lessons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Lesson).filter(models.Lesson.is_active == True).order_by(models.Lesson.order_index).offset(skip).limit(limit).all()

def get_lesson(db: Session, lesson_id: int):
    return db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()

def create_lesson(db: Session, lesson):
    db_lesson = models.Lesson(
        title=lesson.title,
        description=lesson.description,
        content=lesson.content,
        xp_reward=lesson.xp_reward,
        category=lesson.category,
        order_index=lesson.order_index
    )
    db.add(db_lesson)
    db.commit()
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