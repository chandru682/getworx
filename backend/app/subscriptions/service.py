import json
import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.companies.models import Company, CompanyStatus
from app.subscriptions.models import SubscriptionPlan, CompanySubscription, SubscriptionStatus
from app.subscriptions.repository import SubscriptionRepository
from app.subscriptions.schemas import (
    SubscriptionPlanResponse,
    CompanySubscriptionResponse,
    SubscribePlanRequest,
    EmployerAccessStatusResponse,
)

logger = logging.getLogger(__name__)


class SubscriptionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = SubscriptionRepository(session)

    async def get_available_plans(self) -> List[SubscriptionPlanResponse]:
        """Fetch active plans and parse feature JSON strings."""
        await self.repo.seed_default_plans()
        plans = await self.repo.get_all_active_plans()
        res = []
        for p in plans:
            try:
                feats = json.loads(p.features_json)
            except Exception:
                feats = []
            res.append(
                SubscriptionPlanResponse(
                    id=p.id,
                    plan_code=p.plan_code,
                    name=p.name,
                    description=p.description,
                    price_usd=float(p.price_usd),
                    price_inr=float(p.price_inr),
                    duration_days=p.duration_days,
                    job_posting_limit=p.job_posting_limit,
                    recruiter_limit=p.recruiter_limit,
                    resume_views_limit=p.resume_views_limit,
                    ai_credits=p.ai_credits,
                    features=feats,
                    badge=p.badge,
                    is_active=p.is_active,
                )
            )
        return res

    async def get_company_by_id_or_user(self, user: User) -> Optional[Company]:
        """Find company associated with user - with direct profile DB fallback for async safety."""
        from app.auth.models import UserRole

        # Primary: try virtual property (works when profile is loaded in current session)
        try:
            virtual_company_id = user.company_id
        except Exception:
            virtual_company_id = None

        if virtual_company_id:
            stmt = select(Company).where(Company.id == virtual_company_id)
            res = await self.session.execute(stmt)
            c = res.scalar_one_or_none()
            if c:
                return c

        # Direct DB query for Recruiter profile company_id (bypasses async lazy-load issue)
        if user.role == UserRole.RECRUITER:
            from app.recruiters.models import RecruiterProfile
            stmt = select(RecruiterProfile).where(RecruiterProfile.user_id == user.id)
            res = await self.session.execute(stmt)
            profile = res.scalar_one_or_none()
            if profile and profile.company_id:
                stmt = select(Company).where(Company.id == profile.company_id)
                res = await self.session.execute(stmt)
                c = res.scalar_one_or_none()
                if c:
                    return c
            if profile and profile.company_name:
                stmt = select(Company).where(Company.name == profile.company_name)
                res = await self.session.execute(stmt)
                c = res.scalars().first()
                if c:
                    return c

        # Direct DB query for Employer profile company_id
        if user.role == UserRole.EMPLOYER:
            from app.employers.models import EmployerProfile
            stmt = select(EmployerProfile).where(EmployerProfile.user_id == user.id)
            res = await self.session.execute(stmt)
            profile = res.scalar_one_or_none()
            if profile and profile.company_id:
                stmt = select(Company).where(Company.id == profile.company_id)
                res = await self.session.execute(stmt)
                c = res.scalar_one_or_none()
                if c:
                    return c

        try:
            virtual_company_name = user.company_name
        except Exception:
            virtual_company_name = None

        if virtual_company_name:
            stmt = select(Company).where(Company.name == virtual_company_name)
            res = await self.session.execute(stmt)
            c = res.scalars().first()
            if c:
                return c

        # Fallback 1: Find company created by this user
        stmt = select(Company).where(Company.created_by_id == user.id)
        res = await self.session.execute(stmt)
        c = res.scalars().first()
        if c:
            return c

        # Fallback 2: Find company registered with user's email
        stmt = select(Company).where(Company.email == user.email.lower())
        res = await self.session.execute(stmt)
        c = res.scalars().first()
        if c:
            return c

        return None


    async def get_employer_access_status(self, user: User) -> EmployerAccessStatusResponse:
        """Validate the 3 mandatory conditions for Employer Dashboard & Feature Access.
        
        1. Company Status = APPROVED (or active / verified)
        2. must_change_password = FALSE
        3. Subscription Status = ACTIVE
        """
        company = await self.get_company_by_id_or_user(user)

        company_id = company.id if company else user.company_id
        company_name = company.name if company else user.company_name
        company_status = (
            company.approval_status.lower()
            if company
            else (CompanyStatus.PENDING_VERIFICATION.value)
        )

        sub: Optional[CompanySubscription] = None
        sub_status_str = "NONE"

        if company_id:
            sub = await self.repo.get_company_subscription(company_id)
            if sub:
                sub_status_str = sub.status.value.upper()

        must_change_password = getattr(user, "must_change_password", False)

        # Check conditions
        is_company_approved = company_status in ["approved", "active"] or (
            company and company.is_verified
        )
        is_password_valid = not must_change_password
        is_subscription_active = sub_status_str == "ACTIVE"

        is_dashboard_unlocked = (
            is_company_approved and is_password_valid and is_subscription_active
        )

        all_features = [
            "create_job",
            "publish_job",
            "recruiter_management",
            "resume_search",
            "candidate_unlock",
            "ai_hiring_features",
        ]

        allowed_features = all_features if is_dashboard_unlocked else []

        # Messaging logic
        if must_change_password:
            msg = "Mandatory password change required before accessing GetWorxs platform."
        elif not is_company_approved:
            msg = "Your company registration is pending Platform Admin approval."
        elif sub_status_str == "EXPIRED":
            msg = "Your subscription has expired. Renew your subscription to continue hiring."
        elif sub_status_str in ["NONE", "PENDING", "CANCELLED"]:
            msg = "Your subscription is inactive. Please choose a subscription plan to continue using GetWorxs."
        else:
            msg = "Employer Dashboard & Hiring Suite unlocked successfully."

        sub_resp = None
        if sub:
            plan_resp = None
            if sub.plan:
                try:
                    feats = json.loads(sub.plan.features_json)
                except Exception:
                    feats = []
                plan_resp = SubscriptionPlanResponse(
                    id=sub.plan.id,
                    plan_code=sub.plan.plan_code,
                    name=sub.plan.name,
                    description=sub.plan.description,
                    price_usd=float(sub.plan.price_usd),
                    price_inr=float(sub.plan.price_inr),
                    duration_days=sub.plan.duration_days,
                    job_posting_limit=sub.plan.job_posting_limit,
                    recruiter_limit=sub.plan.recruiter_limit,
                    resume_views_limit=sub.plan.resume_views_limit,
                    ai_credits=sub.plan.ai_credits,
                    features=feats,
                    badge=sub.plan.badge,
                    is_active=sub.plan.is_active,
                )

            # Compute live values
            from sqlalchemy import func
            from app.jobs.models import Job, JobStatus
            job_cnt_stmt = select(func.count(Job.id)).where(
                Job.company_id == sub.company_id,
                Job.status == JobStatus.ACTIVE.value
            )
            jobs_used = (await self.session.execute(job_cnt_stmt)).scalar() or 0

            from app.recruiters.models import RecruiterProfile
            rec_cnt_stmt = select(func.count(RecruiterProfile.id)).where(
                (RecruiterProfile.company_id == sub.company_id) |
                (RecruiterProfile.company_name == company_name)
            )
            recruiters_used = (await self.session.execute(rec_cnt_stmt)).scalar() or 0

            sub_resp = CompanySubscriptionResponse(
                id=sub.id,
                company_id=sub.company_id,
                plan_id=sub.plan_id,
                status=sub.status.value,
                start_date=sub.start_date,
                end_date=sub.end_date,
                auto_renew=sub.auto_renew,
                jobs_posted_count=jobs_used,
                recruiters_count=recruiters_used,
                resume_views_count=sub.resume_views_count,
                ai_credits_used=sub.ai_credits_used,
                transaction_ref=sub.transaction_ref,
                plan=plan_resp,
            )

        return EmployerAccessStatusResponse(
            user_id=user.id,
            email=user.email,
            company_id=company_id,
            company_name=company_name,
            company_status=company_status,
            must_change_password=must_change_password,
            last_password_changed_at=user.last_password_changed_at,
            subscription_status=sub_status_str,
            is_dashboard_unlocked=is_dashboard_unlocked,
            message=msg,
            active_subscription=sub_resp,
            allowed_features=allowed_features,
        )

    async def subscribe_company(
        self, user: User, req: SubscribePlanRequest
    ) -> EmployerAccessStatusResponse:
        """Select a plan & process payment activation."""
        company = await self.get_company_by_id_or_user(user)
        if not company:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Associated company account not found.")

        plan = await self.repo.get_plan_by_code(req.plan_code)
        if not plan:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400, detail=f"Subscription plan '{req.plan_code}' not found."
            )

        await self.repo.create_subscription_and_payment(
            company_id=company.id,
            plan=plan,
            payment_method=req.payment_method,
            currency=req.currency,
        )

        logger.info(
            f"Activated plan {plan.plan_code} for Company ID={company.id} by User ID={user.id}"
        )
        return await self.get_employer_access_status(user)

    async def get_admin_subscriptions_overview(self) -> AdminSubscriptionsOverviewResponse:
        """Fetch all platform company subscriptions with metrics overview & live limits/usage."""
        from app.companies.models import Company
        from app.subscriptions.models import SubscriptionHistory, PaymentTransaction, PaymentStatus
        from app.subscriptions.schemas import AdminSubscriptionItemResponse, AdminSubscriptionsOverviewResponse
        from datetime import datetime, timezone
        from sqlalchemy import func

        stmt = select(Company).where(Company.approval_status == CompanyStatus.APPROVED.value)
        res = await self.session.execute(stmt)
        companies = list(res.scalars().all())

        sub_items: List[AdminSubscriptionItemResponse] = []
        active_cnt = 0
        trial_cnt = 0
        expiring_7_cnt = 0
        expired_cnt = 0
        monthly_rev = 0.0

        now = datetime.now(timezone.utc)

        for c in companies:
            sub = await self.repo.get_company_subscription(c.id)
            if not sub:
                continue

            end_dt = sub.end_date
            if end_dt.tzinfo is None:
                end_dt = end_dt.replace(tzinfo=timezone.utc)
            rem_days = max(0, (end_dt - now).days)

            st_val = sub.status.value.capitalize()
            if sub.status == SubscriptionStatus.ACTIVE:
                active_cnt += 1
                if rem_days <= 7:
                    expiring_7_cnt += 1
                if sub.plan:
                    monthly_rev += float(sub.plan.price_inr)
            elif sub.status == SubscriptionStatus.EXPIRED:
                expired_cnt += 1
            elif sub.status.value.lower() == "trial":
                trial_cnt += 1

            emp_stmt = select(User).where(User.id == c.created_by_id)
            emp_user = (await self.session.execute(emp_stmt)).scalar_one_or_none()
            if not emp_user:
                emp_stmt = select(User).where(User.email == c.email.lower())
                emp_user = (await self.session.execute(emp_stmt)).scalar_one_or_none()

            employer_name = emp_user.name if emp_user else (getattr(c, 'primary_contact_name', None) or c.name)
            employer_email = emp_user.email if emp_user else c.email

            from app.jobs.models import Job, JobStatus
            job_cnt_stmt = select(func.count(Job.id)).where(Job.company_id == c.id, Job.status == JobStatus.ACTIVE.value)
            jobs_used = (await self.session.execute(job_cnt_stmt)).scalar() or sub.jobs_posted_count

            from app.recruiters.models import RecruiterProfile
            rec_cnt_stmt = select(func.count(RecruiterProfile.id)).where(
                (RecruiterProfile.company_id == c.id) |
                (RecruiterProfile.company_name == c.name)
            )
            recruiters_used = (await self.session.execute(rec_cnt_stmt)).scalar() or sub.recruiters_count

            pay_stmt = select(PaymentTransaction).where(PaymentTransaction.company_id == c.id).order_by(PaymentTransaction.id.desc())
            pay_tx = (await self.session.execute(pay_stmt)).scalar_one_or_none()
            pay_status = pay_tx.payment_status.value.capitalize() if pay_tx else "Success"
            pay_date = pay_tx.created_at if pay_tx and hasattr(pay_tx, "created_at") else sub.start_date
            pay_amount = float(pay_tx.amount) if pay_tx else (float(sub.plan.price_inr) if sub.plan else 0.0)

            sub_items.append(
                AdminSubscriptionItemResponse(
                    subscription_id=sub.id,
                    company_id=c.id,
                    company_name=c.name,
                    employer_name=employer_name,
                    employer_email=employer_email,
                    plan_code=sub.plan.plan_code if sub.plan else "starter",
                    plan_name=sub.plan.name if sub.plan else "Starter Plan",
                    status=st_val,
                    start_date=sub.start_date,
                    end_date=sub.end_date,
                    remaining_days=rem_days,
                    jobs_used=jobs_used,
                    job_limit=sub.plan.job_posting_limit if sub.plan else 10,
                    recruiters_used=recruiters_used,
                    recruiter_limit=sub.plan.recruiter_limit if sub.plan else 2,
                    ai_credits_used=sub.ai_credits_used,
                    ai_credits_limit=sub.plan.ai_credits if sub.plan else 200,
                    payment_status=pay_status,
                    last_payment_date=pay_date,
                    last_payment_amount=pay_amount
                )
            )

        return AdminSubscriptionsOverviewResponse(
            active_subscriptions=active_cnt,
            trial_companies=trial_cnt,
            expiring_7_days=expiring_7_cnt,
            expired_subscriptions=expired_cnt,
            monthly_revenue=monthly_rev,
            subscriptions=sub_items
        )

    async def admin_assign_plan(self, company_id: int, plan_code: str, admin_user: User, notes: Optional[str] = None) -> CompanySubscription:
        plan = await self.repo.get_plan_by_code(plan_code)
        if not plan:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Plan '{plan_code}' not found.")

        old_sub = await self.repo.get_company_subscription(company_id)
        old_plan_code = old_sub.plan.plan_code if (old_sub and old_sub.plan) else "none"

        new_sub = await self.repo.create_subscription_and_payment(
            company_id=company_id,
            plan=plan,
            payment_method="Admin Provisioned",
            currency="USD"
        )

        from app.subscriptions.models import SubscriptionHistory
        hist = SubscriptionHistory(
            company_id=company_id,
            subscription_id=new_sub.id,
            action="ASSIGN/UPGRADE",
            previous_plan_code=old_plan_code,
            new_plan_code=plan.plan_code,
            performed_by_id=admin_user.id,
            notes=notes or f"Plan changed to {plan.name} by Platform Admin."
        )
        self.session.add(hist)
        await self.session.commit()
        return new_sub

    async def admin_renew_plan(self, company_id: int, days: int, admin_user: User, notes: Optional[str] = None) -> CompanySubscription:
        sub = await self.repo.get_company_subscription(company_id)
        if not sub:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Company subscription not found.")

        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        base_date = sub.end_date if sub.end_date.replace(tzinfo=timezone.utc) > now else now
        sub.end_date = base_date + timedelta(days=days)
        sub.status = SubscriptionStatus.ACTIVE
        self.session.add(sub)

        from app.subscriptions.models import SubscriptionHistory
        hist = SubscriptionHistory(
            company_id=company_id,
            subscription_id=sub.id,
            action="RENEW",
            previous_plan_code=sub.plan.plan_code if sub.plan else "unknown",
            new_plan_code=sub.plan.plan_code if sub.plan else "unknown",
            performed_by_id=admin_user.id,
            notes=notes or f"Subscription renewed for {days} days by Platform Admin."
        )
        self.session.add(hist)
        await self.session.commit()
        return sub

    async def admin_suspend_plan(self, company_id: int, admin_user: User, reason: Optional[str] = None) -> CompanySubscription:
        sub = await self.repo.get_company_subscription(company_id)
        if not sub:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Company subscription not found.")

        sub.status = SubscriptionStatus.CANCELLED
        self.session.add(sub)

        from app.subscriptions.models import SubscriptionHistory
        hist = SubscriptionHistory(
            company_id=company_id,
            subscription_id=sub.id,
            action="SUSPEND",
            previous_plan_code=sub.plan.plan_code if sub.plan else "unknown",
            new_plan_code=sub.plan.plan_code if sub.plan else "unknown",
            performed_by_id=admin_user.id,
            notes=reason or "Subscription suspended by Platform Admin."
        )
        self.session.add(hist)
        await self.session.commit()
        return sub

    async def admin_cancel_plan(self, company_id: int, admin_user: User, reason: Optional[str] = None) -> CompanySubscription:
        sub = await self.repo.get_company_subscription(company_id)
        if not sub:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Company subscription not found.")

        sub.status = SubscriptionStatus.CANCELLED
        self.session.add(sub)

        from app.subscriptions.models import SubscriptionHistory
        hist = SubscriptionHistory(
            company_id=company_id,
            subscription_id=sub.id,
            action="CANCEL",
            previous_plan_code=sub.plan.plan_code if sub.plan else "unknown",
            new_plan_code=sub.plan.plan_code if sub.plan else "unknown",
            performed_by_id=admin_user.id,
            notes=reason or "Subscription cancelled by Platform Admin."
        )
        self.session.add(hist)
        await self.session.commit()
        return sub

    async def get_subscription_history(self, company_id: int) -> List[SubscriptionHistoryItemResponse]:
        from app.subscriptions.models import SubscriptionHistory
        from app.subscriptions.schemas import SubscriptionHistoryItemResponse
        stmt = select(SubscriptionHistory).where(SubscriptionHistory.company_id == company_id).order_by(SubscriptionHistory.id.desc())
        res = await self.session.execute(stmt)
        items = list(res.scalars().all())

        out = []
        for h in items:
            performed_by = "Platform Admin"
            if h.performed_by_id:
                u_res = await self.session.execute(select(User).where(User.id == h.performed_by_id))
                u = u_res.scalar_one_or_none()
                if u:
                    performed_by = u.name or u.email

            out.append(
                SubscriptionHistoryItemResponse(
                    id=h.id,
                    company_id=h.company_id,
                    subscription_id=h.subscription_id,
                    action=h.action,
                    previous_plan_code=h.previous_plan_code,
                    new_plan_code=h.new_plan_code,
                    performed_by=performed_by,
                    notes=h.notes,
                    created_at=h.created_at
                )
            )
        return out
