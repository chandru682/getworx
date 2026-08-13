"""Test script to verify Candidate/Jobseeker registration flow, database persistence, and admin visibility."""
import asyncio
import time
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_async_db_context
from app.auth.models import User, UserRole
from app.auth.repository import AuthRepository
from app.auth.service import AuthService
from app.auth.schemas import RegisterRequest, LoginRequest


async def test_candidate_registration_workflow():
    print("=========================================================")
    print("TEST: CANDIDATE REGISTRATION & MYSQL DATABASE PERSISTENCE")
    print("=========================================================")

    ts = int(time.time())
    candidate_name = f"Test Jobseeker {ts}"
    candidate_email = f"jobseeker_{ts}@testdomain.com"
    candidate_password = "Candidate123!Pass"

    # 1. Test Service Layer & Direct Registration
    async with get_async_db_context() as session:
        repo = AuthRepository(session)
        service = AuthService(repo)

        reg_data = RegisterRequest(
            name=candidate_name,
            email=candidate_email,
            password=candidate_password,
            role=UserRole.CANDIDATE
        )

        print(f"\n[1] Registering Candidate via AuthService...")
        registered_user = await service.register(reg_data)
        print(f"  -> Success: ID={registered_user.id}, Name='{registered_user.name}', Role='{registered_user.role}'")

    # 2. Test Login Verification
    async with get_async_db_context() as session:
        repo = AuthRepository(session)
        service = AuthService(repo)

        print(f"\n[2] Logging in newly registered Candidate...")
        login_req = LoginRequest(email=candidate_email, password=candidate_password)
        tokens = await service.login(login_req)
        print(f"  -> Login Success: Token generated, AccessToken Expiry={tokens.expires_in}s")

    # 3. Direct MySQL Database Query Verification
    async with get_async_db_context() as session:
        stmt = (
            select(User)
            .options(selectinload(User.candidate_profile))
            .where(User.email == candidate_email.lower())
        )
        res = await session.execute(stmt)
        user_db = res.scalar_one_or_none()

        assert user_db is not None, "Candidate must exist in MySQL database 'users' table"
        assert user_db.role == UserRole.CANDIDATE, "User role must be CANDIDATE"
        assert user_db.candidate_profile is not None, "CandidateProfile record must be linked"

        print(f"\n[3] Direct MySQL Database Verification:")
        print(f"  -> User Table Record        : ID={user_db.id}, Email='{user_db.email}', Role={user_db.role}")
        print(f"  -> CandidateProfile Record : Profile ID={user_db.candidate_profile.id}, Name='{user_db.candidate_profile.name}'")

    # 4. Admin API Candidate Fetch Test
    async with get_async_db_context() as session:
        repo = AuthRepository(session)
        service = AuthService(repo)

        print(f"\n[4] Admin Console Candidate Fetch Test...")
        all_candidates = await service.get_all_candidates()
        found_in_admin = any(c.email == candidate_email.lower() for c in all_candidates)

        assert found_in_admin, "Newly created candidate must appear in Admin Candidate List"
        print(f"  -> Found in Admin List! Total Candidates in DB = {len(all_candidates)}")

    print("\n=========================================================")
    print("SUCCESS: CANDIDATE REGISTRATION TEST COMPLETED WITH 100% PASS!")
    print("=========================================================\n")


if __name__ == "__main__":
    asyncio.run(test_candidate_registration_workflow())
