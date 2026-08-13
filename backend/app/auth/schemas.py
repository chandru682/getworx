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

    photo_url: Optional[str] = Field(None, description="Profile avatar image URL")
    phone: Optional[str] = Field(None, description="Candidate mobile phone number")
    dob: Optional[str] = Field(None, description="Candidate date of birth")
    gender: Optional[str] = Field(None, description="Candidate gender")
    country: Optional[str] = Field(None, description="Candidate country")
    state: Optional[str] = Field(None, description="Candidate state")
    city: Optional[str] = Field(None, description="Candidate city")
    current_role: Optional[str] = Field(None, description="Current candidate role")
    total_experience: Optional[str] = Field(None, description="Total experience duration")
    preferred_job_role: Optional[str] = Field(None, description="Preferred future job role")
    preferred_location: Optional[str] = Field(None, description="Preferred work location")
    expected_salary: Optional[str] = Field(None, description="Expected salary")
    highest_qualification: Optional[str] = Field(None, description="Highest qualification")
    university: Optional[str] = Field(None, description="University or institution")
    graduation_year: Optional[str] = Field(None, description="Graduation year")
    resume_url: Optional[str] = Field(None, description="Resume download or storage URL")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    portfolio_url: Optional[str] = Field(None, description="Portfolio website URL")
    skills: Optional[list[str]] = Field(None, description="List of candidate skills")
    languages: Optional[list[str]] = Field(None, description="List of candidate languages")
    certifications: Optional[list[str]] = Field(None, description="Candidate certifications")

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v: str) -> UserRole:
        if isinstance(v, str):
            clean_role = v.strip().upper()
            try:
                return UserRole(clean_role)
            except ValueError:
                return UserRole.CANDIDATE
        return v

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


class AuthMeResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    status: str
    avatar: str
    company_name: Optional[str] = None
    profile_completion: int = 100
    subscription_status: Optional[str] = None
    notification_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    status: str
    is_verified: bool
    must_change_password: bool | None = None
    last_password_changed_at: datetime | None = None
    invited_by_id: int | None = None
    invited_at: datetime | None = None
    temporary_password_expiry: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    user: UserResponse


class CandidateProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    current_role: Optional[str] = None
    total_experience: Optional[str] = None
    skills: Optional[list[str]] = None
    preferred_job_role: Optional[str] = None
    preferred_location: Optional[str] = None
    expected_salary: Optional[str] = None
    highest_qualification: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    languages: Optional[list[str]] = None
    certifications: Optional[list[str]] = None

    model_config = ConfigDict(from_attributes=True)


class CandidateProfileResponse(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    current_role: Optional[str] = None
    total_experience: Optional[str] = None
    preferred_job_role: Optional[str] = None
    preferred_location: Optional[str] = None
    expected_salary: Optional[str] = None
    highest_qualification: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: list[str] = []
    languages: list[str] = []
    certifications: list[str] = []
    profile_completion_percentage: int = 0
    profile_last_updated: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class CandidateProfileCompletionResponse(BaseModel):
    percentage: int
    completed_sections: list[str]
    missing_sections: list[str]
    profile_last_updated: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


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


class FirstLoginChangePasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User registered email address")
    temporary_password: str = Field(..., min_length=1, description="Current temporary password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New permanent password")

    @field_validator("new_password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        return RegisterRequest.validate_strong_password(v)


class MessageResponse(BaseModel):
    message: str
    success: bool = True

