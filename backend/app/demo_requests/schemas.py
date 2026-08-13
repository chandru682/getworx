from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.demo_requests.models import DemoRequestStatus, DemoScheduleStatus, QuotationStatus


class DemoRequestCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=128)
    contact_person: str = Field(..., min_length=2, max_length=128)
    official_email: EmailStr
    mobile_number: str = Field(..., min_length=5, max_length=32)
    company_size: str = Field(default="1-10 employees")
    industry: str = Field(default="Technology & Software")
    number_of_recruiters: str = Field(default="1-5 recruiters")
    expected_hiring_volume: str = Field(default="1-10 hires/month")
    hiring_requirements: Optional[str] = None
    preferred_demo_date: Optional[str] = None
    preferred_demo_time: Optional[str] = None
    additional_message: Optional[str] = None


class DemoScheduleCreate(BaseModel):
    meeting_link: str
    scheduled_at: datetime
    sales_rep_name: str
    instructions: Optional[str] = "Please join the meeting link at your scheduled date and time. Our product engineer will demonstrate GetWorxs recruitment capabilities."


class DemoNoteCreate(BaseModel):
    content: str
    author_name: Optional[str] = "Super Admin"


class QuotationCreate(BaseModel):
    plan_code: str = Field(..., example="professional")
    plan_name: str = Field(..., example="Professional Enterprise Plan")
    price_amount: float = Field(..., example=499.00)
    currency: str = Field(default="USD")
    job_limit: int = Field(default=25)
    recruiter_limit: int = Field(default=10)
    ai_credits: int = Field(default=2500)
    features_json: Optional[str] = "[\"Unlimited AI Video Screening\", \"ATS Resume Scorer\", \"Recruiter Team Portals\", \"Dedicated Support\"]"
    valid_days: int = Field(default=30)


class DemoStatusUpdate(BaseModel):
    status: DemoRequestStatus
    notes: Optional[str] = None
    assigned_sales_rep: Optional[str] = None


class DemoScheduleOut(BaseModel):
    id: int
    meeting_link: str
    scheduled_at: datetime
    sales_rep_name: str
    instructions: Optional[str]
    status: DemoScheduleStatus
    created_at: datetime

    class Config:
        from_attributes = True


class DemoNoteOut(BaseModel):
    id: int
    author_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuotationOut(BaseModel):
    id: int
    quotation_number: str
    plan_code: str
    plan_name: str
    price_amount: float
    currency: str
    job_limit: int
    recruiter_limit: int
    ai_credits: int
    features_json: str
    status: QuotationStatus
    valid_until: datetime
    payment_link: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DemoRequestOut(BaseModel):
    id: int
    company_name: str
    contact_person: str
    official_email: str
    mobile_number: str
    company_size: str
    industry: str
    number_of_recruiters: str
    expected_hiring_volume: str
    hiring_requirements: Optional[str]
    preferred_demo_date: Optional[str]
    preferred_demo_time: Optional[str]
    additional_message: Optional[str]
    status: DemoRequestStatus
    assigned_sales_rep: Optional[str]
    company_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    schedules: List[DemoScheduleOut] = []
    notes: List[DemoNoteOut] = []
    quotations: List[QuotationOut] = []

    class Config:
        from_attributes = True


class DemoStatsOut(BaseModel):
    total_requests: int = 0
    new_requests: int = 0
    contacted: int = 0
    demo_scheduled: int = 0
    demo_completed: int = 0
    interested: int = 0
    negotiation: int = 0
    purchased: int = 0
    not_interested: int = 0
