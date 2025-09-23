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
    error_code: Optional[str] = None


def success_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Create a successful response"""
    return {
        "success": True,
        "data": data,
        "message": message
    }


def error_response(
    error: str, 
    message: str = "Error occurred", 
    error_code: Optional[str] = None,
    data: Optional[Any] = None
) -> Dict[str, Any]:
    """Create an error response with detailed error information"""
    response = {
        "success": False,
        "error": error,
        "message": message
    }
    
    if error_code:
        response["error_code"] = error_code
    
    if data:
        response["data"] = data
    
    return response


def validation_error_response(
    field: str, 
    message: str, 
    error_code: str = "VALIDATION_ERROR"
) -> Dict[str, Any]:
    """Create a validation error response"""
    return error_response(
        error=f"Validation failed for field '{field}'",
        message=message,
        error_code=error_code,
        data={"field": field}
    )


def service_unavailable_response(
    service: str, 
    message: str = "Service temporarily unavailable"
) -> Dict[str, Any]:
    """Create a service unavailable response"""
    return error_response(
        error=f"{service} service unavailable",
        message=message,
        error_code="SERVICE_UNAVAILABLE",
        data={"service": service}
    )