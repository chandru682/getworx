import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
params = {
    'name': 'Aisha Khan',
    'email': 'candidate1@getworxs.com',
    'password': 'Candidate123!',
    'role': 'CANDIDATE',
    'photo_url': 'https://example.com/avatar.jpg',
    'phone': '+91 98765 43210',
    'dob': '1993-08-24',
    'gender': 'Female',
    'country': 'India',
    'state': 'Karnataka',
    'city': 'Bangalore',
    'current_role': 'Full Stack Engineer',
    'total_experience': '4 Years',
    'preferred_job_role': 'Senior Full Stack Developer',
    'preferred_location': 'Remote',
    'expected_salary': '₹18,00,000',
    'highest_qualification': 'B.Tech Computer Science',
    'university': 'Indian Institute of Technology',
    'graduation_year': '2021',
    'resume_url': 'https://example.com/resume.pdf',
    'linkedin_url': 'https://www.linkedin.com/in/aishakhan',
    'portfolio_url': 'https://aishakhan.dev',
    'skills': ['React', 'Node.js', 'TypeScript', 'AWS'],
    'languages': ['English', 'Hindi'],
    'certifications': ['AWS Certified Developer', 'Certified ScrumMaster'],
}
resp = client.post('/api/v1/auth/register', json=params)
print('status', resp.status_code)
print(json.dumps(resp.json(), indent=2))
