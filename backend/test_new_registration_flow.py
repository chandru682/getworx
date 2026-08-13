"""Test script to verify company registration and immediate visibility in database & admin page."""
import asyncio
import httpx
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.companies.models import Company

async def test_company_registration():
    API_URL = "http://localhost:8000/api/v1"
    
    import time
    ts = int(time.time())
    emp_email = f"employer_test_{ts}@enterprise.com"
    emp_password = "Employer123!Password"
    comp_name = f"Acme Global Enterprise {ts}"
    
    async with httpx.AsyncClient() as client:
        # Register user
        reg_resp = await client.post(f"{API_URL}/auth/register", json={
            "name": f"Employer {ts}",
            "email": emp_email,
            "password": emp_password,
            "role": "EMPLOYER"
        })
        print(f"[REGISTER USER] Status: {reg_resp.status_code}")
        
        # Login user
        login_resp = await client.post(f"{API_URL}/auth/login", json={
            "email": emp_email,
            "password": emp_password
        })
        print(f"[LOGIN USER] Status: {login_resp.status_code}")
        login_data = login_resp.json()
        token = login_data["data"]["access_token"]
        
        # Register Company
        comp_payload = {
            "name": comp_name,
            "legal_name": f"{comp_name} Pvt Ltd",
            "industry": "Software & Technology",
            "company_size": "51-200",
            "email": emp_email,
            "phone": "9876543210",
            "country": "India",
            "state": "Tamil Nadu",
            "city": "Chennai",
            "address": "456 Enterprise Park",
            "postal_code": "600002"
        }
        
        comp_resp = await client.post(
            f"{API_URL}/companies",
            json=comp_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"[REGISTER COMPANY API] Status: {comp_resp.status_code}")
        print(f"[REGISTER COMPANY ERROR DETAILS]: {comp_resp.text}")
        comp_data = comp_resp.json()
        print(f"[COMPANY RESPONSE] ID: {comp_data.get('data', {}).get('id')}, Name: {comp_data.get('data', {}).get('name')}, Status: {comp_data.get('data', {}).get('approval_status')}")

    # 2. Direct MySQL DB Check
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Company).where(Company.name == comp_name))
        db_comp = res.scalars().first()
        assert db_comp is not None, "Company must be persisted in MySQL database"
        print(f"[DIRECT DB CHECK] Found in MySQL -> ID: {db_comp.id}, Code: {db_comp.company_code}, Status: {db_comp.approval_status}")

if __name__ == "__main__":
    asyncio.run(test_company_registration())
