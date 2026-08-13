"""Insert test company data directly into MySQL getworxs_db database."""
import asyncio
import secrets
from datetime import datetime, timezone

from app.database.session import AsyncSessionLocal
from app.auth.models import User, UserRole
from app.auth.security import hash_password
from app.companies.models import Company, CompanyStatus, CompanyDocument, CompanySettings
from sqlalchemy import select


async def insert_test_data():
    async with AsyncSessionLocal() as db:

        # ── Step 1: Create Employer User ─────────────────────────────────────
        result = await db.execute(select(User).where(User.email == "employer@congihub.com"))
        existing_user = result.scalar_one_or_none()

        if not existing_user:
            user = User(
                name="Congi Hub Admin",
                email="employer@congihub.com",
                password_hash=hash_password("Employer123!Password"),
                role=UserRole.EMPLOYER,
                is_verified=True,
                status="active",
            )
            db.add(user)
            await db.flush()
            user_id = user.id
            print(f"[OK] Employer user created -- ID: {user_id}, Email: employer@congihub.com")
        else:
            user_id = existing_user.id
            print(f"[INFO] Employer user already exists -- ID: {user_id}")

        # -- Step 2: Create Company --
        result2 = await db.execute(select(Company).where(Company.email == "contact@congihub.com"))
        existing_company = result2.scalar_one_or_none()

        if not existing_company:
            date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
            rand_hex = secrets.token_hex(2).upper()
            code = f"CMP-{date_str}-{rand_hex}"

            company = Company(
                name="Congi Hub Private Limited",
                legal_name="Congi Hub Private Limited",
                company_code=code,
                industry="Software & Technology",
                company_size="11-50",
                email="contact@congihub.com",
                phone="9876543210",
                country="India",
                state="Tamil Nadu",
                city="Chennai",
                address="123 Tech Park, Sholinganallur",
                postal_code="600119",
                tax_gst_number="33AAACH1234A1Z5",
                business_reg_number="U72900TN2020PTC140123",
                year_established=2020,
                primary_contact_name="Congi Hub Admin",
                primary_contact_designation="CEO",
                primary_contact_email="employer@congihub.com",
                primary_contact_phone="9876543210",
                description="A leading technology company specializing in AI-powered recruitment solutions.",
                approval_status=CompanyStatus.PENDING_VERIFICATION,
                is_verified=False,
                created_by_id=user_id,
            )
            db.add(company)
            await db.flush()
            company_id = company.id
            print(f"[OK] Company created -- ID: {company_id}, Code: {code}")

            # -- Step 3: Add Document --
            doc = CompanyDocument(
                company_id=company_id,
                document_type="registration_certificate",
                document_name="Congi_Hub_Registration_Certificate.pdf",
                document_url="https://storage.getworxs.com/docs/congihub_reg.pdf",
                is_required=True,
                status="uploaded",
            )
            db.add(doc)
            print(f"[OK] Company document added for company ID: {company_id}")

            # -- Step 4: Add Settings --
            settings = CompanySettings(
                company_id=company_id,
                time_zone="Asia/Kolkata",
                currency="INR",
                language="en",
                date_format="DD-MM-YYYY",
            )
            db.add(settings)
            print(f"[OK] Company settings added for company ID: {company_id}")

            await db.commit()
            print("")
            print("[DONE] All data committed to MySQL getworxs_db successfully!")
            print(f"  -> users table        : employer@congihub.com (ID {user_id})")
            print(f"  -> companies table    : Congi Hub Private Limited (ID {company_id})")
            print(f"  -> company_documents  : registration_certificate")
            print(f"  -> company_settings   : INR / Asia/Kolkata")

        else:
            print(f"[INFO] Company already exists -- ID: {existing_company.id}, Name: {existing_company.name}")
            await db.commit()


if __name__ == "__main__":
    asyncio.run(insert_test_data())
