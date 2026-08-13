import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    String,
    Integer,
    inspect,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import Base

if TYPE_CHECKING:
    from app.candidates.models import CandidateProfile
    from app.employers.models import EmployerProfile
    from app.recruiters.models import RecruiterProfile


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYER = "EMPLOYER"
    RECRUITER = "RECRUITER"
    CANDIDATE = "CANDIDATE"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


def _get_profile(obj):
    role = getattr(obj, "role", None)
    rel_name = None
    if role == UserRole.CANDIDATE:
        rel_name = "candidate_profile"
    elif role == UserRole.EMPLOYER:
        rel_name = "employer_profile"
    elif role == UserRole.RECRUITER:
        rel_name = "recruiter_profile"

    if not rel_name:
        return None

    try:
        state = inspect(obj)
        if state and hasattr(state, "unloaded") and rel_name in state.unloaded:
            return None
        return getattr(obj, rel_name, None)
    except Exception:
        return None


class User(Base):
    """User DB Model representing authentication credentials and core identity across Platform Admins, Employers, Recruiters, and Candidates."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False, index=True
    )

    # Onboarding / Security fields
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships to Sessions & Password Tokens
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )

    # Profile Relationships (Eagerly loaded via selectin)
    candidate_profile: Mapped[Optional["CandidateProfile"]] = relationship(
        "CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="CandidateProfile.user_id", lazy="selectin"
    )
    employer_profile: Mapped[Optional["EmployerProfile"]] = relationship(
        "EmployerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="EmployerProfile.user_id", lazy="selectin"
    )
    recruiter_profile: Mapped[Optional["RecruiterProfile"]] = relationship(
        "RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="RecruiterProfile.user_id", lazy="selectin"
    )

    __table_args__ = (
        Index("idx_users_email_role", "email", "role"),
    )

    def __init__(self, **kwargs):
        name = kwargs.pop("name", None)
        company_id = kwargs.pop("company_id", None)
        company_name = kwargs.pop("company_name", None)
        invited_by_id = kwargs.pop("invited_by_id", None)
        invited_at = kwargs.pop("invited_at", None)
        temporary_password_expiry = kwargs.pop("temporary_password_expiry", None)
        kwargs.pop("is_verified", None)

        super().__init__(**kwargs)

        if name is not None:
            self.name = name
        if company_id is not None:
            self.company_id = company_id
        if company_name is not None:
            self.company_name = company_name
        if invited_by_id is not None:
            self.invited_by_id = invited_by_id
        if invited_at is not None:
            self.invited_at = invited_at
        if temporary_password_expiry is not None:
            self.temporary_password_expiry = temporary_password_expiry

    # ── Virtual Accessor Properties ───────────────────────────────────────────

    @property
    def name(self) -> str:
        profile = _get_profile(self)
        if profile and getattr(profile, "name", None):
            return profile.name
        return getattr(self, "_temp_name", "Admin")

    @name.setter
    def name(self, value: str) -> None:
        self._temp_name = value
        role = getattr(self, "role", None)
        if role == UserRole.CANDIDATE:
            profile = _get_profile(self)
            if not profile:
                from app.candidates.models import CandidateProfile
                self.candidate_profile = CandidateProfile(name=value)
            else:
                profile.name = value
        elif role == UserRole.EMPLOYER:
            profile = _get_profile(self)
            if not profile:
                from app.employers.models import EmployerProfile
                self.employer_profile = EmployerProfile(name=value)
            else:
                profile.name = value
        elif role == UserRole.RECRUITER:
            profile = _get_profile(self)
            if not profile:
                from app.recruiters.models import RecruiterProfile
                self.recruiter_profile = RecruiterProfile(name=value)
            else:
                profile.name = value

    @property
    def company_id(self) -> Optional[int]:
        profile = _get_profile(self)
        if profile and hasattr(profile, "company_id"):
            return profile.company_id
        return getattr(self, "_temp_company_id", None)

    @company_id.setter
    def company_id(self, value: Optional[int]) -> None:
        self._temp_company_id = value
        role = getattr(self, "role", None)
        if role == UserRole.EMPLOYER:
            profile = _get_profile(self)
            if not profile:
                from app.employers.models import EmployerProfile
                self.employer_profile = EmployerProfile(name=getattr(self, "_temp_name", "Employer"), company_id=value)
            else:
                profile.company_id = value
        elif role == UserRole.RECRUITER:
            profile = _get_profile(self)
            if not profile:
                from app.recruiters.models import RecruiterProfile
                self.recruiter_profile = RecruiterProfile(name=getattr(self, "_temp_name", "Recruiter"), company_id=value)
            else:
                profile.company_id = value

    @property
    def company_name(self) -> Optional[str]:
        profile = _get_profile(self)
        if profile and hasattr(profile, "company_name"):
            return profile.company_name
        return getattr(self, "_temp_company_name", None)

    @company_name.setter
    def company_name(self, value: Optional[str]) -> None:
        self._temp_company_name = value
        role = getattr(self, "role", None)
        if role == UserRole.EMPLOYER:
            profile = _get_profile(self)
            if not profile:
                from app.employers.models import EmployerProfile
                self.employer_profile = EmployerProfile(name=getattr(self, "_temp_name", "Employer"), company_name=value)
            else:
                profile.company_name = value
        elif role == UserRole.RECRUITER:
            profile = _get_profile(self)
            if not profile:
                from app.recruiters.models import RecruiterProfile
                self.recruiter_profile = RecruiterProfile(name=getattr(self, "_temp_name", "Recruiter"), company_name=value)
            else:
                profile.company_name = value

    @property
    def invited_by_id(self) -> Optional[int]:
        profile = _get_profile(self)
        if profile and hasattr(profile, "invited_by_id"):
            return profile.invited_by_id
        return getattr(self, "_temp_invited_by_id", None)

    @invited_by_id.setter
    def invited_by_id(self, value: Optional[int]) -> None:
        self._temp_invited_by_id = value
        role = getattr(self, "role", None)
        if role == UserRole.EMPLOYER:
            profile = _get_profile(self)
            if not profile:
                from app.employers.models import EmployerProfile
                self.employer_profile = EmployerProfile(name=getattr(self, "_temp_name", "Employer"), invited_by_id=value)
            else:
                profile.invited_by_id = value
        elif role == UserRole.RECRUITER:
            profile = _get_profile(self)
            if not profile:
                from app.recruiters.models import RecruiterProfile
                self.recruiter_profile = RecruiterProfile(name=getattr(self, "_temp_name", "Recruiter"), invited_by_id=value)
            else:
                profile.invited_by_id = value

    @property
    def invited_at(self) -> Optional[datetime]:
        profile = _get_profile(self)
        if profile and hasattr(profile, "invited_at"):
            return profile.invited_at
        return getattr(self, "_temp_invited_at", None)

    @invited_at.setter
    def invited_at(self, value: Optional[datetime]) -> None:
        self._temp_invited_at = value
        role = getattr(self, "role", None)
        if role == UserRole.EMPLOYER:
            profile = _get_profile(self)
            if not profile:
                from app.employers.models import EmployerProfile
                self.employer_profile = EmployerProfile(name=getattr(self, "_temp_name", "Employer"), invited_at=value)
            else:
                profile.invited_at = value
        elif role == UserRole.RECRUITER:
            profile = _get_profile(self)
            if not profile:
                from app.recruiters.models import RecruiterProfile
                self.recruiter_profile = RecruiterProfile(name=getattr(self, "_temp_name", "Recruiter"), invited_at=value)
            else:
                profile.invited_at = value

    @property
    def temporary_password_expiry(self) -> Optional[datetime]:
        profile = _get_profile(self)
        if profile and hasattr(profile, "temporary_password_expiry"):
            return profile.temporary_password_expiry
        return getattr(self, "_temp_temporary_password_expiry", None)

    @temporary_password_expiry.setter
    def temporary_password_expiry(self, value: Optional[datetime]) -> None:
        self._temp_temporary_password_expiry = value
        role = getattr(self, "role", None)
        if role == UserRole.EMPLOYER:
            profile = _get_profile(self)
            if not profile:
                from app.employers.models import EmployerProfile
                self.employer_profile = EmployerProfile(name=getattr(self, "_temp_name", "Employer"), temporary_password_expiry=value)
            else:
                profile.temporary_password_expiry = value
        elif role == UserRole.RECRUITER:
            profile = _get_profile(self)
            if not profile:
                from app.recruiters.models import RecruiterProfile
                self.recruiter_profile = RecruiterProfile(name=getattr(self, "_temp_name", "Recruiter"), temporary_password_expiry=value)
            else:
                profile.temporary_password_expiry = value

    @property
    def is_verified(self) -> bool:
        return True

    @property
    def last_password_changed_at(self) -> Optional[datetime]:
        return getattr(self, "_last_password_changed_at", None)

    @last_password_changed_at.setter
    def last_password_changed_at(self, value: Optional[datetime]) -> None:
        self._last_password_changed_at = value


class RefreshToken(Base):
    """RefreshToken DB Model to track active sessions, revocation, and refresh tokens."""

    __tablename__ = "refresh_tokens"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(512), unique=True, index=True, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")


class PasswordResetToken(Base):
    """PasswordResetToken DB Model to track secure email password reset tokens."""

    __tablename__ = "password_reset_tokens"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="reset_tokens")
