from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.companies.models import CompanyStatus
from app.companies.validation import (
    validate_company_size,
    validate_phone_number,
    validate_tax_gst,
)


# --- Company Branch Schemas ---

class CompanyBranchBase(BaseModel):
    branch_name: str = Field(..., min_length=2, max_length=255)
    country: str = Field(..., min_length=2, max_length=128)
    state: str = Field(..., min_length=2, max_length=128)
    city: str = Field(..., min_length=2, max_length=128)
    address: str = Field(..., min_length=5)
    contact_number: str = Field(..., min_length=7, max_length=64)

    @field_validator("contact_number")
    def check_phone(cls, v: str) -> str:
        return validate_phone_number(v)


class CompanyBranchCreate(CompanyBranchBase):
    pass


class CompanyBranchUpdate(BaseModel):
    branch_name: Optional[str] = Field(None, min_length=2, max_length=255)
    country: Optional[str] = Field(None, min_length=2, max_length=128)
    state: Optional[str] = Field(None, min_length=2, max_length=128)
    city: Optional[str] = Field(None, min_length=2, max_length=128)
    address: Optional[str] = Field(None, min_length=5)
    contact_number: Optional[str] = Field(None, min_length=7, max_length=64)

    @field_validator("contact_number")
    def check_phone(cls, v: Optional[str]) -> Optional[str]:
        return validate_phone_number(v) if v else None


class CompanyBranchResponse(CompanyBranchBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Company Settings Schemas ---

class CompanySettingsBase(BaseModel):
    time_zone: str = Field("UTC", max_length=64)
    currency: str = Field("USD", max_length=16)
    language: str = Field("en", max_length=16)
    date_format: str = Field("YYYY-MM-DD", max_length=32)


class CompanySettingsCreate(CompanySettingsBase):
    pass


class CompanySettingsUpdate(BaseModel):
    time_zone: Optional[str] = Field(None, max_length=64)
    currency: Optional[str] = Field(None, max_length=16)
    language: Optional[str] = Field(None, max_length=16)
    date_format: Optional[str] = Field(None, max_length=32)


class CompanySettingsResponse(CompanySettingsBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Company Document Schemas ---

class CompanyDocumentCreate(BaseModel):
    document_type: str = Field(..., max_length=64)
    document_name: str = Field(..., min_length=2, max_length=255)
    document_url: str = Field(..., min_length=5, max_length=512)
    is_required: bool = False


class CompanyDocumentResponse(CompanyDocumentCreate):
    id: int
    company_id: int
    status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Main Company Schemas ---

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    legal_name: str = Field(..., min_length=2, max_length=255)
    industry: str = Field(..., min_length=2, max_length=128)
    company_size: str = Field(..., max_length=64)
    website: Optional[str] = Field(None, max_length=255)
    email: EmailStr = Field(...)
    phone: str = Field(..., min_length=6, max_length=64)
    country: str = Field(..., min_length=2, max_length=128)
    state: str = Field(..., min_length=2, max_length=128)
    city: str = Field(..., min_length=2, max_length=128)
    address: str = Field(..., min_length=2)
    postal_code: str = Field(..., min_length=2, max_length=32)
    tax_gst_number: Optional[str] = Field(None, max_length=64)
    business_reg_number: Optional[str] = Field(None, max_length=64)
    year_established: Optional[int] = Field(None, ge=1800, le=2100)
    
    # Primary Contact
    primary_contact_name: Optional[str] = Field(None, max_length=255)
    primary_contact_designation: Optional[str] = Field(None, max_length=128)
    primary_contact_email: Optional[EmailStr] = Field(None)
    primary_contact_phone: Optional[str] = Field(None, max_length=64)

    logo_url: Optional[str] = Field(None, max_length=512)
    description: Optional[str] = Field(None)

    @field_validator("company_size")
    def check_size(cls, v: str) -> str:
        return validate_company_size(v)

    @field_validator("phone")
    def check_phone(cls, v: str) -> str:
        return validate_phone_number(v)

    @field_validator("tax_gst_number")
    def check_tax(cls, v: Optional[str]) -> Optional[str]:
        return validate_tax_gst(v)


class CompanyCreate(CompanyBase):
    branches: Optional[List[CompanyBranchCreate]] = Field(default_factory=list)
    documents: Optional[List[CompanyDocumentCreate]] = Field(default_factory=list)
    settings: Optional[CompanySettingsCreate] = Field(default_factory=CompanySettingsCreate)


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    legal_name: Optional[str] = Field(None, min_length=2, max_length=255)
    industry: Optional[str] = Field(None, min_length=2, max_length=128)
    company_size: Optional[str] = Field(None, max_length=64)
    website: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, min_length=7, max_length=64)
    country: Optional[str] = Field(None, min_length=2, max_length=128)
    state: Optional[str] = Field(None, min_length=2, max_length=128)
    city: Optional[str] = Field(None, min_length=2, max_length=128)
    address: Optional[str] = Field(None, min_length=5)
    postal_code: Optional[str] = Field(None, min_length=2, max_length=32)
    tax_gst_number: Optional[str] = Field(None, max_length=64)
    business_reg_number: Optional[str] = Field(None, max_length=64)
    year_established: Optional[int] = Field(None, ge=1800, le=2100)
    
    primary_contact_name: Optional[str] = Field(None, max_length=255)
    primary_contact_designation: Optional[str] = Field(None, max_length=128)
    primary_contact_email: Optional[EmailStr] = Field(None)
    primary_contact_phone: Optional[str] = Field(None, max_length=64)

    logo_url: Optional[str] = Field(None, max_length=512)
    description: Optional[str] = Field(None)

    @field_validator("company_size")
    def check_size(cls, v: Optional[str]) -> Optional[str]:
        return validate_company_size(v) if v else None

    @field_validator("phone")
    def check_phone(cls, v: Optional[str]) -> Optional[str]:
        return validate_phone_number(v) if v else None

    @field_validator("tax_gst_number")
    def check_tax(cls, v: Optional[str]) -> Optional[str]:
        return validate_tax_gst(v) if v else None


class CompanyStatusUpdate(BaseModel):
    status: CompanyStatus


class CompanyVerificationUpdate(BaseModel):
    is_verified: bool


class CompanyLogoUpdate(BaseModel):
    logo_url: str = Field(..., min_length=5, max_length=512)


class CompanyRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=3, description="Reason for rejection")


