from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import hashlib
import os
from jose import JWTError, jwt
from fastapi import HTTPException, status
from .config import settings

# Password Hashing using SHA-256 with salt
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Extract the salt and hash from the stored password
    try:
        salt = hashed_password[:32]  # First 32 chars are the salt
        stored_hash = hashed_password[32:]  # Rest is the hash
        
        # Hash the provided password with the same salt
        hasher = hashlib.sha256()
        hasher.update(salt.encode('utf-8') + plain_password.encode('utf-8'))
        computed_hash = hasher.hexdigest()
        
        return computed_hash == stored_hash
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    # Generate a random salt
    salt = os.urandom(16).hex()
    
    # Hash the password with the salt
    hasher = hashlib.sha256()
    hasher.update(salt.encode('utf-8') + password.encode('utf-8'))
    hashed_password = hasher.hexdigest()
    
    # Return salt + hash
    return salt + hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Generate a secure random key if not exists
    if not hasattr(settings, 'SECRET_KEY') or not settings.SECRET_KEY:
        settings.SECRET_KEY = os.urandom(32).hex()
    
    # Create JWT token
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode JWT token using PyJWT"""
    try:
        if not hasattr(settings, 'SECRET_KEY') or not settings.SECRET_KEY:
            return None
            
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            options={"verify_exp": True}
        )
        return payload
    except JWTError:
        return None
