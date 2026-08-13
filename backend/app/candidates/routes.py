from typing import Optional

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_auth_service, require_candidate
from app.auth.models import User
from app.auth.schemas import (
    CandidateProfileCompletionResponse,
    CandidateProfileResponse,
    CandidateProfileUpdateRequest,
)
from app.auth.service import AuthService
from app.schemas.health import ResponseEnvelope

router = APIRouter(prefix="/candidates", tags=["Candidates Module"])


@router.get(
    "/profile",
    response_model=ResponseEnvelope[CandidateProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Profile",
    description="Fetches the authenticated candidate's stored profile and completion details.",
)
async def get_candidate_profile(
    current_user: User = Depends(require_candidate),
    service: AuthService = Depends(get_auth_service),
):
    profile = await service.get_candidate_profile(current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Candidate profile retrieved successfully",
        data=profile,
    )


@router.get(
    "/profile-completion",
    response_model=ResponseEnvelope[CandidateProfileCompletionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Profile Completion",
    description="Retrieves candidate profile completion score with completed and missing sections.",
)
async def get_profile_completion(
    current_user: User = Depends(require_candidate),
    service: AuthService = Depends(get_auth_service),
):
    completion = await service.get_candidate_profile_completion(current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Candidate profile completion retrieved successfully",
        data=completion,
    )


@router.patch(
    "/profile",
    response_model=ResponseEnvelope[CandidateProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Update Candidate Profile",
    description="Updates profile fields for the authenticated candidate and recalculates completion.",
)
async def update_candidate_profile(
    data: CandidateProfileUpdateRequest,
    current_user: User = Depends(require_candidate),
    service: AuthService = Depends(get_auth_service),
):
    profile = await service.update_candidate_profile(current_user.id, data)
    return ResponseEnvelope(
        success=True,
        message="Candidate profile updated successfully",
        data=profile,
    )
