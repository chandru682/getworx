from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_candidate, require_employer, require_recruiter
from app.auth.models import User
from app.core.database import get_db
from app.interviews.schemas import (
    InterviewCreateRequest,
    InterviewRespondRequest,
    InterviewFeedbackRequest,
    InterviewDecisionRequest,
    InterviewResponse,
    PaginatedInterviewResponse,
)
from app.interviews.service import InterviewService
from app.schemas.health import ResponseEnvelope

router = APIRouter(prefix="/interviews", tags=["Interviews Module"])


def _map_interview(item) -> InterviewResponse:
    cand_name = None
    cand_email = None
    if item.candidate:
        cand_email = item.candidate.email
        if item.candidate.candidate_profile and item.candidate.candidate_profile.name:
            cand_name = item.candidate.candidate_profile.name
        else:
            cand_name = item.candidate.email.split("@")[0]

    return InterviewResponse(
        id=item.id,
        application_id=item.application_id,
        job_id=item.job_id,
        company_id=item.company_id,
        candidate_id=item.candidate_id,
        employer_id=item.employer_id,
        recruiter_id=item.recruiter_id,
        candidate_name=cand_name,
        candidate_email=cand_email,
        job_title=item.job.title if item.job else None,
        company_name=item.company.name if item.company else None,
        interview_type=item.interview_type,
        interview_mode=item.interview_mode.value if hasattr(item.interview_mode, "value") else str(item.interview_mode),
        scheduled_at=item.scheduled_at,
        duration_minutes=item.duration_minutes,
        interviewer_name=item.interviewer_name,
        interviewer_email=item.interviewer_email,
        meeting_link=item.meeting_link,
        venue=item.venue,
        notes=item.notes,
        status=item.status.value if hasattr(item.status, "value") else str(item.status),
        reschedule_reason=item.reschedule_reason,
        decline_reason=item.decline_reason,
        feedback_json=item.feedback_json,
        decision=item.decision.value if item.decision and hasattr(item.decision, "value") else (str(item.decision) if item.decision else None),
        decision_notes=item.decision_notes,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.post(
    "",
    response_model=ResponseEnvelope[InterviewResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a new candidate interview",
)
async def schedule_interview(
    data: InterviewCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    interview = await service.schedule_interview(creator=current_user, data=data)
    return ResponseEnvelope(
        success=True,
        message="Interview scheduled successfully.",
        data=_map_interview(interview),
    )


@router.get(
    "/candidate",
    response_model=ResponseEnvelope[PaginatedInterviewResponse],
    summary="List candidate's scheduled & past interviews",
)
async def list_candidate_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_candidate),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    items, total = await service.repo.list_by_candidate(
        candidate_id=current_user.id, page=page, limit=limit, status=status
    )
    return ResponseEnvelope(
        success=True,
        message="Candidate interviews retrieved successfully.",
        data=PaginatedInterviewResponse(
            items=[_map_interview(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.get(
    "/company",
    response_model=ResponseEnvelope[PaginatedInterviewResponse],
    summary="List company interviews for employers",
)
async def list_company_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_employer),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    company_id = current_user.company_id
    if company_id is None:
        from sqlalchemy import select
        from app.companies.models import Company
        res = await session.execute(select(Company.id).where(Company.created_by_id == current_user.id))
        comp_id = res.scalar_one_or_none()
        if comp_id:
            company_id = comp_id

    items, total = await service.repo.list_by_employer(
        company_id=company_id, employer_id=current_user.id, page=page, limit=limit, status=status
    )
    return ResponseEnvelope(
        success=True,
        message="Company interviews retrieved successfully.",
        data=PaginatedInterviewResponse(
            items=[_map_interview(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.get(
    "/recruiter",
    response_model=ResponseEnvelope[PaginatedInterviewResponse],
    summary="List assigned interviews for recruiters",
)
async def list_recruiter_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_recruiter),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    items, total = await service.repo.list_by_recruiter(
        recruiter_id=current_user.id, company_id=current_user.company_id, page=page, limit=limit, status=status
    )
    return ResponseEnvelope(
        success=True,
        message="Recruiter interviews retrieved successfully.",
        data=PaginatedInterviewResponse(
            items=[_map_interview(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.put(
    "/{interview_id}/respond",
    response_model=ResponseEnvelope[InterviewResponse],
    summary="Candidate accept, request reschedule, or decline interview",
)
async def candidate_respond_interview(
    interview_id: int,
    data: InterviewRespondRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    updated = await service.candidate_respond(candidate=current_user, interview_id=interview_id, request=data)
    return ResponseEnvelope(
        success=True,
        message="Interview response submitted successfully.",
        data=_map_interview(updated),
    )


@router.put(
    "/{interview_id}/feedback",
    response_model=ResponseEnvelope[InterviewResponse],
    summary="Submit interview evaluation ratings & feedback",
)
async def submit_interview_feedback(
    interview_id: int,
    data: InterviewFeedbackRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    updated = await service.submit_feedback(user=current_user, interview_id=interview_id, request=data)
    return ResponseEnvelope(
        success=True,
        message="Interview feedback submitted successfully.",
        data=_map_interview(updated),
    )


@router.put(
    "/{interview_id}/decision",
    response_model=ResponseEnvelope[InterviewResponse],
    summary="Record post-interview decision (Selected / Rejected / Hold / Next Round)",
)
async def record_interview_decision(
    interview_id: int,
    data: InterviewDecisionRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    service = InterviewService(session)
    updated = await service.record_decision(user=current_user, interview_id=interview_id, request=data)
    return ResponseEnvelope(
        success=True,
        message="Post-interview decision recorded successfully.",
        data=_map_interview(updated),
    )
