import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.auth.models import UserRole, UserStatus


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=128, description="User full name")
    email: EmailStr = Field(..., description="Valid unique email address")
    password: str = Field(..., min_length=8, max_length=128, description="Strong password")
    role: UserRole = Field(default=UserRole.CANDIDATE, description="User role in the system")

    @field_validator("password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    status: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid JWT refresh token")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address for password reset")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Valid password reset token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New strong password")

    @field_validator("new_password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        return RegisterRequest.validate_strong_password(v)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Existing account password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New strong password")

    @field_validator("new_password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        return RegisterRequest.validate_strong_password(v)


class MessageResponse(BaseModel):
    message: str
    success: bool = True
