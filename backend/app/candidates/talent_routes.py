from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user_optional, get_current_user
from app.auth.models import User
from app.database.session import get_db
from app.candidates.talent_service import TalentSearchService
from app.candidates.schemas import (
    CandidateTalentCardResponse,
    JobDescriptionMatchRequest,
    SaveCandidateRequest,
    TalentSearchFilterRequest,
    TalentSearchPaginatedResponse,
    UnlockCandidateRequest,
)
from app.schemas.health import ResponseEnvelope

talent_router = APIRouter(prefix="/talent", tags=["Talent Search & Discovery"])


def get_talent_service(db: AsyncSession = Depends(get_db)) -> TalentSearchService:
    return TalentSearchService(db)


@talent_router.post(
    "/search",
    response_model=ResponseEnvelope[TalentSearchPaginatedResponse],
    status_code=status.HTTP_200_OK,
    summary="Search Global Verified Candidate Pool",
    description="Filter candidates by role, skills, experience, location, education, max salary, and notice period.",
)
async def search_talent(
    request: TalentSearchFilterRequest,
    current_user: User = Depends(get_current_user),
    service: TalentSearchService = Depends(get_talent_service),
):
    company_id = getattr(current_user, "company_id", None)
    res = await service.search_talent(request, company_id=company_id, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message=f"Found {res.total} matching candidates in verified pool",
        data=res,
    )


@talent_router.post(
    "/match-jd",
    response_model=ResponseEnvelope[TalentSearchPaginatedResponse],
    status_code=status.HTTP_200_OK,
    summary="Match Candidates using AI Job Description Parser",
    description="Extract requirements from pasted Job Description and rank candidates by AI Match Score.",
)
async def match_candidates_by_jd(
    request: JobDescriptionMatchRequest,
    current_user: User = Depends(get_current_user),
    service: TalentSearchService = Depends(get_talent_service),
):
    company_id = getattr(current_user, "company_id", None)
    res = await service.match_candidates_by_jd(request, company_id=company_id, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Candidates scored and ranked by AI JD Matcher",
        data=res,
    )


@talent_router.get(
    "/saved",
    response_model=ResponseEnvelope[List[CandidateTalentCardResponse]],
    status_code=status.HTTP_200_OK,
    summary="List Saved / Bookmarked Candidates",
)
async def list_saved_candidates(
    current_user: User = Depends(get_current_user),
    service: TalentSearchService = Depends(get_talent_service),
):
    company_id = getattr(current_user, "company_id", None)
    items = await service.list_saved_candidates(company_id=company_id, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Saved candidates retrieved successfully",
        data=items,
    )


@talent_router.post(
    "/save",
    response_model=ResponseEnvelope[bool],
    status_code=status.HTTP_200_OK,
    summary="Save / Bookmark Candidate",
)
async def save_candidate(
    request: SaveCandidateRequest,
    current_user: User = Depends(get_current_user),
    service: TalentSearchService = Depends(get_talent_service),
):
    company_id = getattr(current_user, "company_id", None)
    success = await service.save_candidate(request.candidate_id, company_id=company_id, user_id=current_user.id, notes=request.notes)
    return ResponseEnvelope(
        success=True,
        message="Candidate bookmarked successfully",
        data=success,
    )


@talent_router.delete(
    "/save/{candidate_id}",
    response_model=ResponseEnvelope[bool],
    status_code=status.HTTP_200_OK,
    summary="Remove Saved Candidate Bookmark",
)
async def unsave_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    service: TalentSearchService = Depends(get_talent_service),
):
    company_id = getattr(current_user, "company_id", None)
    success = await service.unsave_candidate(candidate_id, company_id=company_id, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Candidate removed from saved list",
        data=success,
    )


@talent_router.post(
    "/unlock",
    response_model=ResponseEnvelope[CandidateTalentCardResponse],
    status_code=status.HTTP_200_OK,
    summary="Unlock Candidate Contact Info & Resume",
    description="Deducts 1 profile unlock from company subscription allowance and returns unmasked contact info.",
)
async def unlock_candidate_profile(
    request: UnlockCandidateRequest,
    current_user: User = Depends(get_current_user),
    service: TalentSearchService = Depends(get_talent_service),
):
    company_id = getattr(current_user, "company_id", None)
    card = await service.unlock_candidate_profile(request.candidate_id, company_id=company_id, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Candidate profile unlocked successfully",
        data=card,
    )
