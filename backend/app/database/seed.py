"""
GetWorxs Production Test Data Seeder
====================================
Generates comprehensive enterprise QA and development test data directly in MySQL database:
  - 5 Approved Companies
  - 5 Employer Accounts (linked to companies, active subscriptions, passwords ready)
  - 5 Recruiter Accounts (assigned to companies)
  - 250 Published Active Jobs (50 per company across 11 job categories)
  - 50 Candidate Accounts (with candidate profiles, skills, 80-100% completion)
  - 150-250 Real Applications (distributed across Applied, Viewed, Shortlisted, Interview Scheduled, Rejected)
  - Notifications for Admins, Employers, Recruiters, and Candidates

Usage:
  python -m app.database.seed
  python seed.py --reset
"""

import argparse
import asyncio
import json
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User, UserRole
from app.auth.security import hash_password
from app.companies.models import Company, CompanyStatus
from app.candidates.models import CandidateProfile
from app.employers.models import EmployerProfile
from app.recruiters.models import RecruiterProfile
from app.jobs.models import Job, JobStatus
from app.applications.models import Application, ApplicationStatus
from app.notifications.models import Notification, NotificationType
from app.subscriptions.models import CompanySubscription, SubscriptionPlan, SubscriptionStatus
from app.database.base import discover_models
from app.database.session import get_async_db_context
from app.core.logging import logger

JOB_CATEGORIES = [
    ("Software Engineer", "Engineering", "Software Developer"),
    ("Frontend Developer", "Engineering", "Frontend Engineer"),
    ("Backend Developer", "Engineering", "Backend Engineer"),
    ("Full Stack Developer", "Engineering", "Full Stack Engineer"),
    ("UI/UX Designer", "Design", "Product Designer"),
    ("QA Engineer", "Quality Assurance", "Automation QA Engineer"),
    ("DevOps Engineer", "Infrastructure", "DevOps Systems Engineer"),
    ("Data Analyst", "Data Science", "BI Data Analyst"),
    ("HR Executive", "Human Resources", "Talent Acquisition Specialist"),
    ("Sales Executive", "Sales", "Enterprise Account Executive"),
    ("Marketing Executive", "Marketing", "Growth Marketing Lead"),
]

CANDIDATE_SKILLS_POOL = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "MySQL",
    "PostgreSQL", "AWS", "Docker", "Kubernetes", "Figma", "UI/UX", "Java", "C++",
    "Git", "REST API", "GraphQL", "CI/CD", "Redis", "Tailwind CSS", "HTML5/CSS3"
]

CITIES = [
    ("Bengaluru", "Karnataka"),
    ("Hyderabad", "Telangana"),
    ("Mumbai", "Maharashtra"),
    ("Gurugram", "Haryana"),
    ("Chennai", "Tamil Nadu"),
    ("Pune", "Maharashtra"),
    ("Delhi NCR", "Delhi"),
]

FIRST_NAMES = [
    "Aarav", "Priya", "Vikram", "Ananya", "Rohan", "Neha", "Rahul", "Sneha", "Karan", "Pooja",
    "Aditya", "Riya", "Amit", "Kavya", "Siddharth", "Divya", "Arjun", "Meera", "Varun", "Tanvi",
    "Yash", "Ishita", "Deepak", "Nisha", "Gaurav", "Simran", "Manish", "Shweta", "Rajesh", "Swati",
    "Alex", "Sarah", "David", "Emma", "Michael", "Olivia", "Daniel", "Sophia", "James", "Emily",
    "John", "Jessica", "Robert", "Amanda", "William", "Ashley", "Joseph", "Stephanie", "Thomas", "Nicole"
]

LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Verma", "Singh", "Gupta", "Kumar", "Joshi", "Mehta", "Rao",
    "Nair", "Iyer", "Chopra", "Malhotra", "Deshmukh", "Bhat", "Kulkarni", "Aggarwal", "Pillai", "Das",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"
]


