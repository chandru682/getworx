import enum
from datetime import datetime, timezone
from typing import Any, Optional
import secrets

from sqlalchemy.ext.asyncio import AsyncSession

from app.applications.models import Application, ApplicationStatus, ApplicationAnswer
from app.applications.repository import ApplicationRepository
from app.auth.models import User, UserRole
from app.auth.exceptions import ForbiddenException, NotFoundException
from app.candidates.models import CandidateProfile
from app.jobs.repository import JobRepository
from app.notifications.service import NotificationService
from app.admin.service import AdminService
from app.core.errors import BadRequestException


class ApplicationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ApplicationRepository(session)
        self.job_repo = JobRepository(session)

    async def _candidate_has_valid_profile(self, candidate: User) -> tuple[bool, bool, int]:
        if not candidate.candidate_profile:
            return False, False, 0
        has_resume = bool(candidate.candidate_profile.resume_url)
        percentage, _, _ = self._compute_profile_completion(candidate.candidate_profile)
        return True, has_resume, percentage

    def _compute_profile_completion(self, profile: CandidateProfile) -> tuple[int, list[str], list[str]]:
        completed_sections: list[str] = []
        missing_sections: list[str] = []
        percentage = 0

        fields = {
            "Profile Photo": bool(profile.photo_url),
            "Full Name": bool(profile.name),
            "Email": bool(profile.user and profile.user.email),
            "Mobile Number": bool(profile.phone),
            "Date of Birth": bool(profile.dob),
            "Gender": bool(profile.gender),
            "Country": bool(profile.country),
            "State": bool(profile.state),
            "City": bool(profile.city),
            "Current Role": bool(profile.current_role),
            "Experience": bool(profile.total_experience),
            "Skills": bool(profile.skills_json and len(profile.skills_json) > 0),
            "Preferred Job Role": bool(profile.preferred_job_role),
            "Preferred Location": bool(profile.preferred_location),
            "Expected Salary": bool(profile.expected_salary),
            "Highest Qualification": bool(profile.highest_qualification),
            "University": bool(profile.university),
            "Graduation Year": bool(profile.graduation_year),
            "Resume": bool(profile.resume_url),
            "Languages": bool(profile.languages_json and len(profile.languages_json) > 0),
            "Certifications": bool(profile.certifications_json and len(profile.certifications_json) > 0),
        }
        per_field = 100 / len(fields)
        for label, present in fields.items():
            if present:
                percentage += per_field
            else:
                missing_sections.append(label)
        percentage = min(100, round(percentage))
        if all(fields.values()):
            completed_sections.append("Profile Complete")
        return percentage, completed_sections, missing_sections

    async def apply_for_job(self, candidate: User, data: Any) -> Application:
        if candidate.role != UserRole.CANDIDATE:
            raise ForbiddenException("Only candidates may submit job applications.")

        if not candidate.candidate_profile:
            raise BadRequestException("Candidate profile must exist before applying for a job.")

        if not candidate.candidate_profile.resume_url and not data.resume_url:
            raise BadRequestException("Resume must be uploaded before applying for this job.")

        job = await self.job_repo.get_by_id(data.job_id)
        if not job:
            raise NotFoundException(f"Job with ID {data.job_id} not found.")

        duplicate = await self.repo.get_by_candidate_and_job(candidate.id, job.id)
        if duplicate:
            raise BadRequestException("Duplicate application detected for this job.")

        # Process screening answers
        initial_status = ApplicationStatus.APPLIED
        knockout_triggered = False
        knockout_details = None

        screening_answers_to_create = []
        provided_answers = data.answers if data.answers else []

        for q in job.screening_questions:
            # Find matching answer
            ans_obj = next((a for a in provided_answers if a.question_id == q.id), None)
            
            # Check mandatory constraint
            if q.is_mandatory and (not ans_obj or not ans_obj.candidate_answer.strip()):
                raise BadRequestException(f"Screening question '{q.question_text}' is required.")

            if ans_obj:
                candidate_answer_str = ans_obj.candidate_answer.strip()
                # Create DB model instance
                answer_model = ApplicationAnswer(
                    question_id=q.id,
                    candidate_answer=candidate_answer_str
                )
                screening_answers_to_create.append(answer_model)

                # Check knockout condition
                if getattr(q, 'is_knockout', False) and getattr(q, 'preferred_answer', None):
                    cand_ans_norm = candidate_answer_str.lower()
                    pref_ans_norm = q.preferred_answer.strip().lower()
                    if cand_ans_norm != pref_ans_norm:
                        knockout_triggered = True
                        knockout_details = f"Auto-rejected: candidate answer '{candidate_answer_str}' does not match preferred answer '{q.preferred_answer}'."

        if knockout_triggered:
            initial_status = ApplicationStatus.REJECTED

        status_history = [
            {
                "status": initial_status.value,
                "changed_at": datetime.now(timezone.utc).isoformat(),
                "changed_by": candidate.email,
                "note": knockout_details if knockout_triggered else "Application submitted",
            }
        ]

        application_reference = f"APP-{secrets.token_hex(6).upper()}"
        application = Application(
            candidate_id=candidate.id,
            job_id=job.id,
            company_id=job.company_id,
            employer_id=job.created_by_id,
            recruiter_id=job.assigned_recruiter_id,
            resume_url=data.resume_url or candidate.candidate_profile.resume_url,
            cover_letter=data.cover_letter,
            status=initial_status,
            applied_at=datetime.now(timezone.utc),
            status_history_json=status_history,
            notes_json=[knockout_details] if knockout_triggered else [],
            application_reference=application_reference,
        )

        # Attach answers
        for answer_model in screening_answers_to_create:
            application.screening_answers.append(answer_model)

        created = await self.repo.create(application)
        await self.session.commit()

        # Eagerly refresh to populate screening_answers properly for serializer
        refreshed = await self.repo.get_by_id(created.id)

        # Trigger DB notifications for all roles
        await NotificationService.notify_candidate_application_submitted(
            session=self.session,
            candidate_id=candidate.id,
            application_reference=application_reference,
            job_title=job.title,
            application_id=created.id,
        )

        if job.created_by_id:
            await NotificationService.notify_employer_new_application(
                session=self.session,
                employer_id=job.created_by_id,
                candidate_name=candidate.candidate_profile.name if candidate.candidate_profile else candidate.email,
                job_title=job.title,
                application_id=created.id,
            )

        if job.assigned_recruiter_id:
            await NotificationService.notify_recruiter_application_assigned(
                session=self.session,
                recruiter_id=job.assigned_recruiter_id,
                candidate_name=candidate.candidate_profile.name if candidate.candidate_profile else candidate.email,
                job_title=job.title,
                application_id=created.id,
            )

        # Notify Admins
        admin_service = AdminService(self.session)
        admin_ids = await admin_service.get_admin_user_ids()
        if admin_ids:
            await NotificationService.notify_admins_new_application(
                session=self.session,
                admin_user_ids=admin_ids,
                candidate_name=candidate.candidate_profile.name if candidate.candidate_profile else candidate.email,
                job_title=job.title,
                application_id=created.id,
            )

        return refreshed

    async def get_candidate_applications(
        self,
        candidate: User,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Application], int]:
        return await self.repo.list_by_candidate(candidate.id, page=page, limit=limit, status=status, search=search)

    async def get_company_applications(
        self,
        company_id: Optional[int] = None,
        employer_id: Optional[int] = None,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Application], int]:
        return await self.repo.list_by_company(company_id=company_id, employer_id=employer_id, page=page, limit=limit, status=status, search=search)

    async def get_recruiter_applications(
        self,
        recruiter: User,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Application], int]:
        # Resolve company_id directly from recruiter_profiles table (async-safe)
        from sqlalchemy import select as sa_select
        from app.recruiters.models import RecruiterProfile
        resolved_company_id = None
        try:
            rp_res = await self.session.execute(
                sa_select(RecruiterProfile).where(RecruiterProfile.user_id == recruiter.id)
            )
            rp = rp_res.scalar_one_or_none()
            if rp:
                resolved_company_id = rp.company_id
        except Exception:
            pass
        # Fallback to virtual property if direct query failed
        if not resolved_company_id:
            try:
                resolved_company_id = recruiter.company_id
            except Exception:
                resolved_company_id = None

        return await self.repo.list_by_recruiter(
            recruiter_id=recruiter.id,
            company_id=resolved_company_id,
            page=page,
            limit=limit,
            status=status,
            search=search,
        )

    async def update_application_status(
        self,
        application_id: int,
        updater: User,
        request: Any,
    ) -> Application:
        application = await self.repo.get_by_id(application_id)
        if not application:
            raise NotFoundException(f"Application with ID {application_id} not found.")

        if updater.role not in [UserRole.EMPLOYER, UserRole.RECRUITER, UserRole.ADMIN]:
            raise ForbiddenException("Only employers, recruiters, or admins may update application status.")

        if application.company_id is None:
            raise BadRequestException("Application is not associated with a company.")

        application.status = ApplicationStatus(request.status)
        application.updated_at = datetime.now(timezone.utc)
        history = application.status_history_json or []
        history.append({
            "status": application.status.value,
            "changed_at": datetime.now(timezone.utc).isoformat(),
            "changed_by": updater.email,
            "note": request.note,
        })
        application.status_history_json = history

        if request.note:
            notes = application.notes_json or []
            notes.append(request.note)
            application.notes_json = notes

        updated = await self.repo.update(application)
        await self.session.commit()

        await NotificationService.notify_candidate_status_changed(
            session=self.session,
            candidate_id=application.candidate_id,
            application_reference=application.application_reference,
            new_status=application.status.value,
            application_id=application.id,
        )

        return updated

    async def add_application_note(self, application_id: int, updater: User, note: str) -> Application:
        application = await self.repo.get_by_id(application_id)
        if not application:
            raise NotFoundException(f"Application with ID {application_id} not found.")

        if updater.role not in [UserRole.EMPLOYER, UserRole.RECRUITER, UserRole.ADMIN]:
            raise ForbiddenException("Only employers, recruiters, or admins may add notes.")

        notes = application.notes_json or []
        notes.append(note)
        application.notes_json = notes
        application.updated_at = datetime.now(timezone.utc)

        updated = await self.repo.update(application)
        await self.session.commit()
        return updated

    async def assign_recruiter(self, application_id: int, assigner: User, recruiter_id: int) -> Application:
        application = await self.repo.get_by_id(application_id)
        if not application:
            raise NotFoundException(f"Application with ID {application_id} not found.")

        if assigner.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
            raise ForbiddenException("Only employers or admins can assign recruiters to applications.")

        application.recruiter_id = recruiter_id
        application.updated_at = datetime.now(timezone.utc)
        
        history = application.status_history_json or []
        history.append({
            "status": application.status.value if hasattr(application.status, "value") else str(application.status),
            "changed_at": datetime.now(timezone.utc).isoformat(),
            "changed_by": assigner.email,
            "note": f"Assigned recruiter ID {recruiter_id}",
        })
        application.status_history_json = history

        updated = await self.repo.update(application)
        await self.session.commit()

        # Notify the assigned recruiter
        candidate_name = application.candidate.email
        if application.candidate and application.candidate.candidate_profile:
            candidate_name = application.candidate.candidate_profile.name

        await NotificationService.notify_recruiter_application_assigned(
            session=self.session,
            recruiter_id=recruiter_id,
            candidate_name=candidate_name,
            job_title=application.job.title if application.job else "a job",
            application_id=application.id,
        )

        return updated
