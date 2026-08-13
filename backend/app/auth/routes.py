from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_auth_service, get_current_user
from app.auth.models import User
from app.auth.schemas import (
    AuthMeResponse,
    ChangePasswordRequest,
    FirstLoginChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.auth.service import AuthService
from app.schemas.health import ResponseEnvelope

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=ResponseEnvelope[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new User",
    description="Registers a new candidate, recruiter, employer, or admin user into the GetWorxs platform.",
)
async def register(
    data: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
):
    user = await service.register(data)
    return ResponseEnvelope(
        success=True,
        message="User registered successfully",
        data=user,
    )


@router.post(
    "/login",
    response_model=ResponseEnvelope[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Login and obtain JWT Tokens",
    description="Authenticates user credentials and returns JWT Access Token and Refresh Token.",
)
async def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service),
):
    tokens = await service.login(data)
    return ResponseEnvelope(
        success=True,
        message="Authentication successful",
        data=tokens,
    )


@router.post(
    "/refresh",
    response_model=ResponseEnvelope[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh Access Token",
    description="Generates a new JWT Access Token and rotated Refresh Token using a valid Refresh Token.",
)
async def refresh_token(
    data: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service),
):
    tokens = await service.refresh_token(data.refresh_token)
    return ResponseEnvelope(
        success=True,
        message="Token refreshed successfully",
        data=tokens,
    )


@router.post(
    "/logout",
    response_model=ResponseEnvelope[MessageResponse],
    status_code=status.HTTP_200_OK,
    summary="Logout User",
    description="Invalidates the provided refresh token and ends the active session.",
)
async def logout(
    data: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service),
):
    await service.logout(data.refresh_token)
    return ResponseEnvelope(
        success=True,
        message="User logged out successfully",
        data=MessageResponse(message="Logged out successfully"),
    )


@router.get(
    "/me",
    response_model=ResponseEnvelope[AuthMeResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Retrieves profile information for the authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    profile = await service.get_me(current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Profile retrieved successfully",
        data=profile,
    )


@router.post(
    "/forgot-password",
    response_model=ResponseEnvelope[MessageResponse],
    status_code=status.HTTP_200_OK,
    summary="Request Password Reset Link",
    description="Generates a secure password reset token for the specified email.",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    res = await service.forgot_password(data.email)
    return ResponseEnvelope(
        success=True,
        message=res["message"],
        data=MessageResponse(message=res["message"]),
    )


@router.post(
    "/reset-password",
    response_model=ResponseEnvelope[MessageResponse],
    status_code=status.HTTP_200_OK,
    summary="Reset Password with Token",
    description="Validates the reset token and updates the user's password.",
)
async def reset_password(
    data: ResetPasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    res = await service.reset_password(data)
    return ResponseEnvelope(
        success=True,
        message=res["message"],
        data=MessageResponse(message=res["message"]),
    )


@router.post(
    "/change-password",
    response_model=ResponseEnvelope[MessageResponse],
    status_code=status.HTTP_200_OK,
    summary="Change Password",
    description="Changes password for current logged-in user after verifying existing password.",
)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    res = await service.change_password(current_user.id, data)
    return ResponseEnvelope(
        success=True,
        message=res["message"],
        data=MessageResponse(message=res["message"]),
    )


@router.post(
    "/first-login-change-password",
    response_model=ResponseEnvelope[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="First Login Password Change",
    description="Updates password during first login for users with a temporary password and issues JWT access tokens.",
)
async def first_login_change_password(
    data: FirstLoginChangePasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    tokens = await service.first_login_change_password(data)
    return ResponseEnvelope(
        success=True,
        message="Password updated successfully. Access granted.",
        data=tokens,
    )


@router.get(
    "/candidates",
    response_model=ResponseEnvelope[list[UserResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get All Candidates",
    description="Retrieves list of registered jobseekers/candidates for Admin Console.",
)
async def get_candidates(
    service: AuthService = Depends(get_auth_service),
):
    candidates = await service.get_all_candidates()
    return ResponseEnvelope(
        success=True,
        message="Candidates retrieved successfully",
        data=candidates,
    )


