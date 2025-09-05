from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from .. import models, security, crud, schemas
from ..dependencies import get_db

router = APIRouter(tags=["auth"])

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Try to find user by username or email
    user = db.query(models.User).filter(
        (models.User.username == form_data.username) | 
        (models.User.email == form_data.username)
    ).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(
        data={"sub": user.username}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

@router.post("/register", response_model=dict)
async def register_user(user_data: dict, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(
        (models.User.email == user_data.get('email')) | 
        (models.User.username == user_data.get('username'))
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    try:
        # Create new user with only the required fields
        hashed_password = security.get_password_hash(user_data.get('password'))
        db_user = models.User(
            username=user_data.get('username'),
            email=user_data.get('email'),
            hashed_password=hashed_password,
            is_active=True  # This field exists in the model
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Generate access token
        access_token = security.create_access_token(
            data={"sub": db_user.username}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create the user
    db_user = crud.create_user(db=db, user=user)
    
    # Generate access token
    access_token = security.create_access_token(
        data={"sub": user.username}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "email": user.email
    }
