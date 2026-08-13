"""create applications table

Revision ID: 20260802_create_applications_table
Revises: 20260801_create_jobs_table
Create Date: 2026-08-02 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '20260802_create_applications_table'
down_revision = '20260801_create_jobs_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),

        sa.Column('candidate_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('company_id', sa.Integer(), sa.ForeignKey('companies.id', ondelete='SET NULL'), nullable=True),
        sa.Column('employer_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('recruiter_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),

        sa.Column('resume_url', sa.String(length=512), nullable=True),
        sa.Column('cover_letter', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('Applied', 'Viewed', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Hired', 'Rejected', 'Withdrawn', name='applicationstatus'), nullable=False, server_default='Applied'),
        sa.Column('applied_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status_history_json', sa.JSON(), nullable=True),
        sa.Column('notes_json', sa.JSON(), nullable=True),
        sa.Column('application_reference', sa.String(length=100), nullable=False, unique=True),

        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
    )

    op.create_index('idx_applications_candidate', 'applications', ['candidate_id'])
    op.create_index('idx_applications_job', 'applications', ['job_id'])
    op.create_index('idx_applications_company', 'applications', ['company_id'])
    op.create_index('idx_applications_recruiter', 'applications', ['recruiter_id'])


def downgrade() -> None:
    op.drop_index('idx_applications_recruiter', table_name='applications')
    op.drop_index('idx_applications_company', table_name='applications')
    op.drop_index('idx_applications_job', table_name='applications')
    op.drop_index('idx_applications_candidate', table_name='applications')
    op.drop_table('applications')
