"""
Authentication utilities for password hashing and session management
"""

import json
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
from jose import JWTError, jwt
from config import config


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload
    except JWTError:
        return None


def load_users() -> Dict[str, Any]:
    """Load users from JSON file"""
    try:
        with open(config.USERS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_users(users: Dict[str, Any]) -> None:
    """Save users to JSON file"""
    os.makedirs(config.SYSTEM_DIR, exist_ok=True)
    with open(config.USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


def get_user(username: str) -> Optional[Dict[str, Any]]:
    """Get user by username"""
    users = load_users()
    return users.get(username)


def create_user(username: str, password: str) -> Dict[str, Any]:
    """Create a new user"""
    users = load_users()
    
    if username in users:
        raise ValueError("User already exists")
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)
    
    user_data = {
        "user_id": user_id,
        "username": username,
        "password_hash": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
        "sessions": {}
    }
    
    users[username] = user_data
    save_users(users)
    
    return user_data


def create_session(username: str) -> str:
    """Create a new session for a user"""
    users = load_users()
    user = users.get(username)
    
    if not user:
        raise ValueError("User not found")
    
    session_uid = str(uuid.uuid4())
    session_data = {
        "session_uid": session_uid,
        "created_at": datetime.utcnow().isoformat(),
        "last_activity": datetime.utcnow().isoformat()
    }
    
    user["sessions"][session_uid] = session_data
    save_users(users)
    
    # Create session directory
    session_dir = os.path.join(config.DATA_DIR, user["user_id"], session_uid)
    os.makedirs(session_dir, exist_ok=True)
    
    return session_uid


def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user with username and password"""
    user = get_user(username)
    if not user:
        return None
    
    if verify_password(password, user["password_hash"]):
        return user
    
    return None


def get_session_path(user_id: str, session_uid: str) -> str:
    """Get the full path to a user's session directory"""
    return os.path.join(config.DATA_DIR, user_id, session_uid)