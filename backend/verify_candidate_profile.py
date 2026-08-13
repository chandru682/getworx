import asyncio
import time
from app.auth.models import UserRole
from app.auth.repository import AuthRepository
from app.auth.service import AuthService
from app.auth.schemas import RegisterRequest, LoginRequest
from app.database.session import get_async_db_context


async def main():
    ts = int(time.time())
    candidate_email = f"verify_candidate_{ts}@testdomain.com"
    candidate_password = "Candidate123!Pass"

    register_data = RegisterRequest(
        name="Aisha Khan",
        email=candidate_email,
        password=candidate_password,
        role=UserRole.CANDIDATE,
        photo_url="https://example.com/avatar.jpg",
        phone="+91 98765 43210",
        dob="1993-08-24",
        gender="Female",
        country="India",
        state="Karnataka",
        city="Bangalore",
        current_role="Full Stack Engineer",
        total_experience="4 Years",
        preferred_job_role="Senior Full Stack Developer",
        preferred_location="Remote",
        expected_salary="₹18,00,000",
        highest_qualification="B.Tech Computer Science",
        university="Indian Institute of Technology",
        graduation_year="2021",
        resume_url="https://example.com/resume.pdf",
        linkedin_url="https://www.linkedin.com/in/aishakhan",
        portfolio_url="https://aishakhan.dev",
        skills=["React", "Node.js", "TypeScript", "AWS"],
        languages=["English", "Hindi"],
        certifications=["AWS Certified Developer", "Certified ScrumMaster"],
    )

    async with get_async_db_context() as session:
        repo = AuthRepository(session)
        service = AuthService(repo)
        created = await service.register(register_data)
        print("REGISTERED user id", created.id)
        tokens = await service.login(LoginRequest(email=candidate_email, password=candidate_password))
        print("LOGIN success access_token len", len(tokens.access_token))
        profile = await service.get_candidate_profile(created.id)
        print("PROFILE")
        print(profile.model_dump())


if __name__ == "__main__":
    asyncio.run(main())
