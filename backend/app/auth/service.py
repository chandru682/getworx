from datetime import datetime, timedelta, timezone
from typing import Dict
import secrets

from app.auth.exceptions import (
    InvalidCredentialsException,
    InvalidResetTokenException,
    InvalidTokenException,
    UserAlreadyExistsException,
    UserInactiveException,
    UserNotFoundException,
)
from app.auth.models import User, UserRole, UserStatus
from app.auth.repository import AuthRepository
from app.candidates.models import CandidateProfile
from app.auth.schemas import (
    AuthMeResponse,
    CandidateProfileCompletionResponse,
    CandidateProfileResponse,
    CandidateProfileUpdateRequest,
    ChangePasswordRequest,
    FirstLoginChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_reset_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.core.logging import logger
from app.core.errors import BadRequestException, ForbiddenException


class AuthService:
    """Authentication Service containing core enterprise identity and security business logic."""

    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def register(self, data: RegisterRequest) -> UserResponse:
        """Register a new candidate, recruiter, employer, or admin user."""
        existing_user = await self.repo.get_by_email(data.email)
        if existing_user:
            raise UserAlreadyExistsException(data.email)

        # Enforce onboarding rules: Recruiters cannot self-register
        from app.core.errors import ForbiddenException
        from app.auth.models import UserRole as _UserRole
        if data.role == _UserRole.RECRUITER:
            raise ForbiddenException("Recruiters cannot self-register. Employers must invite recruiters from their dashboard.")

        hashed_pwd = hash_password(data.password)
        candidate_profile_data = {
            "photo_url": data.photo_url,
            "phone": data.phone,
            "dob": data.dob,
            "gender": data.gender,
            "country": data.country,
            "state": data.state,
            "city": data.city,
            "current_role": data.current_role,
            "total_experience": data.total_experience,
            "preferred_job_role": data.preferred_job_role,
            "preferred_location": data.preferred_location,
            "expected_salary": data.expected_salary,
            "highest_qualification": data.highest_qualification,
            "university": data.university,
            "graduation_year": data.graduation_year,
            "resume_url": data.resume_url,
            "linkedin_url": data.linkedin_url,
            "portfolio_url": data.portfolio_url,
            "skills_json": data.skills,
            "languages_json": data.languages,
            "certifications_json": data.certifications,
        }

        user = await self.repo.create_user(
            name=data.name,
            email=data.email,
            password_hash=hashed_pwd,
            role=data.role,
            candidate_profile_data=candidate_profile_data,
        )

        logger.info(f"User registered successfully: ID={user.id}, Role={user.role}")
        return UserResponse.model_validate(user)

    async def login(self, data: LoginRequest) -> TokenResponse:
        """Authenticate user credentials and issue Access & Refresh tokens."""
        user = await self.repo.get_by_email(data.email)
        now = datetime.now(timezone.utc)
        
        if not user:
            logger.warning(f"Invalid login attempt for non-existent email: {data.email}")
            raise InvalidCredentialsException("Invalid email or password.")

        if user.locked_until and user.locked_until > now:
            logger.warning(f"Invalid login attempt for locked account: {data.email}")
            raise InvalidCredentialsException("Invalid email or password.")
            
        if not verify_password(data.password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = now + timedelta(minutes=15)
                logger.warning(f"Account locked due to 5 failed attempts: {data.email}")
            else:
                logger.warning(f"Invalid login attempt: {data.email}")
            self.repo.session.add(user)
            await self.repo.session.commit()
            raise InvalidCredentialsException("Invalid email or password.")
            
        # Reset on success
        user.failed_login_attempts = 0
        user.locked_until = None
        self.repo.session.add(user)
        await self.repo.session.commit()

        if user.status != UserStatus.ACTIVE.value:
            raise UserInactiveException(f"Account is currently {user.status}")

        # Enforce 'must change password' onboarding requirement
        from app.auth.exceptions import MustChangePasswordException, TemporaryPasswordExpiredException


        if getattr(user, "must_change_password", False):
            expiry = user.temporary_password_expiry
            if expiry:
                # Normalize to timezone-aware UTC if the DB returned a naive datetime (SQLite)
                if expiry.tzinfo is None:
                    expiry = expiry.replace(tzinfo=timezone.utc)
                if now > expiry:
                    # Temporary password expired — instruct to request a new invitation
                    raise TemporaryPasswordExpiredException()
            # Valid temporary password but user must change it before proceeding
            raise MustChangePasswordException()

        access_token = create_access_token(subject=user.id, role=user.role.value)
        refresh_token_str, expires_at = create_refresh_token(subject=user.id, role=user.role.value)

        # Store refresh token record for token tracking & revocation
        await self.repo.save_refresh_token(
            user_id=user.id,
            token=refresh_token_str,
            expires_at=expires_at,
        )

        logger.info(f"User logged in successfully: ID={user.id}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_str,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )

    async def resend_invitation(self, email: str, requested_by_id: int | None = None) -> dict:
        """Resend an onboarding invitation (generate fresh temporary password) for users who were invited but whose temporary password expired.

        requested_by_id is recorded as invited_by when resending.
        """
        from app.core.logging import logger as log
        from app.auth.repository import AuthRepository
        from app.notifications.service import NotificationService
        from app.auth.models import UserRole

        user = await self.repo.get_by_email(email)
        if not user:
            raise UserNotFoundException(email)

        if not getattr(user, "must_change_password", False):
            raise BadRequestException("User does not have a pending temporary password invitation")

        now = datetime.now(timezone.utc)
        # Generate new temporary password and expiry
        temp_password_plain = secrets.token_urlsafe(10)
        temp_password_hash = hash_password(temp_password_plain)
        expiry = now + timedelta(hours=settings.TEMP_PASSWORD_EXPIRY_HOURS)

        # Update invitation metadata via repository
        await self.repo.update_user_invitation(
            user=user,
            password_hash=temp_password_hash,
            invited_by_id=requested_by_id,
            invited_at=now,
            temporary_password_expiry=expiry,
        )

        # Send invitation email (abstracted/logged)
        await NotificationService.send_invitation_email(
            recipient_email=user.email,
            recipient_name=user.name,
            invited_by_id=requested_by_id,
            login_url=f"{settings.API_V1_STR}/auth/login",
            temporary_password=temp_password_plain,
            expiry=expiry,
        )

        log.info(f"Resent invitation for User ID={user.id}, Email={user.email}")
        return {"message": "Invitation resent successfully"}

    async def refresh_token(self, refresh_token_str: str) -> TokenResponse:
        """Issue new Access & Refresh tokens using a valid Refresh Token."""
        payload = decode_token(refresh_token_str, expected_type="refresh")
        user_id = int(payload.get("sub", 0))

        token_record = await self.repo.get_refresh_token(refresh_token_str)
        if not token_record:
            raise InvalidTokenException("Refresh token is invalid or has been revoked")

        user = await self.repo.get_by_id(user_id)
        if not user or user.status != UserStatus.ACTIVE.value:
            raise UserInactiveException("Associated user account is unavailable")

        # Rotate tokens: revoke old refresh token and issue new pair
        await self.repo.revoke_refresh_token(refresh_token_str)

        new_access_token = create_access_token(subject=user.id, role=user.role.value)
        new_refresh_token_str, new_expires_at = create_refresh_token(
            subject=user.id, role=user.role.value
        )

        await self.repo.save_refresh_token(
            user_id=user.id,
            token=new_refresh_token_str,
            expires_at=new_expires_at,
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token_str,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )

    async def logout(self, refresh_token_str: str) -> bool:
        """Revoke a refresh token on user logout."""
        try:
            decode_token(refresh_token_str, expected_type="refresh")
        except InvalidTokenException:
            pass

        revoked = await self.repo.revoke_refresh_token(refresh_token_str)
        return revoked

    async def get_me(self, user_id: int) -> AuthMeResponse:
        """Fetch logged-in user profile details with role-specific metadata."""
        from app.auth.schemas import AuthMeResponse
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise UserNotFoundException(user_id)

        user_name = user.name
        company_name = None
        subscription_status = None
        profile_completion = 95

        role_val = str(user.role.value if hasattr(user.role, 'value') else user.role).lower()
        if role_val == "candidate" and user.candidate_profile:
            user_name = user.candidate_profile.name or user.name
            profile_completion, _, _ = self._compute_profile_completion(user.candidate_profile)
        elif role_val == "employer" and user.employer_profile:
            user_name = user.employer_profile.name or user.name
            company_name = user.employer_profile.company_name
            subscription_status = "active"
        elif role_val == "recruiter" and user.recruiter_profile:
            user_name = user.recruiter_profile.name or user.name
            company_name = user.recruiter_profile.company_name

        avatar = f"https://ui-avatars.com/api/?name={user_name.replace(' ', '+')}&background=6D28D9&color=fff"

        return AuthMeResponse(
            id=user.id,
            name=user_name,
            email=user.email,
            role=user.role,
            status=user.status,
            avatar=avatar,
            company_name=company_name,
            profile_completion=profile_completion,
            subscription_status=subscription_status,
            notification_count=2,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    def _compute_profile_completion(self, profile: CandidateProfile) -> tuple[int, list[str], list[str]]:
        completed_sections: list[str] = []
        missing_sections: list[str] = []
        percentage = 0

        basic_fields = {
            "Profile Photo": bool(profile.photo_url),
            "Full Name": bool(profile.name),
            "Email": bool(profile.user and profile.user.email),
            "Mobile Number": bool(profile.phone),
            "Date of Birth": bool(profile.dob),
            "Gender": bool(profile.gender),
        }
        address_fields = {
            "Country": bool(profile.country),
            "State": bool(profile.state),
            "City": bool(profile.city),
        }
        professional_fields = {
            "Current Role": bool(profile.current_role),
            "Experience": bool(profile.total_experience),
            "Skills": bool(profile.skills_json and len(profile.skills_json) > 0),
            "Preferred Job Role": bool(profile.preferred_job_role),
            "Preferred Location": bool(profile.preferred_location),
            "Expected Salary": bool(profile.expected_salary),
        }
        education_fields = {
            "Degree": bool(profile.highest_qualification),
            "College": bool(profile.university),
            "Graduation Year": bool(profile.graduation_year),
        }
        additional_fields = {
            "Languages": bool(profile.languages_json and len(profile.languages_json) > 0),
            "Certifications": bool(profile.certifications_json and len(profile.certifications_json) > 0),
            "LinkedIn Profile": bool(profile.linkedin_url),
        }

        per_basic = 20 / len(basic_fields)
        for label, present in basic_fields.items():
            if present:
                percentage += per_basic
            else:
                missing_sections.append(label)
        if all(basic_fields.values()):
            completed_sections.append("Basic Information")

        per_address = 10 / len(address_fields)
        for label, present in address_fields.items():
            if present:
                percentage += per_address
            else:
                missing_sections.append(label)
        if all(address_fields.values()):
            completed_sections.append("Address")

        per_prof = 30 / len(professional_fields)
        for label, present in professional_fields.items():
            if present:
                percentage += per_prof
            else:
                missing_sections.append(label)
        if all(professional_fields.values()):
            completed_sections.append("Professional Details")

        per_education = 20 / len(education_fields)
        for label, present in education_fields.items():
            if present:
                percentage += per_education
            else:
                missing_sections.append(label)
        if all(education_fields.values()):
            completed_sections.append("Education")

        if profile.resume_url:
            percentage += 15
            completed_sections.append("Resume")
        else:
            missing_sections.append("Resume Upload")

        per_additional = 5 / len(additional_fields)
        for label, present in additional_fields.items():
            if present:
                percentage += per_additional
            else:
                missing_sections.append(label)
        if all(additional_fields.values()):
            completed_sections.append("Additional Information")

        percentage = min(100, round(percentage))
        return percentage, completed_sections, missing_sections

    async def get_candidate_profile_completion(self, user_id: int) -> CandidateProfileCompletionResponse:
        user = await self.repo.get_by_id(user_id)
        if not user or not user.candidate_profile:
            raise UserNotFoundException(user_id)

        profile = user.candidate_profile
        percentage, completed_sections, missing_sections = self._compute_profile_completion(profile)
        profile.profile_completion_percentage = percentage
        await self.repo.session.flush()

        return CandidateProfileCompletionResponse(
            percentage=percentage,
            completed_sections=completed_sections,
            missing_sections=missing_sections,
            profile_last_updated=profile.profile_last_updated,
        )

    async def get_candidate_profile(self, user_id: int) -> CandidateProfileResponse:
        user = await self.repo.get_by_id(user_id)
        if not user or not user.candidate_profile:
            raise UserNotFoundException(user_id)

        profile = user.candidate_profile
        percentage, _, _ = self._compute_profile_completion(profile)
        profile.profile_completion_percentage = percentage

        return CandidateProfileResponse(
            name=profile.name,
            photo_url=profile.photo_url,
            email=user.email,
            phone=profile.phone,
            dob=profile.dob,
            gender=profile.gender,
            country=profile.country,
            state=profile.state,
            city=profile.city,
            current_role=profile.current_role,
            total_experience=profile.total_experience,
            preferred_job_role=profile.preferred_job_role,
            preferred_location=profile.preferred_location,
            expected_salary=profile.expected_salary,
            highest_qualification=profile.highest_qualification,
            university=profile.university,
            graduation_year=profile.graduation_year,
            resume_url=profile.resume_url,
            linkedin_url=profile.linkedin_url,
            portfolio_url=profile.portfolio_url,
            skills=profile.skills_json or [],
            languages=profile.languages_json or [],
            certifications=profile.certifications_json or [],
            profile_completion_percentage=percentage,
            profile_last_updated=profile.profile_last_updated,
        )

    async def update_candidate_profile(
        self, user_id: int, data: CandidateProfileUpdateRequest
    ) -> CandidateProfileResponse:
        user = await self.repo.get_by_id(user_id)
        if not user or not user.candidate_profile:
            raise UserNotFoundException(user_id)
        if user.role != UserRole.CANDIDATE:
            raise ForbiddenException("Only candidate users may update candidate profiles")

        profile = user.candidate_profile
        for field in [
            "name", "photo_url", "phone", "dob", "gender", "country", "state", "city",
            "current_role", "total_experience", "preferred_job_role", "preferred_location",
            "expected_salary", "highest_qualification", "university", "graduation_year",
            "resume_url", "linkedin_url", "portfolio_url"
        ]:
            value = getattr(data, field)
            if value is not None:
                setattr(profile, field, value)

        if data.skills is not None:
            profile.skills_json = data.skills
        if data.languages is not None:
            profile.languages_json = data.languages
        if data.certifications is not None:
            profile.certifications_json = data.certifications

        percentage, _, _ = self._compute_profile_completion(profile)
        profile.profile_completion_percentage = percentage
        profile.profile_last_updated = datetime.now(timezone.utc)
        self.repo.session.add(profile)
        await self.repo.session.flush()

        return await self.get_candidate_profile(user_id)

    async def forgot_password(self, email: str) -> Dict[str, str]:
        """Generate a secure password reset token (keeps email service abstract for future SMTP integration)."""
        user = await self.repo.get_by_email(email)
        if user:
            token = generate_reset_token()
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
            await self.repo.save_password_reset_token(
                user_id=user.id, token=token, expires_at=expires_at
            )
            # In production, dispatch async email event via SMTP / SES
            logger.info(f"Password reset token generated for User ID={user.id}")

        # Always return generic message to prevent email enumeration
        return {
            "message": "If the email is registered, a password reset link has been dispatched."
        }

    async def reset_password(self, data: ResetPasswordRequest) -> Dict[str, str]:
        """Reset password using a valid reset token."""
        reset_token_record = await self.repo.get_valid_reset_token(data.token)
        if not reset_token_record:
            raise InvalidResetTokenException()

        user = await self.repo.get_by_id(reset_token_record.user_id)
        if not user:
            raise UserNotFoundException()

        new_hashed_pwd = hash_password(data.new_password)
        await self.repo.update_password(user, new_hashed_pwd)
        await self.repo.mark_reset_token_used(reset_token_record)
        await self.repo.revoke_all_user_refresh_tokens(user.id)

        logger.info(f"Password reset successfully completed for User ID={user.id}")
        return {"message": "Password reset successful. Please log in with your new password."}

    async def change_password(self, user_id: int, data: ChangePasswordRequest) -> Dict[str, str]:
        """Change current logged in user's password after verifying existing password."""
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise UserNotFoundException(user_id)

        if not verify_password(data.current_password, user.password_hash):
            raise InvalidCredentialsException("Current password is incorrect")

        new_hashed_pwd = hash_password(data.new_password)
        await self.repo.update_password(user, new_hashed_pwd)
        await self.repo.revoke_all_user_refresh_tokens(user.id)

        logger.info(f"Password changed for User ID={user_id}")
        return {"message": "Password changed successfully."}

    async def first_login_change_password(self, data: FirstLoginChangePasswordRequest) -> TokenResponse:
        """Process forced password change during first login for users with must_change_password == True."""
        from app.auth.exceptions import TemporaryPasswordExpiredException
        user = await self.repo.get_by_email(data.email)
        if not user or not verify_password(data.temporary_password, user.password_hash):
            raise InvalidCredentialsException("Invalid email or temporary password.")

        if not getattr(user, "must_change_password", False):
            raise BadRequestException("Password change is not required for this account.")

        now = datetime.now(timezone.utc)
        expiry = user.temporary_password_expiry
        if expiry:
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            if now > expiry:
                raise TemporaryPasswordExpiredException()

        new_hashed_pwd = hash_password(data.new_password)
        await self.repo.update_password(user, new_hashed_pwd)

        access_token = create_access_token(subject=user.id, role=user.role.value)
        refresh_token_str, expires_at = create_refresh_token(subject=user.id, role=user.role.value)

        await self.repo.save_refresh_token(
            user_id=user.id,
            token=refresh_token_str,
            expires_at=expires_at,
        )

        logger.info(f"First login password change completed for User ID={user.id}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_str,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )

    async def get_all_candidates(self) -> list[UserResponse]:
        """Fetch all registered candidates."""
        candidates = await self.repo.get_all_candidates()
        return [UserResponse.model_validate(c) for c in candidates]


