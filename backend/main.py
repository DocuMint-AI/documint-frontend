"""
FastAPI backend for DocuMint - Document Analysis System
Provides user authentication, document handling, and AI-powered analysis.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from auth.routes import auth_router
from documents.routes import documents_router
from config import config


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

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,  # Use config property
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "documint-backend"}

# Include routers
app.include_router(auth_router, tags=["Authentication"])
app.include_router(documents_router, prefix="/api/v1", tags=["Documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)