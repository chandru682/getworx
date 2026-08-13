"""Super Admin Financial Payments & Invoices Router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.models import User
from app.auth.dependencies import get_current_user_optional, require_admin
from app.schemas.health import ResponseEnvelope
from app.admin.schemas import ReportGenerateRequest
from app.admin.payment_service import AdminPaymentService

payment_router = APIRouter(prefix="/payments", tags=["Super Admin Payments"])
invoice_router = APIRouter(prefix="/invoices", tags=["Super Admin Invoices"])


# ── 1. FINANCIAL OVERVIEW KPIS ──
@payment_router.get(
    "/overview",
    summary="GET /api/v1/admin/payments/overview - Financial KPI Cards (Revenue, MRR, Pending, Refunds)",
)
async def get_payments_overview(
    date_range: str = Query("30d"),
    company_id: Optional[int] = Query(None),
    plan_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    kpis = await service.get_financial_kpis(date_range=date_range, company_id=company_id, plan_id=plan_id, status=status)
    return ResponseEnvelope(success=True, message="Financial KPIs retrieved successfully.", data=kpis)


# ── 2. REVENUE TREND ──
@payment_router.get(
    "/revenue-trend",
    summary="GET /api/v1/admin/payments/revenue-trend - Financial revenue trend time-series",
)
async def get_revenue_trend(
    date_range: str = Query("30d"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    trend = await service.get_revenue_trend(date_range=date_range)
    return ResponseEnvelope(success=True, message="Revenue trend retrieved successfully.", data=trend)


# ── 3. REVENUE BY SUBSCRIPTION PLAN ──
@payment_router.get(
    "/by-plan",
    summary="GET /api/v1/admin/payments/by-plan - Revenue breakdown by plan (Starter, Pro, Enterprise)",
)
async def get_revenue_by_plan(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    by_plan = await service.get_revenue_by_plan()
    return ResponseEnvelope(success=True, message="Revenue by plan breakdown retrieved successfully.", data=by_plan)


# ── 4. PAYMENT HEALTH ──
@payment_router.get(
    "/payment-health",
    summary="GET /api/v1/admin/payments/payment-health - Transaction status summary (Paid, Pending, Failed, Refunded)",
)
async def get_payment_health(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    health = await service.get_payment_health()
    return ResponseEnvelope(success=True, message="Payment health retrieved successfully.", data=health)


# ── 5. SUBSCRIPTION OVERVIEW ──
@payment_router.get(
    "/subscription-overview",
    summary="GET /api/v1/admin/payments/subscription-overview - Subscription status summary",
)
async def get_subscription_overview(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    sub_overview = await service.get_subscription_overview()
    return ResponseEnvelope(success=True, message="Subscription overview retrieved successfully.", data=sub_overview)


# ── 6. TOP PAYING COMPANIES ──
@payment_router.get(
    "/top-companies",
    summary="GET /api/v1/admin/payments/top-companies - Top companies ranked by revenue",
)
async def get_top_companies(
    limit: int = Query(5, ge=1, le=20),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    top_comps = await service.get_top_paying_companies(limit=limit)
    return ResponseEnvelope(success=True, message="Top paying companies retrieved successfully.", data=top_comps)


# ── 7. RECENT TRANSACTIONS TABLE ──
@payment_router.get(
    "/transactions",
    summary="GET /api/v1/admin/payments/transactions - Paginated transaction ledger",
)
async def get_transactions(
    search: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    plan_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    items, total = await service.get_transactions(search=search, company_id=company_id, plan_id=plan_id, status=status, page=page, limit=limit)
    return ResponseEnvelope(success=True, message="Transactions retrieved successfully.", data={"items": items, "total": total, "page": page, "limit": limit})


# ── 8. INVOICE DETAILS MODAL ──
@invoice_router.get(
    "/{payment_id}",
    summary="GET /api/v1/admin/invoices/{payment_id} - Itemized invoice breakdown with tax calculation",
)
async def get_invoice_detail(
    payment_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminPaymentService(session)
    invoice = await service.get_invoice_details(payment_id)
    return ResponseEnvelope(success=True, message="Invoice details retrieved successfully.", data=invoice)
