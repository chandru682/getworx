from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class ApplicationAnswerCreate(BaseModel):
    question_id: int
    candidate_answer: str


class ApplicationAnswerResponse(BaseModel):
    id: int
    question_id: int
    question_text: str
    question_type: str
    candidate_answer: str

    class Config:
        from_attributes = True


class CandidateProfileSubset(BaseModel):
    """Subset of candidate profile fields exposed in application responses."""
    name: Optional[str] = None
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    current_role: Optional[str] = None
    total_experience: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    highest_qualification: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills_json: Optional[list] = None
    languages_json: Optional[list] = None
    certifications_json: Optional[list] = None
    profile_completion_percentage: Optional[int] = None

    class Config:
        from_attributes = True


class ApplicationCreateRequest(BaseModel):
    job_id: int = Field(..., description="Job posting ID to apply for")
    resume_url: Optional[str] = Field(None, description="Override resume URL for this application")
    cover_letter: Optional[str] = Field(None, description="Candidate cover letter for the application")
    answers: Optional[List[ApplicationAnswerCreate]] = []


class ApplicationStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="New application status")
    note: Optional[str] = Field(None, description="Optional note attached to the status update")


class ApplicationAddNoteRequest(BaseModel):
    note: str = Field(..., description="Note content to append to the application")


class AssignRecruiterRequest(BaseModel):
    recruiter_id: int = Field(..., description="User ID of the recruiter to assign")


class ApplicationStatusHistoryItem(BaseModel):
    status: str
    changed_at: datetime
    changed_by: str
    note: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    application_reference: str
    candidate_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    candidate_profile: Optional[CandidateProfileSubset] = None
    job_id: int
    job_title: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    employer_id: Optional[int] = None
    recruiter_id: Optional[int] = None
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str
    applied_at: datetime
    updated_at: datetime
    notes_json: Optional[List[str]] = Field(default_factory=list)
    status_history_json: Optional[List[ApplicationStatusHistoryItem]] = Field(default_factory=list)
    screening_answers: Optional[List[ApplicationAnswerResponse]] = Field(default_factory=list)

    @field_validator("notes_json", "status_history_json", "screening_answers", mode="before")
    @classmethod
    def default_none_to_list(cls, v):
        if v is None:
            return []
        return v

    class Config:
        from_attributes = True


class PaginatedApplicationResponse(BaseModel):
    items: List[ApplicationResponse]
    total: int
    page: int
    limit: int
