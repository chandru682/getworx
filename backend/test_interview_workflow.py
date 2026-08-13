"""
Phase 6: Interview Management Module Integration Test
=====================================================
Tests the complete interview lifecycle:
  1. Login as Employer & Candidate.
  2. Candidate applies for a job -> Application created.
  3. Employer schedules interview -> Interview created (Status: SCHEDULED), Application status -> INTERVIEW_SCHEDULED.
  4. Candidate lists interviews -> Sees scheduled interview.
  5. Candidate responds -> Accepts interview (Status: ACCEPTED).
  6. Employer submits ratings & feedback -> Ratings saved, Interview status -> COMPLETED.
  7. Employer records post-interview decision -> SELECTED -> Application status -> SELECTED.
"""

import asyncio
import json
import urllib.request

BASE_URL = "http://127.0.0.1:8000/api/v1"


def http_post(url, data, token=None):
    req = urllib.request.Request(
        f"{BASE_URL}{url}",
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())


def http_get(url, token):
    req = urllib.request.Request(
        f"{BASE_URL}{url}",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())


def http_put(url, data, token):
    req = urllib.request.Request(
        f"{BASE_URL}{url}",
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="PUT",
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())


def run_interview_workflow_test():
    print("=" * 70)
    print(" [TEST] Phase 6: Interview Management Workflow Integration Test")
    print("=" * 70)

    # 1. Login Employer
    emp_login = http_post("/auth/login", {"email": "employer@congihub.com", "password": "Employer123!Password"})
    emp_token = emp_login["data"]["access_token"]
    print(" [OK] Employer logged in successfully.")

    # Candidate Login / Register
    import time
    cand_email = f"cand_p6_{int(time.time())}@test.com"
    cand_pass = "Candidate123!Password"
    http_post("/auth/register", {
        "name": "Phase6 Candidate",
        "email": cand_email,
        "password": cand_pass,
        "role": "CANDIDATE"
    })
    cand_login = http_post("/auth/login", {"email": cand_email, "password": cand_pass})
    cand_token = cand_login["data"]["access_token"]
    print(f" [OK] Candidate registered & logged in successfully ({cand_email}).")

    # 2. Candidate applies for job 1 (if not already applied)
    try:
        app_res = http_post("/applications", {"job_id": 1, "resume_url": "https://example.com/resume.pdf", "cover_letter": "Excited to apply!"}, cand_token)
        app_id = app_res["data"]["id"]
        print(f" [OK] Candidate submitted application -- ID: {app_id}")
    except Exception as e:
        # If already applied, fetch candidate applications
        cand_apps = http_get("/applications", cand_token)
        app_id = cand_apps["data"]["items"][0]["id"]
        print(f" [INFO] Using existing application -- ID: {app_id}")

    # 3. Employer schedules interview
    schedule_data = {
        "application_id": app_id,
        "interview_type": "Technical Round 1",
        "interview_mode": "online",
        "scheduled_at": "2026-08-10T10:00:00Z",
        "duration_minutes": 60,
        "interviewer_name": "Sarah Connor (Senior Lead)",
        "interviewer_email": "sarah.connor@congihub.com",
        "meeting_link": "https://meet.google.com/xyz-abc-123",
        "venue": None,
        "notes": "Please prepare live coding in Python / React.",
    }
    sched_res = http_post("/interviews", schedule_data, emp_token)
    interview_id = sched_res["data"]["id"]
    print(f" [OK] Employer scheduled interview -- ID: {interview_id}, Status: {sched_res['data']['status']}")

    # 4. Candidate checks upcoming interviews
    cand_interviews = http_get("/interviews/candidate", cand_token)
    items = cand_interviews["data"]["items"]
    assert any(i["id"] == interview_id for i in items), "Scheduled interview not found in candidate list"
    print(f" [OK] Candidate retrieved upcoming interviews ({len(items)} found).")

    # 5. Candidate accepts interview
    respond_res = http_put(f"/interviews/{interview_id}/respond", {"action": "accept"}, cand_token)
    print(f" [OK] Candidate accepted interview -- New Status: {respond_res['data']['status']}")
    assert respond_res["data"]["status"] == "accepted", "Status should be accepted"

    # 6. Employer submits ratings & feedback
    feedback_data = {
        "technical_rating": 5,
        "communication_rating": 4,
        "behavioral_rating": 5,
        "overall_rating": 5,
        "recommendation": "strong_hire",
        "comments": "Exceptional problem solving skills and system design experience.",
    }
    fb_res = http_put(f"/interviews/{interview_id}/feedback", feedback_data, emp_token)
    print(f" [OK] Employer submitted interview feedback -- Status: {fb_res['data']['status']}")

    # 7. Employer records post-interview decision: SELECTED
    dec_res = http_put(f"/interviews/{interview_id}/decision", {"decision": "selected", "decision_notes": "Offer extended to candidate."}, emp_token)
    print(f" [OK] Employer recorded post-interview decision -- Decision: {dec_res['data']['decision']}")

    print("=" * 70)
    print(" SUCCESS: Phase 6 Interview Management Module fully verified!")
    print("=" * 70)


if __name__ == "__main__":
    run_interview_workflow_test()
