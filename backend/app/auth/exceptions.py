from app.core.errors import (
    AppException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)


class UserAlreadyExistsException(ConflictException):
    def __init__(self, email: str):
        super().__init__(
            message=f"User with email '{email}' already exists",
            details={"email": email},
        )


class InvalidCredentialsException(UnauthorizedException):
    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(
            message=message,
            details={},
        )


class InvalidTokenException(UnauthorizedException):
    def __init__(self, message: str = "Invalid authentication token"):
        super().__init__(
            message=message,
            details={},
        )


class TokenExpiredException(UnauthorizedException):
    def __init__(self, message: str = "Authentication token has expired"):
        super().__init__(
            message=message,
            details={},
        )


class UserNotFoundException(NotFoundException):
    def __init__(self, user_id: str | int | None = None):
        msg = f"User with ID '{user_id}' not found" if user_id else "User not found"
        super().__init__(message=msg, details={"user_id": user_id})


class UserInactiveException(ForbiddenException):
    def __init__(self, message: str = "User account is inactive or suspended"):
        super().__init__(message=message)


class InvalidResetTokenException(BadRequestException):
    def __init__(self, message: str = "Invalid or expired password reset token"):
        super().__init__(message=message)


class MustChangePasswordException(ForbiddenException):
    def __init__(self, message: str = "Password change required before continuing. Please change your temporary password."):
        super().__init__(message=message)


class TemporaryPasswordExpiredException(BadRequestException):
    def __init__(self, message: str = "Temporary password has expired. Please request a new invitation."):
        super().__init__(message=message)
