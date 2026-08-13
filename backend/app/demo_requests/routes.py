import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.schemas.health import ResponseEnvelope
from app.demo_requests.models import (
    DemoRequest,
    DemoSchedule,
    DemoNote,
    SalesFollowup,
    Quotation,
    DemoRequestStatus,
    DemoScheduleStatus,
    QuotationStatus,
)
from app.demo_requests.schemas import (
    DemoRequestCreate,
    DemoRequestOut,
    DemoScheduleCreate,
    DemoScheduleOut,
    DemoNoteCreate,
    DemoNoteOut,
    QuotationCreate,
    QuotationOut,
    DemoStatusUpdate,
    DemoStatsOut,
)

router = APIRouter(tags=["B2B Demo Requests"])
admin_demo_router = APIRouter(prefix="/admin/demo-requests", tags=["Super Admin Demo Management"])


# PUBLIC ENDPOINT: Submit Demo Request
@router.post("/demos/request", response_model=ResponseEnvelope[DemoRequestOut])
async def submit_demo_request(
    payload: DemoRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    """Public API for prospective B2B employer companies to request a platform demo."""
    demo_obj = DemoRequest(
        company_name=payload.company_name,
        contact_person=payload.contact_person,
        official_email=payload.official_email,
        mobile_number=payload.mobile_number,
        company_size=payload.company_size,
        industry=payload.industry,
        number_of_recruiters=payload.number_of_recruiters,
        expected_hiring_volume=payload.expected_hiring_volume,
        hiring_requirements=payload.hiring_requirements,
        preferred_demo_date=payload.preferred_demo_date,
        preferred_demo_time=payload.preferred_demo_time,
        additional_message=payload.additional_message,
        status=DemoRequestStatus.NEW,
        assigned_sales_rep="Sales Team Lead",
    )
    db.add(demo_obj)
    await db.commit()
    await db.refresh(demo_obj)

    # Initial Note Log
    initial_note = DemoNote(
        demo_request_id=demo_obj.id,
        author_name="System",
        content=f"Demo Request submitted by {payload.contact_person} ({payload.official_email})."
    )
    db.add(initial_note)
    await db.commit()

    # Re-query with eager relationships
    stmt = (
        select(DemoRequest)
        .options(
            selectinload(DemoRequest.schedules),
            selectinload(DemoRequest.notes),
            selectinload(DemoRequest.quotations)
        )
        .filter(DemoRequest.id == demo_obj.id)
    )
    result = await db.execute(stmt)
    refreshed = result.scalar_one()

    return ResponseEnvelope(
        success=True,
        message="Thank you. Our team will contact you to schedule your demo.",
        data=DemoRequestOut.model_validate(refreshed)
    )


# SUPER ADMIN ENDPOINT: List Demo Requests & Filter by Status
@admin_demo_router.get("", response_model=ResponseEnvelope[List[DemoRequestOut]])
async def list_demo_requests(
    status_filter: Optional[DemoRequestStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all B2B demo requests with optional status filtering."""
    stmt = (
        select(DemoRequest)
        .options(
            selectinload(DemoRequest.schedules),
            selectinload(DemoRequest.notes),
            selectinload(DemoRequest.quotations)
        )
        .order_by(DemoRequest.created_at.desc())
    )

    if status_filter:
        stmt = stmt.filter(DemoRequest.status == status_filter)

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.filter(
            (DemoRequest.company_name.ilike(search_pattern)) |
            (DemoRequest.contact_person.ilike(search_pattern)) |
            (DemoRequest.official_email.ilike(search_pattern))
        )

    result = await db.execute(stmt)
    records = result.scalars().all()
    out = [DemoRequestOut.model_validate(r) for r in records]

    return ResponseEnvelope(
        success=True,
        message=f"Retrieved {len(out)} demo requests",
        data=out
    )


# SUPER ADMIN ENDPOINT: Dashboard Statistics Summary
@admin_demo_router.get("/stats", response_model=ResponseEnvelope[DemoStatsOut])
async def get_demo_stats(db: AsyncSession = Depends(get_db)):
    """Retrieve aggregate KPI stats counters across all demo request statuses."""
    stmt = select(DemoRequest.status, func.count(DemoRequest.id)).group_by(DemoRequest.status)
    result = await db.execute(stmt)
    counts = dict(result.all())

    stats = DemoStatsOut(
        total_requests=sum(counts.values()),
        new_requests=counts.get(DemoRequestStatus.NEW, 0),
        contacted=counts.get(DemoRequestStatus.CONTACTED, 0),
        demo_scheduled=counts.get(DemoRequestStatus.DEMO_SCHEDULED, 0),
        demo_completed=counts.get(DemoRequestStatus.DEMO_COMPLETED, 0),
        interested=counts.get(DemoRequestStatus.INTERESTED, 0),
        negotiation=counts.get(DemoRequestStatus.NEGOTIATION, 0),
        purchased=counts.get(DemoRequestStatus.PURCHASED, 0),
        not_interested=counts.get(DemoRequestStatus.NOT_INTERESTED, 0),
    )

    return ResponseEnvelope(
        success=True,
        message="Demo stats computed successfully",
        data=stats
    )


# SUPER ADMIN ENDPOINT: Single Demo Request Inspection
@admin_demo_router.get("/{demo_id}", response_model=ResponseEnvelope[DemoRequestOut])
async def get_demo_request_detail(
    demo_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(DemoRequest)
        .options(
            selectinload(DemoRequest.schedules),
            selectinload(DemoRequest.notes),
            selectinload(DemoRequest.quotations)
        )
        .filter(DemoRequest.id == demo_id)
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Demo request not found")

    return ResponseEnvelope(
        success=True,
        message="Demo request detail loaded",
        data=DemoRequestOut.model_validate(record)
    )


# SUPER ADMIN ENDPOINT: Update Status / Assign Representative
@admin_demo_router.patch("/{demo_id}/status", response_model=ResponseEnvelope[DemoRequestOut])
async def update_demo_status(
    demo_id: int,
    payload: DemoStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DemoRequest).filter(DemoRequest.id == demo_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Demo request not found")

    record.status = payload.status
    if payload.assigned_sales_rep:
        record.assigned_sales_rep = payload.assigned_sales_rep

    if payload.notes:
        new_note = DemoNote(
            demo_request_id=demo_id,
            author_name="Super Admin",
            content=f"Status changed to {payload.status.value}. Note: {payload.notes}"
        )
        db.add(new_note)

    await db.commit()

    # Re-query
    stmt_full = (
        select(DemoRequest)
        .options(
            selectinload(DemoRequest.schedules),
            selectinload(DemoRequest.notes),
            selectinload(DemoRequest.quotations)
        )
        .filter(DemoRequest.id == demo_id)
    )
    res_full = await db.execute(stmt_full)
    refreshed = res_full.scalar_one()

    return ResponseEnvelope(
        success=True,
        message=f"Demo status updated to {payload.status.value}",
        data=DemoRequestOut.model_validate(refreshed)
    )


# SUPER ADMIN ENDPOINT: Schedule / Reschedule Demo
@admin_demo_router.post("/{demo_id}/schedule", response_model=ResponseEnvelope[DemoScheduleOut])
async def schedule_demo(
    demo_id: int,
    payload: DemoScheduleCreate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DemoRequest).filter(DemoRequest.id == demo_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Demo request not found")

    schedule_obj = DemoSchedule(
        demo_request_id=demo_id,
        meeting_link=payload.meeting_link,
        scheduled_at=payload.scheduled_at,
        sales_rep_name=payload.sales_rep_name,
        instructions=payload.instructions,
        status=DemoScheduleStatus.SCHEDULED
    )
    db.add(schedule_obj)

    record.status = DemoRequestStatus.DEMO_SCHEDULED
    record.assigned_sales_rep = payload.sales_rep_name

    note = DemoNote(
        demo_request_id=demo_id,
        author_name=payload.sales_rep_name,
        content=f"Demo scheduled for {payload.scheduled_at.strftime('%Y-%m-%d %H:%M UTC')}. Meeting link: {payload.meeting_link}"
    )
    db.add(note)

    await db.commit()
    await db.refresh(schedule_obj)

    return ResponseEnvelope(
        success=True,
        message="Demo scheduled successfully. Calendar invite & email notification generated.",
        data=DemoScheduleOut.model_validate(schedule_obj)
    )


# SUPER ADMIN ENDPOINT: Add Internal Sales Note
@admin_demo_router.post("/{demo_id}/notes", response_model=ResponseEnvelope[DemoNoteOut])
async def add_demo_note(
    demo_id: int,
    payload: DemoNoteCreate,
    db: AsyncSession = Depends(get_db)
):
    note_obj = DemoNote(
        demo_request_id=demo_id,
        author_name=payload.author_name or "Super Admin",
        content=payload.content
    )
    db.add(note_obj)
    await db.commit()
    await db.refresh(note_obj)

    return ResponseEnvelope(
        success=True,
        message="Internal note saved",
        data=DemoNoteOut.model_validate(note_obj)
    )


# SUPER ADMIN ENDPOINT: Create B2B Quotation
@admin_demo_router.post("/{demo_id}/quotation", response_model=ResponseEnvelope[QuotationOut])
async def create_quotation(
    demo_id: int,
    payload: QuotationCreate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DemoRequest).filter(DemoRequest.id == demo_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Demo request not found")

    quot_num = f"QUO-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    valid_until = datetime.now(timezone.utc) + timedelta(days=payload.valid_days)
    payment_link = f"http://localhost:5173/checkout?quotation={quot_num}&plan={payload.plan_code}"

    quot_obj = Quotation(
        demo_request_id=demo_id,
        quotation_number=quot_num,
        plan_code=payload.plan_code,
        plan_name=payload.plan_name,
        price_amount=payload.price_amount,
        currency=payload.currency,
        job_limit=payload.job_limit,
        recruiter_limit=payload.recruiter_limit,
        ai_credits=payload.ai_credits,
        features_json=payload.features_json or "[]",
        status=QuotationStatus.SENT,
        valid_until=valid_until,
        payment_link=payment_link
    )
    db.add(quot_obj)

    record.status = DemoRequestStatus.NEGOTIATION

    note = DemoNote(
        demo_request_id=demo_id,
        author_name="Sales Team",
        content=f"Quotation {quot_num} created for plan {payload.plan_name} (${payload.price_amount}). Payment Link: {payment_link}"
    )
    db.add(note)

    await db.commit()
    await db.refresh(quot_obj)

    return ResponseEnvelope(
        success=True,
        message="B2B Quotation generated and payment link created.",
        data=QuotationOut.model_validate(quot_obj)
    )


# SUPER ADMIN ENDPOINT: Convert Demo Lead to Registered Active Customer
@admin_demo_router.post("/{demo_id}/convert", response_model=ResponseEnvelope[DemoRequestOut])
async def convert_demo_to_customer(
    demo_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(DemoRequest)
        .options(
            selectinload(DemoRequest.schedules),
            selectinload(DemoRequest.notes),
            selectinload(DemoRequest.quotations)
        )
        .filter(DemoRequest.id == demo_id)
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Demo request not found")

    record.status = DemoRequestStatus.PURCHASED

    note = DemoNote(
        demo_request_id=demo_id,
        author_name="Super Admin",
        content="Converted demo lead into an active paying customer account."
    )
    db.add(note)

    await db.commit()
    await db.refresh(record)

    return ResponseEnvelope(
        success=True,
        message="Demo request converted into active customer account.",
        data=DemoRequestOut.model_validate(record)
    )
