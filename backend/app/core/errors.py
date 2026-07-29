from typing import Any, Dict, Optional
from fastapi import status


class AppException(Exception):
    """Base application exception class with standard status codes."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="BAD_REQUEST",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access forbidden", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class ValidationException(AppException):
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="UNPROCESSABLE_ENTITY",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )
