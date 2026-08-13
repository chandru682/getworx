import asyncio
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app as fastapi_app
from app.database.base import Base, discover_models
from app.core.database import get_db
from app.auth.models import User, UserRole
from app.companies.models import Company, CompanyStatus
from app.subscriptions.models import CompanySubscription, SubscriptionStatus, SubscriptionPlan
from app.jobs.models import Job, JobStatus

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

async def run_tests():
    print("=" * 80)
    print("[TEST] Enterprise Job Creation Wizard Integration Test Suite")
    print("=" * 80)

    discover_models()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Seed basic subscription plans
        async with TestingSessionLocal() as session:
            plan = SubscriptionPlan(
                plan_code="professional",

                name="Professional Plan",
                description="Professional",
                price_usd=249.00,
                price_inr=19900.00,
                duration_days=30,
                job_posting_limit=10,
                recruiter_limit=5,
                resume_views_limit=100,
                ai_credits=1000,
                features_json="[]",
                is_active=True
            )
            session.add(plan)
            await session.commit()

        # 1. Register Platform Admin
        admin_reg = await client.post("/api/v1/auth/register", json={
            "name": "Super Admin",
            "email": "admin@getworxs.com",
            "password": "Admin123!Password",
            "role": "ADMIN",
        })
        assert admin_reg.status_code == 201
        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@getworxs.com",
            "password": "Admin123!Password",
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("  [PASS] 1. Platform Admin registered and logged in.")

        # 2. Register Employer User
        emp_reg = await client.post("/api/v1/auth/register", json={
            "name": "John Doe",
            "email": "acme@acme.com",
            "password": "Company123!Password",
            "role": "EMPLOYER"
        })
        assert emp_reg.status_code == 201
        print("  [PASS] 2. Employer user registered.")

        # Login with temporary password
        emp_login = await client.post("/api/v1/auth/login", json={
            "email": "acme@acme.com",
            "password": "Company123!Password"
        })
        assert emp_login.status_code == 200
        emp_token = emp_login.json()["data"]["access_token"]
        emp_headers = {"Authorization": f"Bearer {emp_token}"}

        # Submit Company Registration
        comp_reg = await client.post("/api/v1/companies/registration", json={
            "name": "Acme Corp",
            "legal_name": "Acme Corp Ltd",
            "industry": "Software & Tech",
            "company_size": "51-200",
            "email": "acme@acme.com",
            "phone": "9876543210",
            "country": "India",
            "state": "Tamil Nadu",
            "city": "Chennai",
            "address": "OMR road",
            "postal_code": "600001",
            "primary_contact_name": "John Doe",
            "primary_contact_email": "acme@acme.com"
        }, headers=emp_headers)

        assert comp_reg.status_code == 201
        company_id = comp_reg.json()["data"]["id"]
        print("  [PASS] 3. Company registration submitted successfully.")

        # Approve Company via Admin
        approve_res = await client.post(f"/api/v1/companies/{company_id}/approve", headers=admin_headers)
        assert approve_res.status_code == 200
        print("  [PASS] 4. Company approved by Platform Admin.")

        # Update password hash in DB to "Company123!Password" and must_change_password to True
        async with TestingSessionLocal() as session:
            from app.auth.security import hash_password
            res = await session.execute(select(User).where(User.email == "acme@acme.com"))
            employer_user = res.scalar_one_or_none()
            assert employer_user is not None
            employer_user.password_hash = hash_password("Company123!Password")
            employer_user.must_change_password = True
            await session.commit()

        # 1. Attempt login with temporary password - must fail with 403 Forbidden (must change password)
        bad_login = await client.post("/api/v1/auth/login", json={
            "email": "acme@acme.com",
            "password": "Company123!Password"
        })
        assert bad_login.status_code == 403
        print("  [PASS] 5. Login with temporary password correctly blocked with 403 Forbidden.")

        # 2. Change password using first-login-change-password endpoint
        change_res = await client.post("/api/v1/auth/first-login-change-password", json={
            "email": "acme@acme.com",
            "temporary_password": "Company123!Password",
            "new_password": "NewSecurePassword123!"
        })
        assert change_res.status_code == 200
        emp_token = change_res.json()["data"]["access_token"]
        emp_headers = {"Authorization": f"Bearer {emp_token}"}
        print("  [PASS] 6. Changed password via first-login-change-password and obtained token.")

        # Job Data for creation
        job_data = {
            "title": "Senior Frontend Engineer",
            "department": "Engineering",
            "role": "Frontend Developer",
            "employment_type": "Full Time",
            "experience_min": 3,
            "experience_max": 6,
            "work_mode": "Remote",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "country": "India",
            "salary_min": 1500000,
            "salary_max": 2500000,
            "salary_currency": "INR",
            "show_salary": True,
            "openings": 2,
            "priority": "High",
            "deadline": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "education": "B.E/B.Tech",
            "skills_json": '["React", "TypeScript", "HTML"]',
            "certifications_json": '[]',
            "languages_json": '["English", "Tamil"]',
            "industry_exp": "Tech",
            "notice_period": "30 Days",
            "current_location": "Chennai",
            "relocation_pref": "Flexible",
            "about_company": "Acme is a tech leader.",
            "summary": "Join our product engineering division.",
            "responsibilities": "Develop beautiful web apps.",
            "required_skills": "React & Typescript.",
            "preferred_skills": "Next.js.",
            "benefits_json": '["Medical", "PF"]',
            "working_hours": "Flexible",
            "hiring_manager_name": "Hiring boss",
            "hiring_manager_email": "boss@acme.com",
            "visibility": "Public",
            "prevent_duplicates": True,
            "email_notifications": "Instant",
            "screening_questions": [
                {
                    "question_text": "Do you have 3+ years experience with React?",
                    "question_type": "yes_no",
                    "is_mandatory": True
                },
                {
                    "question_text": "Please choose your preferred programming language",
                    "question_type": "multiple_choice",
                    "options_json": '["TypeScript", "JavaScript", "Python"]',
                    "is_mandatory": True
                }
            ]
        }


        # Try to Publish Job before subscription plan selected -> should fail
        bad_pub = await client.post("/api/v1/jobs", json=job_data, headers=emp_headers)
        assert bad_pub.status_code == 403
        print("  [PASS] 7. Publishing job blocked because no active subscription was found.")

        # Subscribe to Professional Plan
        sub_res = await client.post("/api/v1/subscriptions/subscribe", json={
            "plan_code": "professional",
            "currency": "INR",
            "payment_method_id": "pm_card_visa",
            "billing_email": "billing@acme.com"
        }, headers=emp_headers)
        assert sub_res.status_code == 200
        print("  [PASS] 8. Subscribed Acme Corp to Professional Subscription plan.")

        # Publish Job (All 3 requirements met) -> should succeed
        pub_res = await client.post("/api/v1/jobs", json=job_data, headers=emp_headers)
        assert pub_res.status_code == 201
        job_id = pub_res.json()["data"]["id"]
        assert pub_res.json()["data"]["status"] == "active"
        assert len(pub_res.json()["data"]["screening_questions"]) == 2
        print("  [PASS] 9. Job published successfully after meeting all 3-tier access requirements.")


        # Test Save Draft -> should succeed regardless of subscription/approval checks
        draft_data = {
            "title": "Part-Time QA Draft",
            "department": "QA",
            "role": "QA Tester",
            "screening_questions": [
                {
                    "question_text": "Do you have a personal laptop?",
                    "question_type": "yes_no",
                    "is_mandatory": False
                }
            ]
        }
        draft_res = await client.post("/api/v1/jobs/draft", json=draft_data, headers=emp_headers)
        assert draft_res.status_code == 201
        draft_job_id = draft_res.json()["data"]["id"]
        assert draft_res.json()["data"]["status"] == "draft"
        print("  [PASS] 11. Saved partial Job Draft successfully (Access check exempt).")

        # Test List Company Jobs
        list_res = await client.get("/api/v1/jobs", headers=emp_headers)
        assert list_res.status_code == 200
        assert list_res.json()["data"]["total"] == 2
        print("  [PASS] 12. List company jobs returned paginated records successfully.")

        # Test Update Job details
        update_res = await client.put(f"/api/v1/jobs/{job_id}", json={
            "title": "Lead Senior Frontend Architect",
            "openings": 5
        }, headers=emp_headers)
        assert update_res.status_code == 200
        assert update_res.json()["data"]["title"] == "Lead Senior Frontend Architect"
        assert update_res.json()["data"]["openings"] == 5
        print("  [PASS] 13. Job details updated successfully.")

        # Test Soft Delete Job
        del_res = await client.delete(f"/api/v1/jobs/{job_id}", headers=emp_headers)
        assert del_res.status_code == 200
        
        # Verify it does not show up in listings anymore
        list_res = await client.get("/api/v1/jobs", headers=emp_headers)
        assert list_res.json()["data"]["total"] == 1  # only draft remains
        print("  [PASS] 14. Job soft-deleted successfully.")

    print("\n" + "=" * 80)
    print("[SUCCESS] ALL 14 JOB CREATION & ACCESS CONTROL TESTS PASSED!")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_tests())