async def seed_database(reset: bool = False):
    discover_models()
    print("=" * 75)
    print(" [SEEDER] Starting GetWorxs Production Test Data Seeder")
    print("=" * 75)

    async with get_async_db_context() as db:
        if reset:
            print(" [RESET] Cleaning existing database test records...")
            await db.execute(delete(Notification))
            await db.execute(delete(Application))
            await db.execute(delete(Job))
            await db.execute(delete(CompanySubscription))
            await db.execute(delete(RecruiterProfile))
            await db.execute(delete(EmployerProfile))
            await db.execute(delete(CandidateProfile))
            await db.execute(delete(Company))
            # Delete non-admin users
            await db.execute(delete(User).where(User.role != UserRole.ADMIN))
            await db.commit()
            print(" [OK] Database reset complete.")

        # -------------------------------------------------------------------------
        # 1. Ensure Subscription Plans exist (Starter, Professional, Enterprise)
        # -------------------------------------------------------------------------
        plans_data = [
            {
                "plan_code": "starter",
                "name": "Starter Plan",
                "description": "Essential hiring toolset for growing startups & boutiques.",
                "price_usd": 199.00,
                "price_inr": 14999.00,
                "duration_days": 30,
                "job_posting_limit": 10,
                "recruiter_limit": 2,
                "resume_views_limit": 100,
                "ai_credits": 200,
                "badge": "Basic",
                "features_json": json.dumps(["10 Active Job Listings", "2 Recruiter Seats", "100 Candidate Resume Views", "200 AI Hiring Credits"])
            },
            {
                "plan_code": "professional",
                "name": "Professional Plan",
                "description": "Complete recruitment suite for mid-sized growth companies.",
                "price_usd": 499.00,
                "price_inr": 39999.00,
                "duration_days": 30,
                "job_posting_limit": 100,
                "recruiter_limit": 10,
                "resume_views_limit": 1000,
                "ai_credits": 1000,
                "badge": "Most Popular",
                "features_json": json.dumps(["100 Active Job Listings", "10 Recruiter Seats", "1,000 Candidate Resume Views", "1,000 AI Hiring Credits"])
            },
            {
                "plan_code": "enterprise",
                "name": "Enterprise Plan",
                "description": "Unlimited scale, dedicated account management & custom workflows.",
                "price_usd": 999.00,
                "price_inr": 79999.00,
                "duration_days": 365,
                "job_posting_limit": -1,
                "recruiter_limit": -1,
                "resume_views_limit": 10000,
                "ai_credits": 10000,
                "badge": "Best Value",
                "features_json": json.dumps(["Unlimited Job Listings", "Unlimited Recruiter Seats", "10,000 Candidate Resume Views", "10,000 AI Hiring Credits"])
            }
        ]

        plans_map = {}
        for pd in plans_data:
            res = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.plan_code == pd["plan_code"]))
            p = res.scalar_one_or_none()
            if not p:
                p = SubscriptionPlan(
                    plan_code=pd["plan_code"],
                    name=pd["name"],
                    description=pd["description"],
                    price_usd=pd["price_usd"],
                    price_inr=pd["price_inr"],
                    duration_days=pd["duration_days"],
                    job_posting_limit=pd["job_posting_limit"],
                    recruiter_limit=pd["recruiter_limit"],
                    resume_views_limit=pd["resume_views_limit"],
                    ai_credits=pd["ai_credits"],
                    badge=pd["badge"],
                    features_json=pd["features_json"],
                    is_active=True,
                )
                db.add(p)
                await db.flush()
            plans_map[pd["plan_code"]] = p

        await db.commit()

        # -------------------------------------------------------------------------
        # 2. Seed 5 Approved Companies
        # -------------------------------------------------------------------------
        print("\n [STEP 1/6] Seeding 5 Approved Enterprise Companies...")
        companies_data = [
            {
                "name": "Congi Hub Private Limited",
                "legal_name": "Congi Hub Technologies Pvt Ltd",
                "code": "CMP-CONGIHUB-01",
                "industry": "Software & Technology",
                "size": "250-500",
                "website": "https://congihub.com",
                "email": "contact@congihub.com",
                "phone": "+91 80 4123 8890",
                "city": "Bengaluru", "state": "Karnataka", "country": "India",
                "address": "Tech Park Tower B, Outer Ring Road",
                "logo": "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80",
                "description": "Enterprise cloud platform providing Next-Gen AI recruitment automation and ATS systems."
            },
            {
                "name": "NexGen AI Technologies",
                "legal_name": "NexGen Artificial Intelligence Solutions Pvt Ltd",
                "code": "CMP-NEXGEN-02",
                "industry": "Artificial Intelligence & Data Science",
                "size": "100-250",
                "website": "https://nexgenai.io",
                "email": "hr@nexgenai.io",
                "phone": "+91 40 4889 1200",
                "city": "Hyderabad", "state": "Telangana", "country": "India",
                "address": "HITEC City Phase 2",
                "logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
                "description": "Leading AI research laboratory specializing in Large Language Models and Deep Learning pipelines."
            },
            {
                "name": "CloudScale Solutions",
                "legal_name": "CloudScale Global Infrastructure Services India Pvt Ltd",
                "code": "CMP-CLOUDSCALE-03",
                "industry": "Cloud & Enterprise Infrastructure",
                "size": "500-1000",
                "website": "https://cloudscale.tech",
                "email": "careers@cloudscale.tech",
                "phone": "+91 22 6789 4433",
                "city": "Mumbai", "state": "Maharashtra", "country": "India",
                "address": "Bandra Kurla Complex (BKC)",
                "logo": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
                "description": "Global DevOps, Kubernetes orchestration, and multi-cloud transformation enterprise partner."
            },
            {
                "name": "FinPulse Innovations",
                "legal_name": "FinPulse Financial Systems & Services India Pvt Ltd",
                "code": "CMP-FINPULSE-04",
                "industry": "Financial Technology & Banking",
                "size": "50-100",
                "website": "https://finpulse.co",
                "email": "talent@finpulse.co",
                "phone": "+91 124 4567 8900",
                "city": "Gurugram", "state": "Haryana", "country": "India",
                "address": "Cyber City Building 10",
                "logo": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
                "description": "High-frequency trading, automated banking infrastructure, and digital payment gateway innovator."
            },
            {
                "name": "CyberShield Systems",
                "legal_name": "CyberShield Managed Cyber Security Services Pvt Ltd",
                "code": "CMP-CYBERSHIELD-05",
                "industry": "Cybersecurity & Managed Defence",
                "size": "100-250",
                "website": "https://cybershield.security",
                "email": "hiring@cybershield.security",
                "phone": "+91 44 2890 5511",
                "city": "Chennai", "state": "Tamil Nadu", "country": "India",
                "address": "OMR IT Corridor, Taramani",
                "logo": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80",
                "description": "Enterprise SOC Operations, penetration testing, threat hunting, and Zero Trust architecture provider."
            }
        ]

        companies = []
        for cd in companies_data:
            res = await db.execute(select(Company).where(Company.company_code == cd["code"]))
            comp = res.scalar_one_or_none()
            if not comp:
                comp = Company(
                    name=cd["name"],
                    legal_name=cd["legal_name"],
                    company_code=cd["code"],
                    industry=cd["industry"],
                    company_size=cd["size"],
                    website=cd["website"],
                    email=cd["email"],
                    phone=cd["phone"],
                    city=cd["city"],
                    state=cd["state"],
                    country=cd["country"],
                    address=cd["address"],
                    postal_code="560001",
                    logo_url=cd["logo"],
                    description=cd["description"],
                    approval_status=CompanyStatus.APPROVED,
                    is_verified=True,
                    status=CompanyStatus.ACTIVE,
                )
                db.add(comp)
                await db.flush()
            companies.append(comp)
            print(f"   * Company [{comp.id}]: {comp.name}")

        await db.commit()

        # -------------------------------------------------------------------------
        # 3. Seed Employers & Recruiters
        # -------------------------------------------------------------------------
        print("\n [STEP 2/6] Seeding 5 Employers & 5 Recruiters linked to Companies...")
        default_password_hash = hash_password("Employer123!Password")
        recruiter_password_hash = hash_password("Recruiter123!Password")

        employers = []
        recruiters = []

        for idx, comp in enumerate(companies):
            emp_email = comp.email.replace("contact@", "employer@").replace("hr@", "employer@").replace("careers@", "employer@").replace("talent@", "employer@").replace("hiring@", "employer@")
            rec_email = comp.email.replace("contact@", "recruiter@").replace("hr@", "recruiter@").replace("careers@", "recruiter@").replace("talent@", "recruiter@").replace("hiring@", "recruiter@")

            # Employer
            emp_res = await db.execute(select(User).where(User.email == emp_email))
            emp_user = emp_res.scalar_one_or_none()
            if not emp_user:
                emp_user = User(
                    email=emp_email,
                    password_hash=default_password_hash,
                    role=UserRole.EMPLOYER,
                    name=f"Employer Lead ({comp.name.split()[0]})",
                    must_change_password=False,
                    status="active"
                )
                db.add(emp_user)
                await db.flush()
                # Profile company link
                emp_user.employer_profile.company_id = comp.id
                emp_user.employer_profile.company_name = comp.name
                await db.flush()

            # Active Subscription Assignment based on Company Index:
            # Company A (0) -> Starter
            # Company B (1) -> Professional
            # Company C (2) -> Enterprise
            # Company D (3) -> Professional
            # Company E (4) -> Starter
            plan_assignments = ["starter", "professional", "enterprise", "professional", "starter"]
            assigned_plan_code = plan_assignments[idx % len(plan_assignments)]
            assigned_plan = plans_map[assigned_plan_code]

            sub_res = await db.execute(select(CompanySubscription).where(CompanySubscription.company_id == comp.id))
            sub = sub_res.scalar_one_or_none()
            if not sub:
                sub = CompanySubscription(
                    company_id=comp.id,
                    plan_id=assigned_plan.id,
                    status=SubscriptionStatus.ACTIVE,
                    start_date=datetime.now(timezone.utc) - timedelta(days=15),
                    end_date=datetime.now(timezone.utc) + timedelta(days=350),
                    auto_renew=True,
                    jobs_posted_count=50 if assigned_plan_code == "enterprise" else (18 if assigned_plan_code == "professional" else 3),
                    recruiters_count=1 if assigned_plan_code == "starter" else 2,
                    ai_credits_used=120 if assigned_plan_code == "starter" else (420 if assigned_plan_code == "professional" else 1500)
                )
                db.add(sub)
                await db.flush()

            employers.append(emp_user)

            # Recruiter
            rec_res = await db.execute(select(User).where(User.email == rec_email))
            rec_user = rec_res.scalar_one_or_none()
            if not rec_user:
                rec_user = User(
                    email=rec_email,
                    password_hash=recruiter_password_hash,
                    role=UserRole.RECRUITER,
                    name=f"Recruiter ({comp.name.split()[0]})",
                    must_change_password=False,
                    status="active"
                )
                db.add(rec_user)
                await db.flush()
                rec_user.recruiter_profile.company_id = comp.id
                rec_user.recruiter_profile.company_name = comp.name
                await db.flush()

            recruiters.append(rec_user)

            print(f"   * Employer: {emp_email} | Recruiter: {rec_email} -> Linked to [{comp.name}]")

        await db.commit()

        # -------------------------------------------------------------------------
        # 4. Seed 250 Published Jobs (50 per company)
        # -------------------------------------------------------------------------
        print("\n [STEP 3/6] Seeding 250 Active Published Jobs (50 per Company)...")
        all_jobs = []
        job_count = 0

        for comp_idx, comp in enumerate(companies):
            emp = employers[comp_idx]
            rec = recruiters[comp_idx]

            for j_idx in range(1, 51):
                cat_name, dept_name, role_title = JOB_CATEGORIES[(j_idx - 1) % len(JOB_CATEGORIES)]
                job_title = f"{cat_name} - Level {((j_idx - 1) % 5) + 1} ({comp.name.split()[0]})"
                internal_code = f"JOB-{comp.id}-{j_idx:03d}"

                city, state = CITIES[j_idx % len(CITIES)]
                exp_min = random.choice([0, 1, 2, 3, 5])
                exp_max = exp_min + random.choice([2, 3, 4, 5])
                sal_min = random.choice([60000, 80000, 100000, 120000, 150000])
                sal_max = sal_min + random.choice([20000, 30000, 50000, 70000])
                work_mode = random.choice(["Onsite", "Hybrid", "Remote"])
                emp_type = random.choice(["Full-Time", "Full-Time", "Contract", "Part-Time"])

                selected_skills = random.sample(CANDIDATE_SKILLS_POOL, k=random.randint(4, 7))

                job_stmt = select(Job).where(Job.internal_job_id == internal_code)
                existing_job = (await db.execute(job_stmt)).scalar_one_or_none()

                if not existing_job:
                    job = Job(
                        title=job_title,
                        department=dept_name,
                        role=role_title,
                        employment_type=emp_type,
                        experience_min=exp_min,
                        experience_max=exp_max,
                        work_mode=work_mode,
                        city=city,
                        state=state,
                        country="India",
                        salary_min=sal_min,
                        salary_max=sal_max,
                        salary_currency="USD",
                        show_salary=True,
                        openings=random.randint(1, 8),
                        priority=random.choice(["High", "Medium", "Urgent"]),
                        deadline=datetime.now(timezone.utc) + timedelta(days=random.randint(30, 90)),
                        education="Bachelor's / Master's degree in Computer Science, Engineering or related field.",
                        skills_json=json.dumps(selected_skills),
                        required_skills=", ".join(selected_skills[:3]),
                        preferred_skills=", ".join(selected_skills[3:]),
                        summary=f"We are hiring a talented {job_title} to join our growing product engineering team at {comp.name}.",
                        responsibilities="* Lead technical architecture and development of resilient software components.\n* Collaborate with cross-functional teams to deliver scale products.\n* Drive automated testing and high code quality standards.",
                        hiring_manager_name=emp.name,
                        hiring_manager_email=emp.email,
                        assigned_recruiter_id=rec.id,
                        visibility="Public",
                        internal_job_id=internal_code,
                        status="active",
                        created_by_id=emp.id,
                        employer_id=emp.id,
                        company_id=comp.id,
                    )
                    db.add(job)
                    await db.flush()
                    all_jobs.append(job)
                else:
                    all_jobs.append(existing_job)

                job_count += 1

            print(f"   * Seeded 50 published jobs for [{comp.name}]")

        await db.commit()
        print(f"   [OK] Total 250 jobs persisted into database.")

        # -------------------------------------------------------------------------
        # 5. Seed 50 Candidate Accounts
        # -------------------------------------------------------------------------
        print("\n [STEP 4/6] Seeding 50 Candidate Accounts with complete profiles...")
        cand_password_hash = hash_password("Password123!")
        candidates = []

        for c_idx in range(1, 51):
            fn = FIRST_NAMES[(c_idx - 1) % len(FIRST_NAMES)]
            ln = LAST_NAMES[(c_idx - 1) % len(LAST_NAMES)]
            cand_name = f"{fn} {ln}"
            cand_email = f"candidate{c_idx}@getworxs.com"

            cand_res = await db.execute(select(User).where(User.email == cand_email))
            cand_user = cand_res.scalar_one_or_none()

            if not cand_user:
                cand_user = User(
                    email=cand_email,
                    password_hash=cand_password_hash,
                    role=UserRole.CANDIDATE,
                    name=cand_name,
                    must_change_password=False,
                    status="active"
                )
                db.add(cand_user)
                await db.flush()

                # Populate detailed CandidateProfile
                city, state = CITIES[c_idx % len(CITIES)]
                cand_skills = random.sample(CANDIDATE_SKILLS_POOL, k=random.randint(4, 8))
                completion = random.randint(80, 100)

                profile = cand_user.candidate_profile
                if profile:
                    profile.name = cand_name
                    profile.phone = f"+91 98765 {10000 + c_idx}"
                    profile.country = "India"
                    profile.state = state
                    profile.city = city
                    profile.current_role = JOB_CATEGORIES[(c_idx - 1) % len(JOB_CATEGORIES)][0]
                    profile.total_experience = f"{random.randint(1, 8)} years"
                    profile.preferred_job_role = JOB_CATEGORIES[(c_idx - 1) % len(JOB_CATEGORIES)][0]
                    profile.preferred_location = city
                    profile.expected_salary = f"${random.randint(70, 140)}k/yr"
                    profile.highest_qualification = "B.Tech in Computer Science"
                    profile.university = "IIT / NIT State Technological University"
                    profile.graduation_year = str(2018 + (c_idx % 6))
                    profile.resume_url = f"https://example.com/resumes/resume_{c_idx}.pdf"
                    profile.linkedin_url = f"https://linkedin.com/in/{fn.lower()}-{ln.lower()}-{c_idx}"
                    profile.portfolio_url = f"https://github.com/{fn.lower()}{c_idx}"
                    profile.photo_url = f"https://images.unsplash.com/photo-{1500000000000 + (c_idx * 12345)}?w=150&auto=format&fit=crop&q=80"
                    profile.skills_json = cand_skills
                    profile.profile_completion_percentage = completion
                    profile.profile_last_updated = datetime.now(timezone.utc)
                    await db.flush()

            candidates.append(cand_user)

        await db.commit()
        print(f"   * Seeded 50 candidate accounts with 80-100% complete ATS profiles.")

        # -------------------------------------------------------------------------
        # 6. Seed 150 - 250 Applications across Candidates & Jobs
        # -------------------------------------------------------------------------
        print("\n [STEP 5/6] Seeding 200 Real Candidate Applications...")
        app_statuses = [
            ApplicationStatus.APPLIED,
            ApplicationStatus.APPLIED,
            ApplicationStatus.VIEWED,
            ApplicationStatus.VIEWED,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.REJECTED
        ]

        app_count = 0
        for cand in candidates:
            # Candidate applies for 3 to 5 random jobs
            applied_jobs = random.sample(all_jobs, k=random.randint(3, 5))
            for job in applied_jobs:
                ref_code = f"APP-{cand.id:03d}-{job.id:03d}-{random.randint(100, 999)}"

                app_res = await db.execute(select(Application).where(Application.application_reference == ref_code))
                if not app_res.scalar_one_or_none():
                    chosen_status = random.choice(app_statuses)
                    app = Application(
                        candidate_id=cand.id,
                        job_id=job.id,
                        company_id=job.company_id,
                        employer_id=job.employer_id,
                        recruiter_id=job.assigned_recruiter_id,
                        resume_url=cand.candidate_profile.resume_url if cand.candidate_profile else "https://example.com/resume.pdf",
                        cover_letter=f"Dear Hiring Team at {job.company.name if job.company else 'Company'},\n\nI am excited to submit my candidate proposal for the {job.title} position.",
                        status=chosen_status,
                        applied_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20)),
                        status_history_json=[
                            {"status": "Applied", "changed_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(5, 20))).isoformat(), "changed_by": cand.email, "note": "Application submitted via platform."},
                            {"status": chosen_status.value, "changed_at": datetime.now(timezone.utc).isoformat(), "changed_by": "system", "note": f"Stage updated to {chosen_status.value}."}
                        ],
                        application_reference=ref_code
                    )
                    db.add(app)
                    app_count += 1

        await db.commit()
        print(f"   * Seeded {app_count} candidate job applications across pipeline stages.")

        # -------------------------------------------------------------------------
        # 7. Seed Sample Notifications
        # -------------------------------------------------------------------------
        print("\n [STEP 6/6] Generating Sample Real Notifications...")
        notification_count = 0

        # Sample for Employers
        for emp in employers:
            n1 = Notification(
                recipient_id=emp.id,
                type=NotificationType.APPLICATION_RECEIVED,
                title="New Candidate Application Received",
                message="Candidates have submitted proposals for your active published jobs.",
                entity_type="job",
                entity_id=1,
                is_read=False
            )
            db.add(n1)
            notification_count += 1

        # Sample for Recruiters
        for rec in recruiters:
            n2 = Notification(
                recipient_id=rec.id,
                type=NotificationType.RECRUITER_APPLICATION_ASSIGNED,
                title="Candidates Assigned to Pipeline",
                message="New applications assigned to your recruiting queue for review.",
                entity_type="application",
                entity_id=1,
                is_read=False
            )
            db.add(n2)
            notification_count += 1

        # Sample for Candidates
        for cand in candidates[:15]:
            n3 = Notification(
                recipient_id=cand.id,
                type=NotificationType.APPLICATION_STATUS_CHANGE,
                title="Application Status Updated",
                message="Your job application has been reviewed by the enterprise hiring team.",
                entity_type="application",
                entity_id=1,
                is_read=False
            )
            db.add(n3)
            notification_count += 1

        await db.commit()
        print(f"   * Seeded {notification_count} live notifications.")

    print("\n" + "=" * 75)
    print(" SUCCESS: Production Test Data Seeder Completed Successfully!")
    print("=" * 75)
    print(" Summary of Database Records:")
    print("   * Approved Companies: 5")
    print("   * Active Employers:   5 (Logins: employer@congihub.com / Employer123!Password, etc.)")
    print("   * Active Recruiters:  5 (Logins: recruiter@congihub.com / Recruiter123!Password, etc.)")
    print(f"   * Published Jobs:     250 total (50 per company)")
    print("   * Candidate Profiles: 50 (Logins: candidate1@getworxs.com / Password123!, etc.)")
    print(f"   * Applications:       {app_count} applications across pipeline")
    print("=" * 75)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GetWorxs Production Test Data Seeder")
    parser.add_argument("--reset", action="store_true", help="Truncate and reset existing test data before seeding")
    args = parser.parse_args()

    asyncio.run(seed_database(reset=args.reset))
