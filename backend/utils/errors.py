"""
Custom error classes and exception handlers
"""

from fastapi import HTTPException, status


class AuthenticationError(Exception):
    """Authentication related errors"""
    pass


class DocumentError(Exception):
    """Document processing related errors"""
    pass


class AIServiceError(Exception):
    """AI service related errors"""
    pass


class FileValidationError(Exception):
    """File validation related errors"""
    pass


def create_http_exception(status_code: int, detail: str, headers=None):
    """Helper to create HTTP exceptions"""
    return HTTPException(
        status_code=status_code,
        detail=detail,
        headers=headers or {}
    )