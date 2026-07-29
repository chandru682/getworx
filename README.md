# GetWorxs — AI-Powered Global Recruitment Platform

GetWorxs is an enterprise-grade recruitment platform built with a modern React + TypeScript frontend and a clean-architecture Python FastAPI backend.

---

## 📁 Repository Structure

```
getworxs/
├── frontend/             # React + Vite + TypeScript Client
│   ├── src/              # UI Components (Candidate Portal, Recruiter Dashboard, Admin Console, Employer Console)
│   ├── public/           # Static Assets
│   ├── package.json      # Frontend Dependencies
│   └── vite.config.ts    # Vite Configuration
│
└── backend/              # Python 3.13+ FastAPI Production Backend
    ├── app/              # Clean Architecture Enterprise Modules
    │   ├── auth/         # Authentication, JWT, Security & RBAC
    │   ├── users/        # User Profile & Identity Management
    │   ├── companies/    # Company Directory & Verification
    │   ├── employers/    # Employer Portal APIs
    │   ├── recruiters/   # Recruiter Dashboard APIs
    │   ├── candidates/   # Candidate Portal APIs
    │   ├── jobs/         # Job Postings Engine
    │   ├── applications/ # Application Tracking System (ATS)
    │   ├── interviews/   # Interview Scheduling & Offers
    │   ├── notifications/# Notifications Engine
    │   ├── subscriptions/# Subscriptions & Payments
    │   ├── payments/     # Transactions & Billing
    │   ├── reports/      # Analytics & Reports
    │   ├── admin/        # Platform Admin Console APIs
    │   ├── ai/           # AI Core Engine (Phase 16)
    │   └── main.py       # FastAPI Engine Entrypoint
    ├── alembic/          # MySQL 8 Database Migrations
    ├── requirements.txt  # Python Backend Dependencies
    └── .env.example      # Environment Variables Template
```

---

## 🚀 Getting Started

### 1. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Running the Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/running/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- **API Documentation (Swagger UI)**: `http://localhost:8000/api/v1/docs`
- **ReDoc API Explorer**: `http://localhost:8000/api/v1/redoc`
- **System Health Check**: `http://localhost:8000/api/v1/health`
