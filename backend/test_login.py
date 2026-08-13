import httpx
import asyncio

async def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    
    print('--- Testing invalid user ---')
    r = httpx.post(url, json={"email": "nonexistent@test.com", "password": "Password123!"})
    print(r.status_code, r.json())
    
    print('--- Testing invalid password 1st time ---')
    r = httpx.post(url, json={"email": "candidate1@test.com", "password": "WrongPassword!"})
    print(r.status_code, r.json())
    
    print('--- Testing invalid password 5 more times (lockout) ---')
    for i in range(5):
        r = httpx.post(url, json={"email": "candidate1@test.com", "password": "WrongPassword!"})
        print(f"Attempt {i+2}:", r.status_code, r.json())

    print('--- Testing locked account with correct password ---')
    r = httpx.post(url, json={"email": "candidate1@test.com", "password": "Password123!"})
    print(r.status_code, r.json())

if __name__ == '__main__':
    asyncio.run(test_login())
