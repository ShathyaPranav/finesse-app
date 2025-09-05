from sqlalchemy import create_engine
from app.database import Base
from app.models import Lesson, LessonContent, QuizQuestion, User, UserProgress
import os

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/finesse_db")

def upgrade_database():
    print("Creating database tables...")
    engine = create_engine(DATABASE_URL)
    
    # Drop all tables (for development only - use migrations in production)
    print("Dropping existing tables...")
    Base.metadata.drop_all(engine)
    
    # Create all tables
    print("Creating new tables...")
    Base.metadata.create_all(engine)
    
    print("Database upgrade completed successfully!")

if __name__ == "__main__":
    upgrade_database()
