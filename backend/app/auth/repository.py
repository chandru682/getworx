from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import PasswordResetToken, RefreshToken, User, UserRole, UserStatus


class AuthRepository:
    """Encapsulates all database persistence operations for Authentication & Users."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user record by email address."""
        stmt = select(User).where(User.email == email.lower(), User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch user record by primary key ID."""
        stmt = select(User).where(User.id == user_id, User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, name: str, email: str, password_hash: str, role: UserRole) -> User:
        """Create and persist a new User entity."""
        user = User(
            name=name,
            email=email.lower(),
            password_hash=password_hash,
            role=role,
            status=UserStatus.ACTIVE.value,
            is_verified=False,
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update_password(self, user: User, new_password_hash: str) -> User:
        """Update password hash for a user."""
        user.password_hash = new_password_hash
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        await self.session.flush()
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
