from datetime import datetime, timezone
from typing import Optional, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.interviews.models import Interview, InterviewStatus, InterviewMode, InterviewDecision
from app.interviews.repository import InterviewRepository
from app.interviews.schemas import (
    InterviewCreateRequest,
    InterviewRespondRequest,
    InterviewFeedbackRequest,
    InterviewDecisionRequest,
)
from app.applications.repository import ApplicationRepository
from app.applications.models import ApplicationStatus
from app.auth.models import User, UserRole
from app.core.errors import BadRequestException, ForbiddenException, NotFoundException
from app.notifications.service import NotificationService


class InterviewService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = InterviewRepository(session)
        self.app_repo = ApplicationRepository(session)

    async def schedule_interview(self, creator: User, data: InterviewCreateRequest) -> Interview:
        if creator.role not in [UserRole.EMPLOYER, UserRole.RECRUITER, UserRole.ADMIN]:
            raise ForbiddenException("Only employers, recruiters, or admins can schedule interviews.")

        application = await self.app_repo.get_by_id(data.application_id)
        if not application:
            raise NotFoundException(f"Application with ID {data.application_id} not found.")

        # Create Interview record
        interview = Interview(
            application_id=application.id,
            job_id=application.job_id,
            company_id=application.company_id,
            candidate_id=application.candidate_id,
            employer_id=application.employer_id or creator.id,
            recruiter_id=application.recruiter_id if application.recruiter_id else (creator.id if creator.role == UserRole.RECRUITER else None),
            interview_type=data.interview_type,
            interview_mode=InterviewMode(data.interview_mode.lower()),
            scheduled_at=data.scheduled_at,
            duration_minutes=data.duration_minutes,
            interviewer_name=data.interviewer_name,
            interviewer_email=data.interviewer_email,
            meeting_link=data.meeting_link,
            venue=data.venue,
            notes=data.notes,
            status=InterviewStatus.SCHEDULED,
        )

        created = await self.repo.create(interview)

        # Update application status to INTERVIEW_SCHEDULED
        application.status = ApplicationStatus.INTERVIEW_SCHEDULED
        application.updated_at = datetime.now(timezone.utc)
        history = application.status_history_json or []
        history.append({
            "status": ApplicationStatus.INTERVIEW_SCHEDULED.value,
            "changed_at": datetime.now(timezone.utc).isoformat(),
            "changed_by": creator.email,
            "note": f"Scheduled {data.interview_type} on {data.scheduled_at.strftime('%Y-%m-%d %H:%M')}",
        })
        application.status_history_json = history
        await self.app_repo.update(application)
        await self.session.commit()

        # Eager re-fetch
        refreshed = await self.repo.get_by_id(created.id)

        # Notifications
        candidate_name = application.candidate.candidate_profile.name if (application.candidate and application.candidate.candidate_profile) else application.candidate.email
        job_title = application.job.title if application.job else "a job"

        await NotificationService.notify_interview_scheduled(
            session=self.session,
            candidate_id=application.candidate_id,
            employer_id=application.employer_id,
            recruiter_id=application.recruiter_id,
            candidate_name=candidate_name,
            job_title=job_title,
            interview_type=data.interview_type,
            scheduled_at_str=data.scheduled_at.strftime('%Y-%m-%d %H:%M UTC'),
            interview_id=created.id,
        )

        return refreshed

    async def candidate_respond(self, candidate: User, interview_id: int, request: InterviewRespondRequest) -> Interview:
        interview = await self.repo.get_by_id(interview_id)
        if not interview:
            raise NotFoundException(f"Interview with ID {interview_id} not found.")

        if interview.candidate_id != candidate.id and candidate.role != UserRole.ADMIN:
            raise ForbiddenException("Access denied to this interview.")

        action = request.action.lower()
        if action == "accept":
            interview.status = InterviewStatus.ACCEPTED
        elif action == "reschedule":
            interview.status = InterviewStatus.RESCHEDULED
            interview.reschedule_reason = request.reason
            if request.proposed_date:
                interview.notes = f"{interview.notes or ''}\nProposed Reschedule Date: {request.proposed_date.isoformat()}".strip()
        elif action == "decline":
            interview.status = InterviewStatus.CANCELLED
            interview.decline_reason = request.reason
        else:
            raise BadRequestException("Invalid action. Must be accept, reschedule, or decline.")

        interview.updated_at = datetime.now(timezone.utc)
        updated = await self.repo.update(interview)
        await self.session.commit()

        # Notify Employer & Recruiter
        await NotificationService.notify_interview_responded(
            session=self.session,
            employer_id=interview.employer_id,
            recruiter_id=interview.recruiter_id,
            candidate_name=candidate.name or candidate.email,
            job_title=interview.job.title if interview.job else "job",
            action=action,
            interview_id=interview.id,
        )

        return updated

    async def submit_feedback(self, user: User, interview_id: int, request: InterviewFeedbackRequest) -> Interview:
        if user.role not in [UserRole.EMPLOYER, UserRole.RECRUITER, UserRole.ADMIN]:
            raise ForbiddenException("Only employers, recruiters, or admins can submit feedback.")

        interview = await self.repo.get_by_id(interview_id)
        if not interview:
            raise NotFoundException(f"Interview with ID {interview_id} not found.")

        feedback_data = {
            "technical_rating": request.technical_rating,
            "communication_rating": request.communication_rating,
            "behavioral_rating": request.behavioral_rating,
            "overall_rating": request.overall_rating,
            "recommendation": request.recommendation,
            "comments": request.comments,
            "submitted_by": user.email,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
        }

        interview.feedback_json = feedback_data
        interview.status = InterviewStatus.COMPLETED
        interview.updated_at = datetime.now(timezone.utc)

        # Update application history
        if interview.application:
            app = interview.application
            app.status = ApplicationStatus.INTERVIEW_COMPLETED
            notes = app.notes_json or []
            notes.append(f"Interview Feedback: {request.recommendation.upper()} (Overall: {request.overall_rating}/5) - {request.comments or ''}")
            app.notes_json = notes
            await self.app_repo.update(app)

        updated = await self.repo.update(interview)
        await self.session.commit()

        return updated

    async def record_decision(self, user: User, interview_id: int, request: InterviewDecisionRequest) -> Interview:
        if user.role not in [UserRole.EMPLOYER, UserRole.RECRUITER, UserRole.ADMIN]:
            raise ForbiddenException("Only employers, recruiters, or admins can make interview decisions.")

        interview = await self.repo.get_by_id(interview_id)
        if not interview:
            raise NotFoundException(f"Interview with ID {interview_id} not found.")

        decision_enum = InterviewDecision(request.decision.lower())
        interview.decision = decision_enum
        interview.decision_notes = request.decision_notes
        interview.updated_at = datetime.now(timezone.utc)

        # Update underlying application status based on post-interview decision
        app = interview.application
        if app:
            history = app.status_history_json or []
            if decision_enum == InterviewDecision.SELECTED:
                app.status = ApplicationStatus.SELECTED
                history_note = "Candidate selected after interview"
            elif decision_enum == InterviewDecision.REJECTED:
                app.status = ApplicationStatus.REJECTED
                history_note = "Candidate rejected after interview"
            elif decision_enum == InterviewDecision.HOLD:
                history_note = "Candidate placed on hold after interview"
            elif decision_enum == InterviewDecision.NEXT_ROUND:
                app.status = ApplicationStatus.INTERVIEW_SCHEDULED
                history_note = f"Advanced to next interview round ({request.next_round_type or 'Next Round'})"

            history.append({
                "status": app.status.value,
                "changed_at": datetime.now(timezone.utc).isoformat(),
                "changed_by": user.email,
                "note": f"Decision: {decision_enum.value.upper()} - {request.decision_notes or history_note}",
            })
            app.status_history_json = history
            await self.app_repo.update(app)

        updated = await self.repo.update(interview)
        await self.session.commit()

        return updated
