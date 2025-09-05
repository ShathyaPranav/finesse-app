from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..dependencies import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user_by_username = crud.get_user_by_username(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.get("/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# Leaderboard: Top users by XP
@router.get("/leaderboard", response_model=list[schemas.User])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    users = crud.get_leaderboard(db, limit=limit)
    return users

# Set a user's total XP (used to sync XP to DB)
@router.post("/{user_id}/xp", response_model=schemas.User)
def set_user_xp(user_id: int, payload: dict, db: Session = Depends(get_db)):
    xp_points = payload.get("xp_points")
    if not isinstance(xp_points, int) or xp_points < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="xp_points must be a non-negative integer")
    user = crud.set_user_xp(db, user_id=user_id, xp_points=xp_points)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Set a user's current streak days
@router.post("/{user_id}/streak", response_model=schemas.User)
def set_user_streak(user_id: int, payload: dict, db: Session = Depends(get_db)):
    streak_days = payload.get("streak_days")
    if not isinstance(streak_days, int) or streak_days < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="streak_days must be a non-negative integer")
    user = crud.set_user_streak(db, user_id=user_id, streak_days=streak_days)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user