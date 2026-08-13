from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import PasswordResetToken, RefreshToken, User, UserRole, UserStatus
from app.candidates.models import CandidateProfile
from app.employers.models import EmployerProfile
from app.recruiters.models import RecruiterProfile


class AuthRepository:
    """Encapsulates all database persistence operations for Authentication & Users."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user record by email address."""
        stmt = (
            select(User)
            .options(
                selectinload(User.candidate_profile),
                selectinload(User.employer_profile),
                selectinload(User.recruiter_profile),
            )
            .where(User.email == email.lower(), User.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch user record by primary key ID."""
        stmt = (
            select(User)
            .options(
                selectinload(User.candidate_profile),
                selectinload(User.employer_profile),
                selectinload(User.recruiter_profile),
            )
            .where(User.id == user_id, User.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(
        self,
        name: str,
        email: str,
        password_hash: str,
        role: UserRole,
        must_change_password: bool = False,
        invited_by_id: int | None = None,
        invited_at: datetime | None = None,
        temporary_password_expiry: datetime | None = None,
        candidate_profile_data: dict | None = None,
    ) -> User:
        """Create and persist a new User entity and its corresponding profile record."""
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            role=role,
            status=UserStatus.ACTIVE.value,
            must_change_password=must_change_password,
        )
        self.session.add(user)
        await self.session.flush()

        # Create separate profile table record
        if role == UserRole.CANDIDATE:
            profile_kwargs = {
                "user_id": user.id,
                "name": name,
            }
            if candidate_profile_data:
                profile_kwargs.update({
                    "photo_url": candidate_profile_data.get("photo_url"),
                    "phone": candidate_profile_data.get("phone"),
                    "dob": candidate_profile_data.get("dob"),
                    "gender": candidate_profile_data.get("gender"),
                    "country": candidate_profile_data.get("country"),
                    "state": candidate_profile_data.get("state"),
                    "city": candidate_profile_data.get("city"),
                    "current_role": candidate_profile_data.get("current_role"),
                    "total_experience": candidate_profile_data.get("total_experience"),
                    "preferred_job_role": candidate_profile_data.get("preferred_job_role"),
                    "preferred_location": candidate_profile_data.get("preferred_location"),
                    "expected_salary": candidate_profile_data.get("expected_salary"),
                    "highest_qualification": candidate_profile_data.get("highest_qualification"),
                    "university": candidate_profile_data.get("university"),
                    "graduation_year": candidate_profile_data.get("graduation_year"),
                    "resume_url": candidate_profile_data.get("resume_url"),
                    "linkedin_url": candidate_profile_data.get("linkedin_url"),
                    "portfolio_url": candidate_profile_data.get("portfolio_url"),
                    "skills_json": candidate_profile_data.get("skills_json"),
                    "languages_json": candidate_profile_data.get("languages_json"),
                    "certifications_json": candidate_profile_data.get("certifications_json"),
                })
                if any(candidate_profile_data.values()):
                    profile_kwargs["profile_last_updated"] = datetime.now(timezone.utc)
            profile = CandidateProfile(**profile_kwargs)
            self.session.add(profile)
            user.candidate_profile = profile
        elif role == UserRole.EMPLOYER:
            profile = EmployerProfile(
                user_id=user.id,
                name=name,
                invited_by_id=invited_by_id,
                invited_at=invited_at,
                temporary_password_expiry=temporary_password_expiry,
            )
            self.session.add(profile)
            user.employer_profile = profile
        elif role == UserRole.RECRUITER:
            profile = RecruiterProfile(
                user_id=user.id,
                name=name,
                invited_by_id=invited_by_id,
                invited_at=invited_at,
                temporary_password_expiry=temporary_password_expiry,
            )
            self.session.add(profile)
            user.recruiter_profile = profile

        await self.session.flush()
        loaded = await self.get_by_id(user.id)
        return loaded or user

    async def update_password(self, user: User, new_password_hash: str) -> User:
        """Update password hash for a user."""
        now = datetime.now(timezone.utc)
        user.password_hash = new_password_hash
        user.updated_at = now
        user.must_change_password = False
        user.last_password_changed_at = now
        user.temporary_password_expiry = None
        self.session.add(user)
        if user.role == UserRole.EMPLOYER and user.employer_profile:
            self.session.add(user.employer_profile)
        elif user.role == UserRole.RECRUITER and user.recruiter_profile:
            self.session.add(user.recruiter_profile)
        await self.session.flush()
        return user

    async def update_user_invitation(
        self,
        user: User,
        password_hash: str,
        invited_by_id: int | None,
        invited_at: datetime,
        temporary_password_expiry: datetime,
    ) -> User:
        """Update invitation-related fields for resending or creating an invitation."""
        user.password_hash = password_hash
        user.invited_by_id = invited_by_id
        user.invited_at = invited_at
        user.temporary_password_expiry = temporary_password_expiry
        user.must_change_password = True
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        if user.role == UserRole.EMPLOYER and user.employer_profile:
            self.session.add(user.employer_profile)
        elif user.role == UserRole.RECRUITER and user.recruiter_profile:
            self.session.add(user.recruiter_profile)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def save_refresh_token(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        """Save a new RefreshToken entity to DB."""
        rf_token = RefreshToken(
            user_id=user_id,
            token=token,
            is_revoked=False,
            expires_at=expires_at,
        )
        self.session.add(rf_token)
        await self.session.flush()
        return rf_token

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Find active unrevoked refresh token record."""
        stmt = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.is_revoked.is_(False),
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a specific refresh token."""
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token == token)
            .values(is_revoked=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def revoke_all_user_refresh_tokens(self, user_id: int) -> int:
        """Revoke all active refresh tokens for a user (e.g. on password change/logout all)."""
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked.is_(False))
            .values(is_revoked=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount

    async def save_password_reset_token(self, user_id: int, token: str, expires_at: datetime) -> PasswordResetToken:
        """Save password reset token record."""
        reset_token = PasswordResetToken(
            user_id=user_id,
            token=token,
            is_used=False,
            expires_at=expires_at,
        )
        self.session.add(reset_token)
        await self.session.flush()
        return reset_token

    async def get_valid_reset_token(self, token: str) -> Optional[PasswordResetToken]:
        """Fetch unused and unexpired password reset token record."""
        stmt = select(PasswordResetToken).where(
            PasswordResetToken.token == token,
            PasswordResetToken.is_used.is_(False),
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def mark_reset_token_used(self, reset_token: PasswordResetToken) -> None:
        """Mark a password reset token as used."""
        reset_token.is_used = True
        self.session.add(reset_token)
        await self.session.flush()

    async def get_all_candidates(self) -> list[User]:
        """Fetch all user records with CANDIDATE role."""
        stmt = (
            select(User)
            .options(selectinload(User.candidate_profile))
            .where(User.role == UserRole.CANDIDATE, User.deleted_at.is_(None))
            .order_by(User.id.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

