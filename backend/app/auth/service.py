from datetime import datetime, timedelta, timezone
from typing import Dict

from app.auth.exceptions import (
    InvalidCredentialsException,
    InvalidResetTokenException,
    InvalidTokenException,
    UserAlreadyExistsException,
    UserInactiveException,
    UserNotFoundException,
)
from app.auth.models import User, UserStatus
from app.auth.repository import AuthRepository
from app.auth.schemas import (
    ChangePasswordRequest,
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


class AuthService:
    """Authentication Service containing core enterprise identity and security business logic."""

    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def register(self, data: RegisterRequest) -> UserResponse:
        """Register a new candidate, recruiter, employer, or admin user."""
        existing_user = await self.repo.get_by_email(data.email)
        if existing_user:
            raise UserAlreadyExistsException(data.email)

        hashed_pwd = hash_password(data.password)
        user = await self.repo.create_user(
            name=data.name,
            email=data.email,
            password_hash=hashed_pwd,
            role=data.role,
        )

        logger.info(f"User registered successfully: ID={user.id}, Role={user.role}")
        return UserResponse.model_validate(user)

    async def login(self, data: LoginRequest) -> TokenResponse:
        """Authenticate user credentials and issue Access & Refresh tokens."""
        user = await self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise InvalidCredentialsException()

        if user.status != UserStatus.ACTIVE.value:
            raise UserInactiveException(f"Account is currently {user.status}")

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

    async def get_me(self, user_id: int) -> UserResponse:
        """Fetch logged-in user profile details."""
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise UserNotFoundException(user_id)
        return UserResponse.model_validate(user)

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
