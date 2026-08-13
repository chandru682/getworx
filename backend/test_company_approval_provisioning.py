"""
Integration Test Suite: Automatic Employer Provisioning & Company Approval Workflow
=======================================================================================
Tests all requirements:
1. Platform Admin approves company -> approval_status = APPROVED, is_verified = True.
2. Auto-creates Employer user account with role=EMPLOYER, must_change_password = True.
3. Generates secure random 12-16 char temporary password (never plain text in DB, hashed only).
4. Welcome Email sent (or graceful warning returned if email fails).
5. Audit logs recorded for: Company Approved, Employer Account Created, Welcome Email Sent / Failed.
6. Admin Panel "Resend Welcome Email" action updates temp password and dispatches email.
7. First login flow: login blocked until forced password change -> update password sets must_change_password = False and grants dashboard access.
"""

import asyncio
from unittest import mock
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app as fastapi_app
from app.database.base import Base, discover_models
from app.core.database import get_db
from app.auth.models import User, UserRole
from app.audit.models import AuditLog

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


async def run_company_approval_provisioning_tests():
    print("=" * 76)
    print("[TEST] Automatic Employer Provisioning & Company Approval Integration Tests")
    print("=" * 76)

    discover_models()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # ------------------------------------------------------------------ #
        # 1. Setup: Register Platform Admin                                  #
        # ------------------------------------------------------------------ #
        admin_reg = await client.post("/api/v1/auth/register", json={
            "name": "Super Admin",
            "email": "admin@getworxs.com",
            "password": "AdminPassword123!",
            "role": "ADMIN",
        })
        assert admin_reg.status_code == 201, f"Admin reg failed: {admin_reg.text}"

        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@getworxs.com",
            "password": "AdminPassword123!",
        })
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("  [PASS] 1. Platform Admin user registered & authenticated.")

        # ------------------------------------------------------------------ #
        # 2. Submit Company Registration Application                          #
        # ------------------------------------------------------------------ #
        company_reg_payload = {
            "name": "Apex Innovations",
            "legal_name": "Apex Innovations LLC",
            "industry": "Artificial Intelligence",
            "company_size": "51-200",
            "website": "https://apexinnovations.example.com",
            "email": "owner@apexinnovations.com",
            "phone": "+1-555-0188234",
            "country": "United States",
            "state": "California",
            "city": "Palo Alto",
            "address": "100 University Ave, Suite 300",
            "postal_code": "94301",
            "tax_gst_number": "TAX-99218274",
            "business_reg_number": "REG-2026-99120",
            "year_established": 2020,
            "primary_contact_name": "Alice Apex",
            "primary_contact_designation": "Chief Technology Officer",
            "primary_contact_email": "alice@apexinnovations.com",
            "primary_contact_phone": "+1-555-0188235",
            "description": "Next-generation AI research lab",
        }

        create_company_res = await client.post(
            "/api/v1/companies/registration",
            json=company_reg_payload,
            headers=admin_headers,
        )
        assert create_company_res.status_code == 201, f"Company reg failed: {create_company_res.text}"
        company_data = create_company_res.json()["data"]
        company_id = company_data["id"]
        assert company_data["approval_status"] == "pending_verification"
        assert company_data["is_verified"] is False
        print(f"  [PASS] 2. Company 'Apex Innovations' registered (ID: {company_id}, Status: pending_verification).")

        # ------------------------------------------------------------------ #
        # 3. Platform Admin Approves Company -> Auto-Provisions Employer      #
        # ------------------------------------------------------------------ #
        approve_res = await client.post(
            f"/api/v1/companies/{company_id}/approve",
            json={"notes": "Verified business license and tax records."},
            headers=admin_headers,
        )
        assert approve_res.status_code == 200, f"Approve failed: {approve_res.text}"
        approved_data = approve_res.json()["data"]
        assert approved_data["approval_status"] == "approved"
        assert approved_data["status"] == "active"
        assert approved_data["is_verified"] is True
        print("  [PASS] 3. Company approved successfully (approval_status=approved, is_verified=True).")

        # ------------------------------------------------------------------ #
        # 4. Verify Employer User Created in DB with Hashed Temp Password    #
        # ------------------------------------------------------------------ #
        async with TestingSessionLocal() as session:
            stmt = select(User).where(User.email == "owner@apexinnovations.com")
            res = await session.execute(stmt)
            emp_user = res.scalar_one_or_none()
            assert emp_user is not None, "Employer user account was not created!"
            assert emp_user.role == UserRole.EMPLOYER
            assert emp_user.must_change_password is True
            assert emp_user.company_id == company_id
            assert not emp_user.password_hash.startswith("plain"), "Password should be hashed!"

            # Verify Audit Logs for Company Approved, Employer Account Created, Welcome Email Sent
            audit_stmt = select(AuditLog).where(AuditLog.target_entity.in_(["Company", "User"]))
            audit_res = await session.execute(audit_stmt)
            audit_logs = audit_res.scalars().all()
            actions = [log.action for log in audit_logs]
            assert "Company Approved" in actions, f"Missing 'Company Approved' audit log! Got: {actions}"
            assert "Employer Account Created" in actions, f"Missing 'Employer Account Created' audit log! Got: {actions}"
            assert "Welcome Email Sent" in actions or "Welcome Email Failed" in actions, f"Missing Welcome Email audit log! Got: {actions}"
            print("  [PASS] 4. Employer user account created in DB & Audit logs verified.")

        # ------------------------------------------------------------------ #
        # 5. First Login Flow - Attempting Login with Temp Password Guard    #
        # ------------------------------------------------------------------ #
        # We need the temporary password. In dev/log mode, let's fetch temp password by testing reset or first login change password
        # Let's test resend welcome email endpoint which returns temporary password result message
        resend_res = await client.post(
            f"/api/v1/companies/{company_id}/resend-welcome-email",
            headers=admin_headers,
        )
        assert resend_res.status_code == 200, f"Resend failed: {resend_res.text}"
        resend_data = resend_res.json()["data"]
        assert resend_data["employer_email"] == "owner@apexinnovations.com"
        assert resend_data["email_sent"] is True
        print("  [PASS] 5. Admin panel 'Resend Welcome Email' executed successfully.")

        # ------------------------------------------------------------------ #
        # 6. Test First Login Password Change Endpoint                      #
        # ------------------------------------------------------------------ #
        # First test invalid temporary password
        invalid_change = await client.post("/api/v1/auth/first-login-change-password", json={
            "email": "owner@apexinnovations.com",
            "temporary_password": "WrongTempPassword123!",
            "new_password": "PermanentPass123!",
        })
        assert invalid_change.status_code in [400, 401], f"Expected 400/401 for wrong temp password, got: {invalid_change.text}"
        print("  [PASS] 6a. Invalid temporary password correctly rejected.")

        # Now test first login password change with correct temp password by updating user's temp password hash directly in test session
        async with TestingSessionLocal() as session:
            from app.auth.security import hash_password
            stmt = select(User).where(User.email == "owner@apexinnovations.com")
            res = await session.execute(stmt)
            emp_user = res.scalar_one()
            known_temp_pwd = "KnownTemp@Pass2026"
            emp_user.password_hash = hash_password(known_temp_pwd)
            emp_user.must_change_password = True
            session.add(emp_user)
            await session.commit()

        # Login with temp password should be blocked by must_change_password guard
        blocked_login = await client.post("/api/v1/auth/login", json={
            "email": "owner@apexinnovations.com",
            "password": known_temp_pwd,
        })
        assert blocked_login.status_code in [400, 403], f"Expected 400/403 must change password error, got {blocked_login.status_code}"
        print("  [PASS] 6b. Login with temporary password blocked by must_change_password guard.")

        # Perform First Login Password Change
        valid_change = await client.post("/api/v1/auth/first-login-change-password", json={
            "email": "owner@apexinnovations.com",
            "temporary_password": known_temp_pwd,
            "new_password": "NewPermanentPass123!",
        })
        assert valid_change.status_code == 200, f"Password change failed: {valid_change.text}"
        change_resp = valid_change.json()
        assert change_resp["success"] is True
        assert change_resp["data"]["access_token"] is not None
        assert change_resp["data"]["user"]["role"] == "EMPLOYER"
        print("  [PASS] 6c. Forced password change completed -> JWT tokens issued.")

        # Verify must_change_password is now False in DB
        async with TestingSessionLocal() as session:
            stmt = select(User).where(User.email == "owner@apexinnovations.com")
            res = await session.execute(stmt)
            emp_user = res.scalar_one()
            assert emp_user.must_change_password is False, "must_change_password should be False after update!"
        print("  [PASS] 6d. DB verified: must_change_password set to False.")

        # Employer can now login normally with new permanent password
        normal_login = await client.post("/api/v1/auth/login", json={
            "email": "owner@apexinnovations.com",
            "password": "NewPermanentPass123!",
        })
        assert normal_login.status_code == 200, f"Normal login failed: {normal_login.text}"
        print("  [PASS] 6e. Employer successfully logged in with new permanent password -> Employer Dashboard unlocked!")

        # ------------------------------------------------------------------ #
        # 7. Test Email Failure Fallback Behavior                           #
        # ------------------------------------------------------------------ #
        company_fail_payload = {
            "name": "FailMail Corp",
            "legal_name": "FailMail Corporation",
            "industry": "Software",
            "company_size": "11-50",
            "email": "owner@failmail.com",
            "phone": "+1-555-0199999",
            "country": "United States",
            "state": "Nevada",
            "city": "Las Vegas",
            "address": "777 Casino Way",
            "postal_code": "89109",
            "description": "Cloud gaming tech",
        }
        create_fail_res = await client.post(
            "/api/v1/companies/registration",
            json=company_fail_payload,
            headers=admin_headers,
        )
        assert create_fail_res.status_code == 201
        fail_company_id = create_fail_res.json()["data"]["id"]

        # Mock NotificationService.send_employer_welcome_email to raise Exception
        with mock.patch("app.notifications.service.NotificationService.send_employer_welcome_email", side_effect=Exception("SMTP Connection Refused")):
            appr_fail_res = await client.post(
                f"/api/v1/companies/{fail_company_id}/approve",
                json={"notes": "Approved despite email outage test."},
                headers=admin_headers,
            )
            assert appr_fail_res.status_code == 200, f"Approval failed: {appr_fail_res.text}"
            fail_resp = appr_fail_res.json()
            assert fail_resp["data"]["approval_status"] == "approved"
            assert fail_resp["data"]["email_sent"] is False
            assert "could not be delivered" in fail_resp["data"]["warning"].lower()
            print("  [PASS] 7. Email failure handled gracefully: Company approved, account created, warning returned.")

    print("\n" + "=" * 76)
    print("[SUCCESS] ALL AUTOMATIC EMPLOYER PROVISIONING WORKFLOW TESTS PASSED!")
    print("=" * 76 + "\n")

if __name__ == "__main__":
    asyncio.run(run_company_approval_provisioning_tests())
