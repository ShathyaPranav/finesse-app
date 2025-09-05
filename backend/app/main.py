from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import users, lessons
from .routers import tutor as tutor_router
from .routers.auth import router as auth_router

# This line creates the database tables if they don't exist.
# For production, a migration tool like Alembic is recommended.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finesse API", description="Gamified Educational Platform for Retail Investors")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth_router, prefix="/api")
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(lessons.router, prefix="/api", tags=["lessons"])
app.include_router(tutor_router.router, prefix="/api", tags=["tutor"])

@app.get("/")
def read_root():
    return {
        "message": "Finesse Backend API",
        "status": "running",
        "routes": [{"path": route.path, "name": route.name} for route in app.routes]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "finesse-backend"}
