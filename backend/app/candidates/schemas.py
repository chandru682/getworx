from typing import List, Optional
from pydantic import BaseModel, Field


class CandidateMatchTag(BaseModel):
    label: str
    type: str = "skill"  # skill, exp, location, role


class ParsedJDInfo(BaseModel):
    extracted_title: str
    extracted_skills: List[str] = []
    extracted_min_experience: int = 0
    extracted_location: Optional[str] = None


class TalentSearchFilterRequest(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    min_experience: Optional[int] = None
    max_experience: Optional[int] = None
    location: Optional[str] = None
    education: Optional[str] = None
    max_salary: Optional[float] = None
    notice_period: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class JobDescriptionMatchRequest(BaseModel):
    jd_text: str
    job_id: Optional[int] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class CandidateTalentCardResponse(BaseModel):
    id: int
    user_id: int
    name: str
    masked_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    masked_email: str
    masked_phone: str
    photo_url: Optional[str] = None
    current_role: Optional[str] = None
    total_experience: Optional[str] = None
    experience_years: float = 0
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    location_display: str
    expected_salary: Optional[str] = None
    highest_qualification: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[str] = None
    notice_period: Optional[str] = "30 Days"
    skills: List[str] = []
    has_resume: bool = False
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    ai_match_score: float = 0.0
    match_tags: List[CandidateMatchTag] = []
    is_saved: bool = False
    is_unlocked: bool = False
    profile_completion_percentage: int = 80
    boolean_match_keywords: List[str] = []


class TalentSearchPaginatedResponse(BaseModel):
    items: List[CandidateTalentCardResponse]
    total: int
    page: int
    pages: int
    limit: int
    remaining_unlocks: int = 1000
    total_unlock_limit: int = 1000
    parsed_jd: Optional[ParsedJDInfo] = None


class SaveCandidateRequest(BaseModel):
    candidate_id: int
    notes: Optional[str] = None


class UnlockCandidateRequest(BaseModel):
    candidate_id: int
