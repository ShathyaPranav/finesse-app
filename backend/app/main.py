from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, users, lessons

# This line creates the database tables if they don't exist.
# For production, a migration tool like Alembic is recommended.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finesse API", description="Gamified Educational Platform for Retail Investors")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(lessons.router, prefix="/api", tags=["lessons"])

@app.get("/")
def read_root():
    return {"message": "Finesse Backend API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "finesse-backend"}
