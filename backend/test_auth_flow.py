import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app as fastapi_app
from app.core.base_model import Base
from app.core.database import get_db
import app.models 

# Test SQLite in-memory async database
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session
        await session.commit()


fastapi_app.dependency_overrides[get_db] = override_get_db


async def run_auth_tests():
    print("[TEST] Running Phase 2 Authentication Module End-to-End Tests...")

    # Create tables in test database
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # 1. Health Check Test
        res = await client.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("  - GET /api/v1/health passed")

        # 2. User Registration (Success)
        reg_payload = {
            "name": "Sarah Connor",
            "email": "sarah.connor@example.com",
            "password": "SecurePassword123!",
            "role": "CANDIDATE"
        }
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 201, f"Registration failed: {res.text}"
        data = res.json()["data"]
        assert data["email"] == "sarah.connor@example.com"
        assert data["role"] == "CANDIDATE"
        print("  - POST /api/v1/auth/register (Success) passed")

        # 3. User Registration (Duplicate Email Error)
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 409, f"Duplicate email check failed: {res.text}"
        assert res.json()["error"]["code"] == "CONFLICT"
        print("  - POST /api/v1/auth/register (Duplicate Email 409) passed")

        # 4. User Registration (Weak Password Error)
        weak_payload = {
            "name": "Weak User",
            "email": "weak@example.com",
            "password": "simple",
            "role": "CANDIDATE"
        }
        res = await client.post("/api/v1/auth/register", json=weak_payload)
        assert res.status_code == 422, f"Weak password check failed: {res.text}"
        print("  - POST /api/v1/auth/register (Weak Password 422) passed")

        # 5. Login (Success)
        login_payload = {
            "email": "sarah.connor@example.com",
            "password": "SecurePassword123!"
        }
        res = await client.post("/api/v1/auth/login", json=login_payload)
        assert res.status_code == 200, f"Login failed: {res.text}"
        tokens = res.json()["data"]
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
        assert access_token and refresh_token
        print("  - POST /api/v1/auth/login (Success) passed")

        # 6. Login (Invalid Credentials)
        invalid_login = {
            "email": "sarah.connor@example.com",
            "password": "WrongPassword999!"
        }
        res = await client.post("/api/v1/auth/login", json=invalid_login)
        assert res.status_code == 401, f"Invalid login check failed: {res.text}"
        print("  - POST /api/v1/auth/login (Invalid Credentials 401) passed")

        # 7. Get Current User /me (Success with Bearer Token)
        headers = {"Authorization": f"Bearer {access_token}"}
        res = await client.get("/api/v1/auth/me", headers=headers)
        assert res.status_code == 200, f"Get /me failed: {res.text}"
        user_info = res.json()["data"]
        assert user_info["email"] == "sarah.connor@example.com"
        print("  - GET /api/v1/auth/me (Protected Route 200) passed")

        # 8. Refresh Token (Success)
        res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert res.status_code == 200, f"Token refresh failed: {res.text}"
        new_tokens = res.json()["data"]
        new_access_token = new_tokens["access_token"]
        new_refresh_token = new_tokens["refresh_token"]
        assert new_access_token and new_refresh_token
        print("  - POST /api/v1/auth/refresh (Success) passed")

        # 9. Change Password (Success)
        change_pw_payload = {
            "current_password": "SecurePassword123!",
            "new_password": "BrandNewPassword456!"
        }
        new_headers = {"Authorization": f"Bearer {new_access_token}"}
        res = await client.post("/api/v1/auth/change-password", json=change_pw_payload, headers=new_headers)
        assert res.status_code == 200, f"Change password failed: {res.text}"
        print("  - POST /api/v1/auth/change-password (Success) passed")

        # 10. Login with New Password
        res = await client.post("/api/v1/auth/login", json={
            "email": "sarah.connor@example.com",
            "password": "BrandNewPassword456!"
        })
        assert res.status_code == 200, f"Login with new password failed: {res.text}"
        final_tokens = res.json()["data"]
        print("  - POST /api/v1/auth/login (With Updated Password) passed")

        # 11. Forgot Password Request
        res = await client.post("/api/v1/auth/forgot-password", json={"email": "sarah.connor@example.com"})
        assert res.status_code == 200, f"Forgot password failed: {res.text}"
        print("  - POST /api/v1/auth/forgot-password (Success) passed")

        # 12. Logout
        res = await client.post("/api/v1/auth/logout", json={"refresh_token": final_tokens["refresh_token"]})
        assert res.status_code == 200, f"Logout failed: {res.text}"
        print("  - POST /api/v1/auth/logout (Success) passed")

    print("\nSUCCESS: ALL PHASE 2 AUTHENTICATION MODULE TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_auth_tests())
