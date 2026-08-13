from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr


class InterviewCreateRequest(BaseModel):
    application_id: int = Field(..., description="Application ID to schedule interview for")
    interview_type: str = Field("Technical Round 1", description="e.g. Screening, Technical Round 1, Managerial, HR Round")
    interview_mode: str = Field("online", description="online, offline, phone")
    scheduled_at: datetime = Field(..., description="Scheduled ISO date and time")
    duration_minutes: int = Field(45, description="Interview duration in minutes")
    interviewer_name: str = Field(..., description="Name of the interviewer")
    interviewer_email: Optional[EmailStr] = Field(None, description="Email of the interviewer")
    meeting_link: Optional[str] = Field(None, description="URL for online interview")
    venue: Optional[str] = Field(None, description="Physical location address for offline interview")
    notes: Optional[str] = Field(None, description="Instructions or notes for candidate")


class InterviewRespondRequest(BaseModel):
    action: str = Field(..., description="accept, reschedule, decline")
    reason: Optional[str] = Field(None, description="Reason if requesting reschedule or declining")
    proposed_date: Optional[datetime] = Field(None, description="Proposed date if requesting reschedule")


class InterviewFeedbackRequest(BaseModel):
    technical_rating: int = Field(..., ge=1, le=5, description="1 to 5 score")
    communication_rating: int = Field(..., ge=1, le=5, description="1 to 5 score")
    behavioral_rating: int = Field(..., ge=1, le=5, description="1 to 5 score")
    overall_rating: int = Field(..., ge=1, le=5, description="1 to 5 score")
    recommendation: str = Field(..., description="strong_hire, hire, no_hire, strong_no_hire")
    comments: Optional[str] = Field(None, description="Detailed interviewer notes")


class InterviewDecisionRequest(BaseModel):
    decision: str = Field(..., description="selected, rejected, hold, next_round")
    decision_notes: Optional[str] = Field(None, description="Additional notes regarding the decision")
    next_round_type: Optional[str] = Field(None, description="Type of next round if decision is next_round")


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    job_id: int
    company_id: Optional[int] = None
    candidate_id: int
    employer_id: Optional[int] = None
    recruiter_id: Optional[int] = None

    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None

    interview_type: str
    interview_mode: str
    scheduled_at: datetime
    duration_minutes: int

    interviewer_name: str
    interviewer_email: Optional[str] = None
    meeting_link: Optional[str] = None
    venue: Optional[str] = None
    notes: Optional[str] = None

    status: str
    reschedule_reason: Optional[str] = None
    decline_reason: Optional[str] = None

    feedback_json: Optional[Dict[str, Any]] = None
    decision: Optional[str] = None
    decision_notes: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedInterviewResponse(BaseModel):
    items: List[InterviewResponse]
    total: int
    page: int
    limit: int
