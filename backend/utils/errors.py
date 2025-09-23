"""
Custom error classes and exception handlers
"""

from fastapi import HTTPException, status
from typing import Optional, Dict, Any


class AuthenticationError(Exception):
    """Authentication related errors"""
    def __init__(self, message: str, code: str = "AUTH_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class DocumentError(Exception):
    """Document processing related errors"""
    def __init__(self, message: str, code: str = "DOCUMENT_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class AIServiceError(Exception):
    """AI service related errors"""
    def __init__(self, message: str, code: str = "AI_SERVICE_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class FileValidationError(Exception):
    """File validation related errors"""
    def __init__(self, message: str, code: str = "FILE_VALIDATION_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ConfigurationError(Exception):
    """Configuration related errors"""
    def __init__(self, message: str, code: str = "CONFIG_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


def create_http_exception(
    status_code: int, 
    detail: str, 
    error_code: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None
) -> HTTPException:
    """Helper to create HTTP exceptions with structured error format"""
    error_detail = {
        "message": detail,
        "error_code": error_code or "INTERNAL_ERROR",
        "status_code": status_code
    }
    
    return HTTPException(
        status_code=status_code,
        detail=error_detail,
        headers=headers or {}
    )


def handle_document_error(error: DocumentError) -> HTTPException:
    """Convert DocumentError to appropriate HTTPException"""
    if "not found" in error.message.lower():
        return create_http_exception(
            status.HTTP_404_NOT_FOUND,
            error.message,
            error.code
        )
    elif "size" in error.message.lower() or "large" in error.message.lower():
        return create_http_exception(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            error.message,
            error.code
        )
    elif "format" in error.message.lower() or "extension" in error.message.lower():
        return create_http_exception(
            status.HTTP_400_BAD_REQUEST,
            error.message,
            error.code
        )
    else:
        return create_http_exception(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            f"Document processing failed: {error.message}",
            error.code
        )


def handle_ai_service_error(error: AIServiceError) -> HTTPException:
    """Convert AIServiceError to appropriate HTTPException"""
    if "not configured" in error.message.lower() or "api key" in error.message.lower():
        return create_http_exception(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AI service is currently unavailable. Please try again later.",
            error.code
        )
    elif "quota" in error.message.lower() or "limit" in error.message.lower():
        return create_http_exception(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "AI service rate limit exceeded. Please try again later.",
            error.code
        )
    else:
        return create_http_exception(
            status.HTTP_502_BAD_GATEWAY,
            f"AI service error: {error.message}",
            error.code
        )


def handle_auth_error(error: AuthenticationError) -> HTTPException:
    """Convert AuthenticationError to appropriate HTTPException"""
    if "token" in error.message.lower() or "expired" in error.message.lower():
        return create_http_exception(
            status.HTTP_401_UNAUTHORIZED,
            error.message,
            error.code
        )
    elif "permission" in error.message.lower() or "forbidden" in error.message.lower():
        return create_http_exception(
            status.HTTP_403_FORBIDDEN,
            error.message,
            error.code
        )
    else:
        return create_http_exception(
            status.HTTP_401_UNAUTHORIZED,
            error.message,
            error.code
        )


def handle_file_validation_error(error: FileValidationError) -> HTTPException:
    """Convert FileValidationError to appropriate HTTPException"""
    return create_http_exception(
        status.HTTP_400_BAD_REQUEST,
        error.message,
        error.code
    )