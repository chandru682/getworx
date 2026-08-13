from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

class JobScreeningQuestionBase(BaseModel):
    question_text: str = Field(..., description="The screening question text prompt")
    question_type: str = Field("paragraph", description="Question format: yes_no, multiple_choice, paragraph, file_upload")
    options_json: Optional[str] = Field(None, description="JSON stringified list of options for multiple choice questions")
    is_mandatory: bool = True
    is_knockout: bool = False
    preferred_answer: Optional[str] = None
    display_order: int = 0

class JobScreeningQuestionCreate(JobScreeningQuestionBase):
    pass

class JobScreeningQuestionResponse(JobScreeningQuestionBase):
    id: int
    job_id: int

    model_config = {
        "from_attributes": True
    }


class JobBase(BaseModel):
    # Step 1: Job Details
    title: str
    department: str
    role: str
    employment_type: str
    experience_min: int = 0
    experience_max: int = 0
    work_mode: str = "Onsite"
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    show_salary: bool = True
    openings: int = 1
    priority: str = "Medium"
    deadline: Optional[datetime] = None

    # Step 2: Preferred Candidate
    education: Optional[str] = None
    skills_json: Optional[str] = None  # JSON string array
    certifications_json: Optional[str] = None  # JSON string array
    languages_json: Optional[str] = None  # JSON string array
    industry_exp: Optional[str] = None
    notice_period: Optional[str] = None
    current_location: Optional[str] = None
    relocation_pref: Optional[str] = None

    # Step 3: Job Description
    about_company: Optional[str] = None
    summary: Optional[str] = None
    responsibilities: Optional[str] = None
    required_skills: Optional[str] = None
    preferred_skills: Optional[str] = None
    benefits_json: Optional[str] = None  # JSON string array
    working_hours: Optional[str] = None

    # Step 5: Advanced Options
    hiring_manager_name: Optional[str] = None
    hiring_manager_email: Optional[EmailStr] = None
    assigned_recruiter_id: Optional[int] = None
    visibility: str = "Public"
    internal_job_id: Optional[str] = None
    auto_close_date: Optional[datetime] = None
    prevent_duplicates: bool = True
    email_notifications: str = "Instant"

class JobCreate(JobBase):
    screening_questions: Optional[List[JobScreeningQuestionCreate]] = []

class JobDraftCreate(BaseModel):
    # Draft allows all fields to be optional
    title: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    employment_type: Optional[str] = None
    experience_min: Optional[int] = 0
    experience_max: Optional[int] = 0
    work_mode: Optional[str] = "Onsite"
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = "USD"
    show_salary: Optional[bool] = True
    openings: Optional[int] = 1
    priority: Optional[str] = "Medium"
    deadline: Optional[datetime] = None

    education: Optional[str] = None
    skills_json: Optional[str] = None
    certifications_json: Optional[str] = None
    languages_json: Optional[str] = None
    industry_exp: Optional[str] = None
    notice_period: Optional[str] = None
    current_location: Optional[str] = None
    relocation_pref: Optional[str] = None

    about_company: Optional[str] = None
    summary: Optional[str] = None
    responsibilities: Optional[str] = None
    required_skills: Optional[str] = None
    preferred_skills: Optional[str] = None
    benefits_json: Optional[str] = None
    working_hours: Optional[str] = None

    hiring_manager_name: Optional[str] = None
    hiring_manager_email: Optional[str] = None
    assigned_recruiter_id: Optional[int] = None
    visibility: Optional[str] = "Public"
    internal_job_id: Optional[str] = None
    auto_close_date: Optional[datetime] = None
    prevent_duplicates: Optional[bool] = True
    email_notifications: Optional[str] = "Instant"
    screening_questions: Optional[List[JobScreeningQuestionCreate]] = []

class JobUpdate(JobDraftCreate):
    status: Optional[str] = None

class CompanyNestedResponse(BaseModel):
    id: int
    name: str
    company_code: Optional[str] = None
    industry: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class JobResponse(JobBase):
    id: int
    status: str
    created_by_id: int
    employer_id: Optional[int] = None
    company_id: Optional[int] = None
    company: Optional[CompanyNestedResponse] = None
    applications_count: int = 0
    created_at: datetime
    updated_at: datetime
    screening_questions: List[JobScreeningQuestionResponse] = []

    model_config = {
        "from_attributes": True
    }

class PaginatedJobResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    limit: int
