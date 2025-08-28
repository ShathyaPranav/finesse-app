from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, crud
from ..dependencies import get_db

router = APIRouter()

@router.get("/lessons", response_model=List[schemas.LessonResponse])
def get_lessons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all available lessons"""
    lessons = crud.get_lessons(db, skip=skip, limit=limit)
    return lessons

@router.get("/lessons/{lesson_id}", response_model=schemas.LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Get a specific lesson by ID"""
    lesson = crud.get_lesson(db, lesson_id=lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/lessons", response_model=schemas.LessonResponse)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db)):
    """Create a new lesson"""
    return crud.create_lesson(db=db, lesson=lesson)

@router.get("/users/{user_id}/progress", response_model=List[schemas.UserProgressResponse])
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    """Get user's progress for all lessons"""
    progress = crud.get_user_progress(db, user_id=user_id)
    return progress

@router.post("/users/{user_id}/lessons/{lesson_id}/progress")
def update_lesson_progress(
    user_id: int, 
    lesson_id: int, 
    progress_data: schemas.ProgressUpdate,
    db: Session = Depends(get_db)
):
    """Update user's progress for a specific lesson"""
    progress = crud.update_user_progress(
        db=db, 
        user_id=user_id, 
        lesson_id=lesson_id, 
        progress_percentage=progress_data.progress_percentage
    )
    return progress
