"""
Authentication routes for user registration, login, and logout
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta

from auth.utils import (
    create_user, authenticate_user, create_session, 
    create_access_token, verify_token, get_user
)
from config import config


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    session_uid: str


class UserResponse(BaseModel):
    user_id: str
    username: str
    session_uid: str


auth_router = APIRouter()
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


@auth_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        user = create_user(user_data.username, user_data.password)
        session_uid = create_session(user_data.username)
        
        return UserResponse(
            user_id=user["user_id"],
            username=user["username"],
            session_uid=session_uid
        )
    except ValueError as e:
        if "already exists" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@auth_router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return access token"""
    user = authenticate_user(user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new session
    session_uid = create_session(user_data.username)
    
    # Create access token
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "session_uid": session_uid},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user["user_id"],
        session_uid=session_uid
    )


@auth_router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (invalidate session)"""
    # In a more complex system, you might want to blacklist the JWT token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}


@auth_router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    # Extract session_uid from the latest session (could be improved)
    latest_session = max(current_user["sessions"].keys()) if current_user["sessions"] else None
    
    return UserResponse(
        user_id=current_user["user_id"],
        username=current_user["username"],
        session_uid=latest_session or ""
    )