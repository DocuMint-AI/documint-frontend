"""
Standardized API response utilities
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None


def success_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Create a successful response"""
    return {
        "success": True,
        "data": data,
        "message": message
    }


def error_response(error: str, message: str = "Error occurred") -> Dict[str, Any]:
    """Create an error response"""
    return {
        "success": False,
        "error": error,
        "message": message
    }