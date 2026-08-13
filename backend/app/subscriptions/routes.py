from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import get_current_user, require_admin
from app.auth.models import User, UserRole
from app.schemas.health import ResponseEnvelope
from app.subscriptions.schemas import (
    SubscriptionPlanResponse,
    CompanySubscriptionResponse,
    SubscribePlanRequest,
    EmployerAccessStatusResponse,
    AdminSubscriptionsOverviewResponse,
    AdminSubscriptionItemResponse,
    AdminAssignPlanRequest,
    AdminRenewPlanRequest,
    AdminActionPlanRequest,
    SubscriptionHistoryItemResponse,
)
from app.subscriptions.service import SubscriptionService

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions & Payments"])


@router.get(
    "/plans",
    response_model=ResponseEnvelope[List[SubscriptionPlanResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Available Subscription Plans",
    description="Returns list of active subscription plans (Starter, Professional, Enterprise) with features & pricing.",
)
async def get_plans(db: AsyncSession = Depends(get_db)):
    service = SubscriptionService(db)
    plans = await service.get_available_plans()
    return ResponseEnvelope(
        success=True,
        message="Subscription plans retrieved successfully",
        data=plans,
    )


@router.get(
    "/access-check",
    response_model=ResponseEnvelope[EmployerAccessStatusResponse],
    status_code=status.HTTP_200_OK,
    summary="Verify Employer Onboarding & Dashboard Access Control Status",
    description="Evaluates Company Status == APPROVED, must_change_password == FALSE, and Subscription Status == ACTIVE.",
)
async def check_access(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    access_status = await service.get_employer_access_status(current_user)
    return ResponseEnvelope(
        success=True,
        message="Employer access control status retrieved successfully",
        data=access_status,
    )


@router.post(
    "/subscribe",
    response_model=ResponseEnvelope[EmployerAccessStatusResponse],
    status_code=status.HTTP_200_OK,
    summary="Select Subscription Plan & Activate via Payment",
    description="Subscribes the user's company to the selected plan and activates subscription status.",
)
async def subscribe_plan(
    data: SubscribePlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only Employers and Platform Admins can purchase subscription plans.",
        )

    service = SubscriptionService(db)
    result = await service.subscribe_company(current_user, data)
    return ResponseEnvelope(
        success=True,
        message="Subscription activated successfully",
        data=result,
    )


@router.get(
    "/admin/all",
    response_model=ResponseEnvelope[AdminSubscriptionsOverviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Platform Admin Subscriptions Directory & Metrics Overview",
)
async def get_admin_subscriptions_all(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    data = await service.get_admin_subscriptions_overview()
    return ResponseEnvelope(
        success=True,
        message="Platform subscriptions overview retrieved successfully",
        data=data,
    )


@router.post(
    "/admin/assign",
    response_model=ResponseEnvelope[CompanySubscriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="Assign, Upgrade, or Downgrade Subscription Plan for a Company",
)
async def admin_assign_plan(
    req: AdminAssignPlanRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    sub = await service.admin_assign_plan(req.company_id, req.plan_code, current_user, req.notes)
    return ResponseEnvelope(
        success=True,
        message=f"Successfully assigned {req.plan_code.upper()} plan to company.",
        data=sub,
    )


@router.post(
    "/admin/renew",
    response_model=ResponseEnvelope[CompanySubscriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="Renew Subscription for a Company",
)
async def admin_renew_plan(
    req: AdminRenewPlanRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    sub = await service.admin_renew_plan(req.company_id, req.days, current_user, req.notes)
    return ResponseEnvelope(
        success=True,
        message=f"Subscription renewed for {req.days} days successfully.",
        data=sub,
    )


@router.post(
    "/admin/suspend",
    response_model=ResponseEnvelope[CompanySubscriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="Suspend Subscription for a Company",
)
async def admin_suspend_plan(
    req: AdminActionPlanRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    sub = await service.admin_suspend_plan(req.company_id, current_user, req.reason)
    return ResponseEnvelope(
        success=True,
        message="Subscription suspended successfully.",
        data=sub,
    )


@router.post(
    "/admin/cancel",
    response_model=ResponseEnvelope[CompanySubscriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="Cancel Subscription for a Company",
)
async def admin_cancel_plan(
    req: AdminActionPlanRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    sub = await service.admin_cancel_plan(req.company_id, current_user, req.reason)
    return ResponseEnvelope(
        success=True,
        message="Subscription cancelled successfully.",
        data=sub,
    )


@router.get(
    "/admin/history/{company_id}",
    response_model=ResponseEnvelope[List[SubscriptionHistoryItemResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Subscription History Audit Log for a Company",
)
async def get_admin_subscription_history(
    company_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = SubscriptionService(db)
    history = await service.get_subscription_history(company_id)
    return ResponseEnvelope(
        success=True,
        message="Subscription history log retrieved successfully.",
        data=history,
    )

