import asyncio
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
        await session.commit()


fastapi_app.dependency_overrides[get_db] = override_get_db


async def run_company_workflow_tests():
    print("====================================================")
    print("[TEST] Running Enterprise Company Onboarding & Approval Workflow Tests")
    print("====================================================\n")

    discover_models()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # 1. Register Platform Admin user
        admin_res = await client.post(
            "/api/v1/auth/register",
            json={
                "name": "Super Admin",
                "email": "admin@getworxs.com",
                "password": "AdminPassword123!",
                "role": "ADMIN"
            }
        )
        assert admin_res.status_code == 201, f"Admin reg failed: {admin_res.text}"

        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@getworxs.com", "password": "AdminPassword123!"}
        )
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("  [PASS] 1. Platform Admin user registered & authenticated")

        # 2. Register Company Admin user
        company_user_res = await client.post(
            "/api/v1/auth/register",
            json={
                "name": "Acme Admin",
                "email": "owner@acmecorp.com",
                "password": "AcmePassword123!",
                "role": "EMPLOYER"
            }
        )
        assert company_user_res.status_code == 201, f"User reg failed: {company_user_res.text}"

        user_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "owner@acmecorp.com", "password": "AcmePassword123!"}
        )
        assert user_login.status_code == 200, f"User login failed: {user_login.text}"
        user_token = user_login.json()["data"]["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        print("  [PASS] 2. Company Admin user registered & authenticated")

        # 3. Submit Company Registration Form
        reg_payload = {
            "name": "Acme Technologies",
            "legal_name": "Acme Technologies Private Limited",
            "industry": "Software & Technology",
            "company_size": "51-200",
            "website": "https://acmecorp.example.com",
            "email": "contact@acmecorp.com",
            "phone": "+1-555-0199234",
            "country": "United States",
            "state": "California",
            "city": "San Francisco",
            "address": "500 Howard Street, Suite 400",
            "postal_code": "94105",
            "tax_gst_number": "GST-99238491A",
            "business_reg_number": "REG-2026-88192",
            "year_established": 2018,
            "primary_contact_name": "John Acme",
            "primary_contact_designation": "VP of Engineering",
            "primary_contact_email": "john.acme@acmecorp.com",
            "primary_contact_phone": "+1-555-0199235",
            "description": "Enterprise cloud automation platform",
            "logo_url": "https://acmecorp.example.com/logo.png",
            "documents": [
                {
                    "document_type": "registration_certificate",
                    "document_name": "Acme_Inc_Incorporation.pdf",
                    "document_url": "https://storage.getworxs.com/docs/acme_inc.pdf",
                    "is_required": True
                }
            ]
        }
        create_res = await client.post("/api/v1/companies/registration", json=reg_payload, headers=user_headers)
        assert create_res.status_code == 201, f"Company registration failed: {create_res.text}"
        company_obj = create_res.json()["data"]
        company_id = company_obj["id"]
        assert company_obj["approval_status"] == "pending_verification"
        assert company_obj["is_verified"] is False
        assert company_obj["company_code"].startswith("CMP-")
        print(f"  [PASS] 3. Company registered successfully (Code: {company_obj['company_code']}, Status: {company_obj['approval_status']})")

        # 4. Upload Additional Document
        doc_payload = {
            "document_type": "gst_tax_certificate",
            "document_name": "Acme_Tax_Exemption.pdf",
            "document_url": "https://storage.getworxs.com/docs/acme_tax.pdf",
            "is_required": False
        }
        doc_res = await client.post(f"/api/v1/companies/{company_id}/documents", json=doc_payload, headers=user_headers)
        assert doc_res.status_code == 201, f"Document upload failed: {doc_res.text}"
        print("  [PASS] 4. Document uploaded successfully")

        # 5. Non-admin approval attempt (Must fail with 403 Forbidden)
        forbidden_appr = await client.post(f"/api/v1/companies/{company_id}/approve", headers=user_headers)
        assert forbidden_appr.status_code == 403, f"RBAC check failed: {forbidden_appr.text}"
        print("  [PASS] 5. RBAC check passed: Non-admin cannot approve company")

        # 6. Admin List Pending Companies
        pending_res = await client.get("/api/v1/companies/pending", headers=admin_headers)
        assert pending_res.status_code == 200, f"List pending failed: {pending_res.text}"
        pending_list = pending_res.json()["data"]["items"]
        assert len(pending_list) >= 1
        assert pending_list[0]["id"] == company_id
        print("  [PASS] 6. Platform Admin retrieved pending companies list")

        # 7. Admin Request Changes
        req_changes_payload = {
            "comments": "Please upload a valid Company Registration Certificate with official seal."
        }
        req_changes_res = await client.post(f"/api/v1/companies/{company_id}/request-changes", json=req_changes_payload, headers=admin_headers)
        assert req_changes_res.status_code == 200, f"Request changes failed: {req_changes_res.text}"
        company_after_req = req_changes_res.json()["data"]
        assert company_after_req["approval_status"] == "under_review"
        assert company_after_req["review_notes"] == req_changes_payload["comments"]
        print("  [PASS] 7. Platform Admin requested changes (Status: under_review)")

        # 8. Company Resubmits Application
        resubmit_res = await client.post(f"/api/v1/companies/{company_id}/submit", headers=user_headers)
        assert resubmit_res.status_code == 200, f"Resubmit failed: {resubmit_res.text}"
        company_resubmitted = resubmit_res.json()["data"]
        assert company_resubmitted["approval_status"] == "pending_verification"
        assert company_resubmitted["review_notes"] is None
        print("  [PASS] 8. Company resubmitted application (Status returned to: pending_verification)")

        # 9. Admin Approves Company
        approve_res = await client.post(
            f"/api/v1/companies/{company_id}/approve",
            json={"notes": "All incorporation documents verified. Approved."},
            headers=admin_headers
        )
        assert approve_res.status_code == 200, f"Approve failed: {approve_res.text}"
        approved_obj = approve_res.json()["data"]
        assert approved_obj["approval_status"] == "approved"
        assert approved_obj["status"] == "active"
        assert approved_obj["is_verified"] is True
        print("  [PASS] 9. Platform Admin approved company (Status: approved, is_verified: True)")

        # 10. Admin Suspend & Activate
        suspend_res = await client.post(f"/api/v1/companies/{company_id}/suspend", headers=admin_headers)
        assert suspend_res.status_code == 200
        assert suspend_res.json()["data"]["approval_status"] == "suspended"
        print("  [PASS] 10a. Platform Admin suspended company")

        activate_res = await client.post(f"/api/v1/companies/{company_id}/activate", headers=admin_headers)
        assert activate_res.status_code == 200
        assert activate_res.json()["data"]["approval_status"] == "approved"
        assert activate_res.json()["data"]["is_verified"] is True
        print("  [PASS] 10b. Platform Admin re-activated company")

    print("\n[SUCCESS] ALL ENTERPRISE COMPANY ONBOARDING TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    asyncio.run(run_company_workflow_tests())
