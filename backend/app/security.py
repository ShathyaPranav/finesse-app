from datetime import datetime, timedelta
from typing import Optional
import json
import base64
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import hmac
import hashlib
from passlib.context import CryptContext
from .config import settings

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# JWT Token Creation using pycryptodome
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    
    # Create JWT header
    header = {
        "alg": settings.ALGORITHM,
        "typ": "JWT"
    }
    
    # Encode header and payload
    header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
    payload_encoded = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip('=')
    
    # Create signature using HMAC-SHA256
    message = f"{header_encoded}.{payload_encoded}"
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).digest()
    signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    
    return f"{message}.{signature_encoded}"

def verify_token(token: str):
    """Verify and decode JWT token"""
    try:
        # Split token into parts
        header_encoded, payload_encoded, signature_encoded = token.split('.')
        
        # Verify signature
        message = f"{header_encoded}.{payload_encoded}"
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).digest()
        
        # Add padding if needed
        signature_encoded += '=' * (4 - len(signature_encoded) % 4)
        provided_signature = base64.urlsafe_b64decode(signature_encoded)
        
        if not hmac.compare_digest(expected_signature, provided_signature):
            return None
            
        # Decode payload
        payload_encoded += '=' * (4 - len(payload_encoded) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_encoded).decode())
        
        # Check expiration
        if payload.get('exp', 0) < datetime.utcnow().timestamp():
            return None
            
        return payload
        
    except Exception:
        return None
