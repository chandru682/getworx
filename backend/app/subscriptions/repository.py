import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.subscriptions.models import (
    SubscriptionPlan,
    CompanySubscription,
    SubscriptionStatus,
    PaymentTransaction,
    PaymentStatus,
)


class SubscriptionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_plan_by_code(self, plan_code: str) -> Optional[SubscriptionPlan]:
        stmt = select(SubscriptionPlan).where(
            SubscriptionPlan.plan_code == plan_code.lower(),
            SubscriptionPlan.is_active.is_(True),
        )
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all_active_plans(self) -> List[SubscriptionPlan]:
        stmt = select(SubscriptionPlan).where(SubscriptionPlan.is_active.is_(True)).order_by(SubscriptionPlan.price_usd)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def seed_default_plans(self) -> None:
        """Seed Starter, Professional, and Enterprise plans if catalog is empty."""
        stmt = select(SubscriptionPlan)
        res = await self.session.execute(stmt)
        existing = res.scalars().all()
        if existing:
            return

        plans = [
            SubscriptionPlan(
                plan_code="starter",
                name="Starter Plan",
                description="Essential hiring toolset for growing startups & boutiques.",
                price_usd=199.00,
                price_inr=14999.00,
                duration_days=30,
                job_posting_limit=10,
                recruiter_limit=2,
                resume_views_limit=100,
                ai_credits=200,
                badge="Basic",
                features_json=json.dumps([
                    "10 Active Job Listings",
                    "2 Recruiter Seats",
                    "100 Candidate Resume Views",
                    "200 AI Hiring Credits",
                    "Standard ATS & Candidate Pipeline",
                    "Email Support",
                ]),
                is_active=True,
            ),
            SubscriptionPlan(
                plan_code="professional",
                name="Professional Plan",
                description="Complete recruitment suite for mid-sized growth companies.",
                price_usd=499.00,
                price_inr=39999.00,
                duration_days=30,
                job_posting_limit=100,
                recruiter_limit=10,
                resume_views_limit=1000,
                ai_credits=1000,
                badge="Most Popular",
                features_json=json.dumps([
                    "100 Active Job Listings",
                    "10 Recruiter Seats",
                    "1,000 Candidate Resume Views",
                    "1,000 AI Hiring Credits",
                    "AI Candidate Matching & Scoring",
                    "Global PPP Salary Calculator Access",
                    "Priority Email & Chat Support",
                ]),
                is_active=True,
            ),
            SubscriptionPlan(
                plan_code="enterprise",
                name="Enterprise Plan",
                description="Unlimited scale, dedicated account management & custom workflows.",
                price_usd=999.00,
                price_inr=79999.00,
                duration_days=365,
                job_posting_limit=-1,
                recruiter_limit=-1,
                resume_views_limit=10000,
                ai_credits=10000,
                badge="Best Value",
                features_json=json.dumps([
                    "Unlimited Job Listings",
                    "Unlimited Recruiter Seats",
                    "10,000 Candidate Resume Views",
                    "10,000 AI Hiring Credits",
                    "Dedicated Account Manager",
                    "Custom API & ATS Integrations",
                    "24/7 SLA Priority Support",
                ]),
                is_active=True,
            ),
        ]

        for plan in plans:
            self.session.add(plan)
        await self.session.commit()

    async def get_company_subscription(self, company_id: int) -> Optional[CompanySubscription]:
        """Fetch latest active or active-check subscription for company."""
        stmt = (
            select(CompanySubscription)
            .options(selectinload(CompanySubscription.plan))
            .where(CompanySubscription.company_id == company_id)
            .order_by(CompanySubscription.id.desc())
        )
        res = await self.session.execute(stmt)
        sub = res.scalar_one_or_none()

        if sub and sub.status == SubscriptionStatus.ACTIVE:
            now = datetime.now(timezone.utc)
            end = sub.end_date
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
            
            # Auto expire if end date passed
            if now > end:
                sub.status = SubscriptionStatus.EXPIRED
                self.session.add(sub)
                await self.session.flush()

        return sub

    async def create_subscription_and_payment(
        self,
        company_id: int,
        plan: SubscriptionPlan,
        payment_method: str = "Credit Card",
        currency: str = "USD",
    ) -> CompanySubscription:
        """Create active subscription and corresponding payment transaction record."""
        now = datetime.now(timezone.utc)
        end_date = now + timedelta(days=plan.duration_days)

        # Deactivate any previous subscriptions
        deactive_stmt = (
            update(CompanySubscription)
            .where(
                CompanySubscription.company_id == company_id,
                CompanySubscription.status == SubscriptionStatus.ACTIVE,
            )
            .values(status=SubscriptionStatus.CANCELLED)
        )
        await self.session.execute(deactive_stmt)

        tx_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        sub = CompanySubscription(
            company_id=company_id,
            plan_id=plan.id,
            status=SubscriptionStatus.ACTIVE,
            start_date=now,
            end_date=end_date,
            auto_renew=True,
            transaction_ref=tx_id,
        )
        self.session.add(sub)
        await self.session.flush()

        amount = plan.price_usd if currency.upper() == "USD" else plan.price_inr

        payment = PaymentTransaction(
            company_id=company_id,
            subscription_id=sub.id,
            plan_id=plan.id,
            amount=amount,
            currency=currency.upper(),
            payment_method=payment_method,
            payment_status=PaymentStatus.SUCCESS,
            transaction_id=tx_id,
        )
        self.session.add(payment)
        await self.session.commit()
        await self.session.refresh(sub)
        return sub
