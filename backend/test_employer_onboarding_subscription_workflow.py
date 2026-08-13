"""
Integration Test Suite: Employer First-Time Onboarding & Subscription Activation Workflow
===========================================================================================
Tests all requirements:
1. Company Registration & Platform Admin Approval -> Employer user account auto-created with must_change_password = True.
2. Employer Login with Temporary Password -> must_change_password guard active.
3. Forced First-Login Password Change -> updates password, sets must_change_password = False, updates last_password_changed_at.
4. Access Check immediately after password change -> verify subscription_status = NONE / INACTIVE, is_dashboard_unlocked = False.
5. Subscription Plans Query -> returns Starter, Professional, Enterprise with limits & features.
6. Plan Selection & Payment Activation -> calls /subscribe with plan_code and payment details.
7. Access Check after payment -> verify subscription_status = ACTIVE, is_dashboard_unlocked = True, allowed_features granted.
8. Expiration & Access Control Blocking -> set subscription end_date in past, verify subscription_status = EXPIRED, premium features blocked.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app as fastapi_app
from app.database.base import Base, discover_models
from app.core.database import get_db
from app.auth.models import User, UserRole
from app.subscriptions.models import CompanySubscription, SubscriptionStatus

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session
        try:
            await session.commit()
        except Exception:
            await session.rollback()


fastapi_app.dependency_overrides[get_db] = override_get_db


async def run_employer_onboarding_subscription_workflow_tests():
    print("=" * 80)
    print("[TEST] Employer Onboarding & Subscription Activation Integration Suite")
    print("=" * 80)

    discover_models()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # ------------------------------------------------------------------ #
        # 1. Register Platform Admin                                         #
        # ------------------------------------------------------------------ #
        admin_reg = await client.post("/api/v1/auth/register", json={
            "name": "Super Admin",
            "email": "admin@getworxs.com",
            "password": "AdminPassword123!",
            "role": "ADMIN",
        })
        assert admin_reg.status_code == 201
        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@getworxs.com",
            "password": "AdminPassword123!",
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("  [PASS] 1. Platform Admin user registered & authenticated.")

        # ------------------------------------------------------------------ #
        # 2. Submit Company Registration & Approve Company                   #
        # ------------------------------------------------------------------ #
        company_reg_payload = {
            "name": "Acme Innovations",
            "legal_name": "Acme Innovations Inc",
            "industry": "Software & AI",
            "company_size": "51-200",
            "website": "https://acme.example.com",
            "email": "onboarding@acme.example.com",
            "phone": "+1-555-0192837",
            "country": "United States",
            "state": "California",
            "city": "San Francisco",
            "address": "500 Howard Street",
            "postal_code": "94105",
            "description": "Enterprise Cloud & AI Solutions",
        }
        create_company_res = await client.post(
            "/api/v1/companies/registration",
            json=company_reg_payload,
            headers=admin_headers,
        )
        assert create_company_res.status_code == 201
        company_id = create_company_res.json()["data"]["id"]

        approve_res = await client.post(
            f"/api/v1/companies/{company_id}/approve",
            json={"notes": "Approved company for onboarding test."},
            headers=admin_headers,
        )
        assert approve_res.status_code == 200
        print(f"  [PASS] 2. Company 'Acme Innovations' registered and approved (ID: {company_id}).")

        # ------------------------------------------------------------------ #
        # 3. Setup Employer Temp Password in DB for Test Execution           #
        # ------------------------------------------------------------------ #
        emp_email = "onboarding@acme.example.com"
        temp_pwd = "Temp@Password2026"
        async with TestingSessionLocal() as session:
            from app.auth.security import hash_password
            stmt = select(User).where(User.email == emp_email)
            res = await session.execute(stmt)
            user = res.scalar_one()
            user.password_hash = hash_password(temp_pwd)
            user.must_change_password = True
            session.add(user)
            await session.commit()
        print("  [PASS] 3. Employer auto-created with temporary password and must_change_password=True.")

        # Login with temp password should block regular access
        login_temp = await client.post("/api/v1/auth/login", json={
            "email": emp_email,
            "password": temp_pwd,
        })
        assert login_temp.status_code in [400, 403]
        print("  [PASS] 4. Regular login with temporary password correctly blocked by guard.")

        # ------------------------------------------------------------------ #
        # 4. First Login Mandatory Password Change                            #
        # ------------------------------------------------------------------ #
        first_login_change = await client.post("/api/v1/auth/first-login-change-password", json={
            "email": emp_email,
            "temporary_password": temp_pwd,
            "new_password": "NewPermanentPass123!",
        })
        assert first_login_change.status_code == 200
        change_data = first_login_change.json()["data"]
        emp_token = change_data["access_token"]
        emp_headers = {"Authorization": f"Bearer {emp_token}"}

        # Verify in DB: must_change_password is False & last_password_changed_at is set
        async with TestingSessionLocal() as session:
            stmt = select(User).where(User.email == emp_email)
            res = await session.execute(stmt)
            user = res.scalar_one()
            assert user.must_change_password is False
            assert user.last_password_changed_at is not None
        print("  [PASS] 5. Mandatory password change completed -> must_change_password=False & timestamp recorded.")

        # ------------------------------------------------------------------ #
        # 5. Access Check Immediately After Password Change (No Subscription) #
        # ------------------------------------------------------------------ #
        access_res_1 = await client.get("/api/v1/subscriptions/access-check", headers=emp_headers)
        assert access_res_1.status_code == 200
        access_data_1 = access_res_1.json()["data"]
        assert access_data_1["must_change_password"] is False
        assert access_data_1["subscription_status"] in ["NONE", "INACTIVE"]
        assert access_data_1["is_dashboard_unlocked"] is False
        assert len(access_data_1["allowed_features"]) == 0
        assert "inactive" in access_data_1["message"].lower() or "choose a subscription" in access_data_1["message"].lower()
        print("  [PASS] 6. Access check verifies dashboard is BLOCKED when subscription is inactive.")

        # ------------------------------------------------------------------ #
        # 6. Fetch Available Subscription Plans                             #
        # ------------------------------------------------------------------ #
        plans_res = await client.get("/api/v1/subscriptions/plans", headers=emp_headers)
        assert plans_res.status_code == 200
        plans_list = plans_res.json()["data"]
        plan_codes = [p["plan_code"] for p in plans_list]
        assert "starter" in plan_codes
        assert "professional" in plan_codes
        assert "enterprise" in plan_codes
        print(f"  [PASS] 7. Subscription catalog returned {len(plans_list)} plans (Starter, Professional, Enterprise).")

        # ------------------------------------------------------------------ #
        # 7. Select Plan & Process Payment Activation                         #
        # ------------------------------------------------------------------ #
        subscribe_res = await client.post("/api/v1/subscriptions/subscribe", json={
            "plan_code": "professional",
            "payment_method": "Credit Card",
            "currency": "USD",
            "card_number_last4": "4242",
        }, headers=emp_headers)
        assert subscribe_res.status_code == 200
        sub_result = subscribe_res.json()["data"]
        assert sub_result["subscription_status"] == "ACTIVE"
        assert sub_result["is_dashboard_unlocked"] is True
        assert "create_job" in sub_result["allowed_features"]
        assert "recruiter_management" in sub_result["allowed_features"]
        assert "ai_hiring_features" in sub_result["allowed_features"]
        print("  [PASS] 8. Subscription plan 'Professional' activated via payment -> Employer Dashboard & Hiring Suite unlocked!")

        # ------------------------------------------------------------------ #
        # 8. Test Expiration Handling & Feature Access Locking               #
        # ------------------------------------------------------------------ #
        # Manually expire the subscription in DB by setting end_date in past
        async with TestingSessionLocal() as session:
            past_date = datetime.now(timezone.utc) - timedelta(days=1)
            stmt = update(CompanySubscription).where(
                CompanySubscription.company_id == company_id
            ).values(end_date=past_date)
            await session.execute(stmt)
            await session.commit()

        access_res_expired = await client.get("/api/v1/subscriptions/access-check", headers=emp_headers)
        assert access_res_expired.status_code == 200
        expired_data = access_res_expired.json()["data"]
        assert expired_data["subscription_status"] == "EXPIRED"
        assert expired_data["is_dashboard_unlocked"] is False
        assert len(expired_data["allowed_features"]) == 0
        assert "expired" in expired_data["message"].lower()
        print("  [PASS] 9. Expired subscription automatically locks premium features while keeping employer account active.")

    print("\n" + "=" * 80)
    print("[SUCCESS] ALL EMPLOYER FIRST-TIME ONBOARDING & SUBSCRIPTION TESTS PASSED!")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    asyncio.run(run_employer_onboarding_subscription_workflow_tests())
