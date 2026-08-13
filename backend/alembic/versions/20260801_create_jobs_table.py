"""create jobs table

Revision ID: 20260801_create_jobs_table
Revises: 
Create Date: 2026-08-01 12:40:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '20260801_create_jobs_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),

        # Foreign keys
        sa.Column('employer_id', sa.Integer(), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('hiring_manager_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('assigned_recruiter_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),

        # Step 1 - Job Details
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('department', sa.String(length=128), nullable=True),
        sa.Column('role', sa.String(length=128), nullable=True),
        sa.Column('employment_type', sa.String(length=64), nullable=True),
        sa.Column('experience_min', sa.Integer(), nullable=True),
        sa.Column('experience_max', sa.Integer(), nullable=True),
        sa.Column('work_mode', sa.String(length=32), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('currency', sa.String(length=8), nullable=True),
        sa.Column('openings', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('hiring_priority', sa.String(length=32), nullable=True),
        sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True),

        # Step 2 - Preferred Candidate (JSON fields)
        sa.Column('education', sa.JSON(), nullable=True),
        sa.Column('skills', sa.JSON(), nullable=True),
        sa.Column('certifications', sa.JSON(), nullable=True),
        sa.Column('languages', sa.JSON(), nullable=True),
        sa.Column('industry_experience', sa.JSON(), nullable=True),
        sa.Column('notice_period', sa.String(length=64), nullable=True),
        sa.Column('current_location', sa.String(length=128), nullable=True),
        sa.Column('relocation_preference', sa.String(length=64), nullable=True),

        # Step 3 - Job Description
        sa.Column('about_company', sa.Text(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('responsibilities', sa.JSON(), nullable=True),
        sa.Column('required_skills', sa.JSON(), nullable=True),
        sa.Column('preferred_skills', sa.JSON(), nullable=True),
        sa.Column('benefits', sa.JSON(), nullable=True),
        sa.Column('working_hours', sa.String(length=128), nullable=True),

        # Step 4 - Screening Questions
        sa.Column('screening_questions', sa.JSON(), nullable=True),

        # Step 5 - Advanced Options
        sa.Column('visibility', sa.String(length=32), nullable=False, server_default='public'),
        sa.Column('internal_job_id', sa.String(length=128), nullable=True),
        sa.Column('auto_close_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('prevent_duplicate_applications', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default=sa.text('1')),

        # Publication
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),

        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
    )

    # Indexes
    op.create_index('idx_jobs_employer_status', 'jobs', ['employer_id', 'status'])
    op.create_index('idx_jobs_title', 'jobs', ['title'])
    op.create_index('idx_jobs_internal_job_id', 'jobs', ['internal_job_id'])


def downgrade() -> None:
    op.drop_index('idx_jobs_internal_job_id', table_name='jobs')
    op.drop_index('idx_jobs_title', table_name='jobs')
    op.drop_index('idx_jobs_employer_status', table_name='jobs')
    op.drop_table('jobs')
