import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    payload = {
        "name": "Aisha Khan",
        "email": "candidate1@getworxs.com",
        "password": "Candidate123!",
        "role": "CANDIDATE",
        "photo_url": "https://example.com/avatar.jpg",
        "phone": "+91 98765 43210",
        "dob": "1993-08-24",
        "gender": "Female",
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "current_role": "Full Stack Engineer",
        "total_experience": "4 Years",
        "preferred_job_role": "Senior Full Stack Developer",
        "preferred_location": "Remote",
        "expected_salary": "₹18,00,000",
        "highest_qualification": "B.Tech Computer Science",
        "university": "Indian Institute of Technology",
        "graduation_year": "2021",
        "resume_url": "https://example.com/resume.pdf",
        "linkedin_url": "https://www.linkedin.com/in/aishakhan",
        "portfolio_url": "https://aishakhan.dev",
        "skills": ["React", "Node.js", "TypeScript", "AWS"],
        "languages": ["English", "Hindi"],
        "certifications": ["AWS Certified Developer", "Certified ScrumMaster"],
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    print("register", resp.status_code, json.dumps(resp.json(), indent=2))
    if resp.status_code == 201:
        login = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]})
        print("login", login.status_code, json.dumps(login.json(), indent=2))
        if login.status_code == 200 and login.json().get("success"):
            token = login.json()["data"]["access_token"]
            profile = client.get("/api/v1/candidates/profile", headers={"Authorization": f"Bearer {token}"})
            print("profile", profile.status_code, json.dumps(profile.json(), indent=2))


if __name__ == "__main__":
    run_test()
