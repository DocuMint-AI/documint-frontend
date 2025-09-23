"""
FastAPI backend for DocuMint - Document Analysis System
Provides user authentication, document handling, and AI-powered analysis.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import logging
import traceback
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
from utils.errors import (
    DocumentError, AIServiceError, AuthenticationError, FileValidationError,
    handle_document_error, handle_ai_service_error, handle_auth_error, handle_file_validation_error
)
from utils.response import error_response

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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

# Global exception handlers
@app.exception_handler(DocumentError)
async def document_error_handler(request: Request, exc: DocumentError):
    """Handle document processing errors"""
    logger.error(f"Document error: {exc.message}")
    http_exc = handle_document_error(exc)
    return JSONResponse(
        status_code=http_exc.status_code,
        content=error_response(
            error=exc.message,
            error_code=exc.code,
            message="Document processing failed"
        )
    )

@app.exception_handler(AIServiceError)
async def ai_service_error_handler(request: Request, exc: AIServiceError):
    """Handle AI service errors"""
    logger.error(f"AI service error: {exc.message}")
    http_exc = handle_ai_service_error(exc)
    return JSONResponse(
        status_code=http_exc.status_code,
        content=error_response(
            error=exc.message,
            error_code=exc.code,
            message="AI service encountered an error"
        )
    )

@app.exception_handler(AuthenticationError)
async def auth_error_handler(request: Request, exc: AuthenticationError):
    """Handle authentication errors"""
    logger.error(f"Authentication error: {exc.message}")
    http_exc = handle_auth_error(exc)
    return JSONResponse(
        status_code=http_exc.status_code,
        content=error_response(
            error=exc.message,
            error_code=exc.code,
            message="Authentication failed"
        )
    )

@app.exception_handler(FileValidationError)
async def file_validation_error_handler(request: Request, exc: FileValidationError):
    """Handle file validation errors"""
    logger.error(f"File validation error: {exc.message}")
    http_exc = handle_file_validation_error(exc)
    return JSONResponse(
        status_code=http_exc.status_code,
        content=error_response(
            error=exc.message,
            error_code=exc.code,
            message="File validation failed"
        )
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format"""
    logger.error(f"HTTP exception: {exc.detail}")
    
    # If detail is already structured, use it as is
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(
                error=exc.detail.get("message", str(exc.detail)),
                error_code=exc.detail.get("error_code", "HTTP_ERROR"),
                message=f"Request failed with status {exc.status_code}"
            )
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            error=str(exc.detail),
            error_code="HTTP_ERROR",
            message=f"Request failed with status {exc.status_code}"
        )
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content=error_response(
            error="An unexpected error occurred",
            error_code="INTERNAL_SERVER_ERROR",
            message="Internal server error. Please try again later."
        )
    )

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