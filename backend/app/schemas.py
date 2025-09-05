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

from typing import Union

class ContentBase(BaseModel):
    content_type: str  # 'text', 'quiz', 'video', 'interactive'
    title: str
    content: Union[dict, str]  # Can be either JSON-serializable content or string
    order_index: int = 0

class ContentCreate(ContentBase):
    pass

class ContentResponse(ContentBase):
    id: int
    lesson_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuizQuestionBase(BaseModel):
    question: str
    options: list[str]
    correct_answer: int
    explanation: str
    order_index: int = 0

class QuizQuestionCreate(QuizQuestionBase):
    pass

class QuizQuestionResponse(QuizQuestionBase):
    id: int
    lesson_content_id: int

    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    title: str
    description: str
    icon: str = "📚"
    xp_reward: int = 100
    estimated_duration: int = 15  # in minutes
    order_index: int = 0
    is_active: bool = True

class LessonCreate(LessonBase):
    content_items: list[ContentCreate] = []

class LessonResponse(LessonBase):
    id: int
    content_items: list[ContentResponse] = []
    created_at: datetime
    updated_at: datetime

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