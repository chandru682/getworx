import asyncio
import secrets
from datetime import datetime, timezone
from app.database.session import get_async_db_context
from app.jobs.models import Job, JobStatus

async def create_published_jobs():
    print("Creating active public jobs in MySQL...")
    async with get_async_db_context() as session:
        rand_id = secrets.token_hex(3).upper()
        job1 = Job(
            title="Senior Full Stack Developer",
            department="Engineering",
            role="Full Stack Developer",
            employment_type="Full-Time",
            experience_min=3,
            experience_max=8,
            work_mode="Remote",
            city="Chennai",
            state="Tamil Nadu",
            country="India",
            salary_min=1200000,
            salary_max=2400000,
            salary_currency="INR",
            show_salary=True,
            openings=5,
            priority="High",
            education="B.Tech / B.E / MCA",
            skills_json='["React", "Node.js", "Python", "FastAPI", "MySQL"]',
            summary="We are hiring a Senior Full Stack Engineer to design, develop and maintain enterprise SaaS modules.",
            responsibilities="Design scalable microservices and build responsive frontend user interfaces.",
            required_skills="React, Node.js, Python, FastAPI, MySQL",
            internal_job_id=f"JOB-2026-{rand_id}-1",
            prevent_duplicates=False,
            email_notifications="Instant",
            status=JobStatus.ACTIVE.value,
            created_by_id=1,
            company_id=1,
            visibility="Public"
        )

        rand_id2 = secrets.token_hex(3).upper()
        job2 = Job(
            title="AI / ML Engineer",
            department="Artificial Intelligence",
            role="Machine Learning Engineer",
            employment_type="Full-Time",
            experience_min=2,
            experience_max=6,
            work_mode="Hybrid",
            city="Bengaluru",
            state="Karnataka",
            country="India",
            salary_min=1500000,
            salary_max=3000000,
            salary_currency="INR",
            show_salary=True,
            openings=2,
            priority="High",
            education="B.Tech / M.Tech in CS / AI",
            skills_json='["Python", "PyTorch", "LLM", "RAG", "FastAPI"]',
            summary="Join our AI engineering team building cutting edge ATS and candidate match scoring algorithms.",
            responsibilities="Develop AI pipelines, LLM fine-tuning models, and vector embeddings.",
            required_skills="Python, PyTorch, LLM, RAG, FastAPI",
            internal_job_id=f"JOB-2026-{rand_id2}-2",
            prevent_duplicates=False,
            email_notifications="Instant",
            status=JobStatus.ACTIVE.value,
            created_by_id=1,
            company_id=1,
            visibility="Public"
        )

        session.add(job1)
        session.add(job2)
        await session.commit()
        print("Success: 2 Published Active Jobs created and live in MySQL!")

if __name__ == "__main__":
    asyncio.run(create_published_jobs())