class CompanyRequestChangesRequest(BaseModel):
    comments: str = Field(..., min_length=3, description="Feedback comments for changes requested")


class CompanyApproveRequest(BaseModel):
    notes: Optional[str] = Field(None, description="Optional approval notes")


class CompanyResponse(CompanyBase):
    id: int
    company_code: str
    status: CompanyStatus
    approval_status: CompanyStatus
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    approved_by_id: Optional[int] = None
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    is_verified: bool
    verified_by_id: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_by_id: Optional[int] = None
    branches: List[CompanyBranchResponse] = Field(default_factory=list)
    documents: List[CompanyDocumentResponse] = Field(default_factory=list)
    settings: Optional[CompanySettingsResponse] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompanyApproveResponse(CompanyResponse):
    email_sent: bool = True
    warning: Optional[str] = None
    employer_email: Optional[str] = None
    employer_user_id: Optional[int] = None


class CompanyStatisticsResponse(BaseModel):
    company_id: int
    total_recruiters: int = 0
    total_employers: int = 0
    total_jobs: int = 0
    total_candidates: int = 0
    active_jobs: int = 0




class PaginatedCompanyResponse(BaseModel):
    items: List[CompanyResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class RecruiterInviteRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Full name of recruiter")
    email: EmailStr = Field(..., description="Recruiter email address")
    role: str = Field("Recruiter", description="Recruiter role (Admin, Recruiter, Interviewer)")
    company_name: Optional[str] = Field(None, description="Company name associated with recruiter")


class RecruiterInviteResponse(BaseModel):
    name: str
    email: str
    role: str
    company_name: str
    temporary_password: str
    status: str
    email_sent: bool
    message: str
    warning: Optional[str] = None


class RecruiterResendInviteRequest(BaseModel):
    email: EmailStr = Field(..., description="Recruiter email address to resend invitation to")


class RecruiterListResponse(BaseModel):
    id: int
    recruiter_name: str
    recruiter_email: str
    company_name: str
    role: str
    status: str
    invited_by_email: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResendWelcomeEmailResponse(BaseModel):
    company_id: int
    company_name: str
    employer_email: str
    email_sent: bool
    message: str
    warning: Optional[str] = None



