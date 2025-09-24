"""
FastAPI backend for DocuMint - Document Analysis System
Provides user authentication, document handling, and AI-powered analysis.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Rate limiting imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Load environment variables from .env file
load_dotenv()

from auth.routes import auth_router
from documents.routes import documents_router
from config import config


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize app data directories on startup"""
    os.makedirs("data/system", exist_ok=True)
    
    # Initialize users.json if it doesn't exist
    users_file = "data/system/users.json"
    if not os.path.exists(users_file):
        import json
        with open(users_file, 'w') as f:
            json.dump({}, f)
    
    yield


app = FastAPI(
    title="DocuMint Backend API",
    description="Backend API for document analysis and AI-powered insights",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,  # Use config property
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint (no rate limiting for health checks)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "documint-backend"}

# Include routers with rate limiting
app.include_router(auth_router, tags=["Authentication"])
app.include_router(documents_router, prefix="/api/v1", tags=["Documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)