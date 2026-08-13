"""
Recruiter Invitation Workflow Integration Tests
================================================
Tests the complete lifecycle:
  1. Employer invites recruiter → User created, must_change_password=True, DB committed.
  2. Email triggers after DB commit; if email fails, account is retained + warning returned.
  3. Resend Invitation regenerates password + re-dispatches email.
  4. Recruiter login enforces must_change_password guard.
  5. List Company Recruiters endpoint returns the invited recruiter.
"""

import asyncio
import unittest.mock as mock
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app as fastapi_app
from app.database.base import Base, discover_models
from app.core.database import get_db

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


async def run_recruiter_invitation_tests():
    print("=" * 70)
    print("[TEST] Recruiter Invitation Workflow Integration Tests")
    print("=" * 70)

    discover_models()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # ------------------------------------------------------------------ #
        # 0. Setup: Register & Login a Platform Admin                         #
        # ------------------------------------------------------------------ #
        admin_res = await client.post("/api/v1/auth/register", json={
            "name": "Test Admin",
            "email": "admin@recruitertest.com",
            "password": "AdminPass123!",
            "role": "ADMIN",
        })
        assert admin_res.status_code == 201, f"Admin reg failed: {admin_res.text}"

        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@recruitertest.com",
            "password": "AdminPass123!",
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("  [SETUP] Platform Admin registered & authenticated.")

        # Register Employer
        emp_res = await client.post("/api/v1/auth/register", json={
            "name": "Employer Owner",
            "email": "employer@recruitertest.com",
            "password": "EmployerPass123!",
            "role": "EMPLOYER",
        })
        assert emp_res.status_code == 201, f"Employer reg failed: {emp_res.text}"

        emp_login = await client.post("/api/v1/auth/login", json={
            "email": "employer@recruitertest.com",
            "password": "EmployerPass123!",
        })
        assert emp_login.status_code == 200
        emp_token = emp_login.json()["data"]["access_token"]
        emp_headers = {"Authorization": f"Bearer {emp_token}"}
        print("  [SETUP] Employer registered & authenticated.")

        # ------------------------------------------------------------------ #
        # TEST 1: Successful Recruiter Invitation                             #
        # ------------------------------------------------------------------ #
        print("\n  [TEST 1] Successful Recruiter Invitation...")

        invite_payload = {
            "name": "Jane Recruiter",
            "email": "jane.recruiter@example.com",
            "role": "Recruiter",
            "company_name": "Acme Corp"
        }

        res = await client.post(
            "/api/v1/companies/invite-recruiter",
            json=invite_payload,
            headers=emp_headers,
        )
        assert res.status_code == 201, f"Invite failed: {res.text}"
        data = res.json()
        assert data["success"] is True
        result = data["data"]

        # Verify response fields
        assert result["name"] == "Jane Recruiter"
        assert result["email"] == "jane.recruiter@example.com"
        assert result["company_name"] == "Acme Corp"
        assert result["role"] == "Recruiter"
        assert result["temporary_password"] is not None and len(result["temporary_password"]) > 0
        assert result["email_sent"] is True, "Email should be sent in dev/log mode"
        assert result["status"] == "Invited"
        assert result["warning"] is None
        print(f"    [PASS] Recruiter invited. Status={result['status']}, email_sent={result['email_sent']}")
        print(f"           Temp password: {result['temporary_password']}")

        # ------------------------------------------------------------------ #
        # TEST 2: Recruiter User Account Created in DB with must_change_password=True #
        # ------------------------------------------------------------------ #
        print("\n  [TEST 2] Verify recruiter User account created in DB...")

        # Try to login with the recruiter — should be blocked by must_change_password guard
        recruiter_login = await client.post("/api/v1/auth/login", json={
            "email": "jane.recruiter@example.com",
            "password": result["temporary_password"],
        })
        # Should get 403 MUST_CHANGE_PASSWORD, not 401 invalid credentials
        assert recruiter_login.status_code in [400, 403], (
            f"Expected password-change prompt (400/403), got {recruiter_login.status_code}: {recruiter_login.text}"
        )
        resp_body = recruiter_login.json()
        assert "password" in resp_body.get("error", {}).get("message", "").lower() or \
               resp_body.get("error", {}).get("code", "").upper() in ["MUST_CHANGE_PASSWORD", "FORBIDDEN", "BAD_REQUEST"], \
            f"Expected password change required error, got: {resp_body}"
        print("    [PASS] Recruiter login blocked — must_change_password enforced.")

        # ------------------------------------------------------------------ #
        # TEST 3: List Company Recruiters                                     #
        # ------------------------------------------------------------------ #
        print("\n  [TEST 3] List Company Recruiters endpoint...")

        list_res = await client.get(
            "/api/v1/companies/recruiters",
            params={"company_name": "Acme Corp"},
        )
        assert list_res.status_code == 200, f"List recruiters failed: {list_res.text}"
        list_data = list_res.json()["data"]
        assert isinstance(list_data, list)
        assert len(list_data) >= 1
        recruiter_entry = next((r for r in list_data if r["recruiter_email"] == "jane.recruiter@example.com"), None)
        assert recruiter_entry is not None, "Recruiter not found in list"
        assert recruiter_entry["recruiter_name"] == "Jane Recruiter"
        assert recruiter_entry["company_name"] == "Acme Corp"
        print(f"    [PASS] Recruiter found in list. Status={recruiter_entry['status']}")

        # ------------------------------------------------------------------ #
        # TEST 4: Email Failure Handling — Account Retained, Warning Returned #
        # ------------------------------------------------------------------ #
        print("\n  [TEST 4] Email failure handling — account retained + warning returned...")

        invite_payload2 = {
            "name": "Bob Recruiter",
            "email": "bob.recruiter@example.com",
            "role": "Interviewer",
            "company_name": "Acme Corp"
        }

        # Patch SMTP to simulate failure
        with mock.patch(
            "app.notifications.service.smtplib.SMTP",
            side_effect=ConnectionRefusedError("SMTP connection refused (test simulation)"),
        ):
            # Also ensure SMTP settings are populated so the SMTP block is entered
            with mock.patch("app.notifications.service.settings") as mock_settings:
                mock_settings.SMTP_HOST = "smtp.test.com"
                mock_settings.SMTP_PORT = 587
                mock_settings.SMTP_USER = "test@test.com"
                mock_settings.SMTP_PASSWORD = "testpass"
                mock_settings.SMTP_TLS = True
                mock_settings.EMAILS_FROM_EMAIL = "noreply@getworxs.com"
                mock_settings.EMAILS_FROM_NAME = "GetWorxs Platform"

                res_fail = await client.post(
                    "/api/v1/companies/invite-recruiter",
                    json=invite_payload2,
                    headers=emp_headers,
                )

        assert res_fail.status_code == 201, f"Invite with email failure should still be 201: {res_fail.text}"
        fail_data = res_fail.json()
        assert fail_data["success"] is True
        fail_result = fail_data["data"]
        assert fail_result["email_sent"] is False, "email_sent should be False on SMTP failure"
        assert fail_result["status"] == "Email Failed"
        assert fail_result["warning"] is not None
        assert "could not be sent" in fail_result["warning"].lower() or "invitation email" in fail_result["warning"].lower()
        print(f"    [PASS] Email failure handled. status={fail_result['status']}, warning={fail_result['warning'][:60]}...")

        # Verify account still exists by trying login (should get password-change prompt, NOT 404/401)
        bob_login = await client.post("/api/v1/auth/login", json={
            "email": "bob.recruiter@example.com",
            "password": fail_result["temporary_password"],
        })
        assert bob_login.status_code in [400, 403], (
            f"Expected password-change prompt after email failure, got {bob_login.status_code}: {bob_login.text}"
        )
        print("    [PASS] Recruiter account retained in DB even after email failure.")

        # ------------------------------------------------------------------ #
        # TEST 5: Resend Invitation                                           #
        # ------------------------------------------------------------------ #
        print("\n  [TEST 5] Resend Invitation action...")

        resend_res = await client.post(
            "/api/v1/companies/resend-recruiter-invite",
            json={"email": "jane.recruiter@example.com"},
            headers=emp_headers,
        )
        assert resend_res.status_code == 200, f"Resend failed: {resend_res.text}"
        resend_data = resend_res.json()
        assert resend_data["success"] is True
        resend_result = resend_data["data"]
        assert resend_result["email"] == "jane.recruiter@example.com"
        assert resend_result["email_sent"] is True
        assert resend_result["status"] == "Invited"
        # New password should be generated
        assert resend_result["temporary_password"] != result["temporary_password"], \
            "Resend should generate a NEW temporary password"
        print(f"    [PASS] Invitation resent. New temp password: {resend_result['temporary_password']}")

        # ------------------------------------------------------------------ #
        # TEST 6: Resend for unknown recruiter returns 404                   #
        # ------------------------------------------------------------------ #
        print("\n  [TEST 6] Resend for non-existent recruiter returns 404...")

        resend_404 = await client.post(
            "/api/v1/companies/resend-recruiter-invite",
            json={"email": "nobody@notexist.com"},
            headers=emp_headers,
        )
        assert resend_404.status_code == 404, f"Expected 404 for unknown recruiter: {resend_404.text}"
        print("    [PASS] 404 returned for non-existent recruiter.")

    print("\n" + "=" * 70)
    print("[SUCCESS] ALL RECRUITER INVITATION WORKFLOW TESTS PASSED!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_recruiter_invitation_tests())
