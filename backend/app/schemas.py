from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    xp_points: int
    streak_days: int
    created_at: datetime

    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    title: str
    description: str
    content: str
    xp_reward: int
    category: str

class LessonCreate(LessonBase):
    order_index: int = 0

class LessonResponse(LessonBase):
    id: int
    order_index: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserProgressBase(BaseModel):
    progress_percentage: int
    is_completed: bool

class UserProgressResponse(UserProgressBase):
    id: int
    user_id: int
    lesson_id: int
    started_at: datetime
    completed_at: Optional[datetime]
    lesson: LessonResponse

    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    progress_percentage: int

class UserStats(BaseModel):
    xp_points: int
    streak_days: int
    lessons_completed: int
    total_lessons: int