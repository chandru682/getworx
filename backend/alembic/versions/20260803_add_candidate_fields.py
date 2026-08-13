"""add candidate profile columns

Revision ID: 20260803_candidate_fields
Revises: 20260801_create_jobs_table
Create Date: 2026-08-03 14:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260803_candidate_fields'
down_revision = '20260801_create_jobs_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('candidate_profiles', sa.Column('photo_url', sa.String(length=255), nullable=True))
    op.add_column('candidate_profiles', sa.Column('phone', sa.String(length=32), nullable=True))
    op.add_column('candidate_profiles', sa.Column('dob', sa.String(length=32), nullable=True))
    op.add_column('candidate_profiles', sa.Column('gender', sa.String(length=32), nullable=True))
    op.add_column('candidate_profiles', sa.Column('country', sa.String(length=64), nullable=True))
    op.add_column('candidate_profiles', sa.Column('state', sa.String(length=64), nullable=True))
    op.add_column('candidate_profiles', sa.Column('city', sa.String(length=64), nullable=True))
    op.add_column('candidate_profiles', sa.Column('current_role', sa.String(length=128), nullable=True))
    op.add_column('candidate_profiles', sa.Column('total_experience', sa.String(length=64), nullable=True))
    op.add_column('candidate_profiles', sa.Column('preferred_job_role', sa.String(length=128), nullable=True))
    op.add_column('candidate_profiles', sa.Column('preferred_location', sa.String(length=128), nullable=True))
    op.add_column('candidate_profiles', sa.Column('expected_salary', sa.String(length=64), nullable=True))
    op.add_column('candidate_profiles', sa.Column('highest_qualification', sa.String(length=128), nullable=True))
    op.add_column('candidate_profiles', sa.Column('university', sa.String(length=128), nullable=True))
    op.add_column('candidate_profiles', sa.Column('graduation_year', sa.String(length=16), nullable=True))
    op.add_column('candidate_profiles', sa.Column('resume_url', sa.String(length=255), nullable=True))
    op.add_column('candidate_profiles', sa.Column('linkedin_url', sa.String(length=255), nullable=True))
    op.add_column('candidate_profiles', sa.Column('portfolio_url', sa.String(length=255), nullable=True))
    op.add_column('candidate_profiles', sa.Column('skills_json', sa.JSON(), nullable=True))
    op.add_column('candidate_profiles', sa.Column('languages_json', sa.JSON(), nullable=True))
    op.add_column('candidate_profiles', sa.Column('certifications_json', sa.JSON(), nullable=True))
    op.add_column('candidate_profiles', sa.Column('profile_completion_percentage', sa.Integer(), nullable=False, server_default=sa.text('0')))
    op.add_column('candidate_profiles', sa.Column('profile_last_updated', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('candidate_profiles', 'profile_last_updated')
    op.drop_column('candidate_profiles', 'profile_completion_percentage')
    op.drop_column('candidate_profiles', 'certifications_json')
    op.drop_column('candidate_profiles', 'languages_json')
    op.drop_column('candidate_profiles', 'skills_json')
    op.drop_column('candidate_profiles', 'portfolio_url')
    op.drop_column('candidate_profiles', 'linkedin_url')
    op.drop_column('candidate_profiles', 'resume_url')
    op.drop_column('candidate_profiles', 'graduation_year')
    op.drop_column('candidate_profiles', 'university')
    op.drop_column('candidate_profiles', 'highest_qualification')
    op.drop_column('candidate_profiles', 'expected_salary')
    op.drop_column('candidate_profiles', 'preferred_location')
    op.drop_column('candidate_profiles', 'preferred_job_role')
    op.drop_column('candidate_profiles', 'total_experience')
    op.drop_column('candidate_profiles', 'current_role')
    op.drop_column('candidate_profiles', 'city')
    op.drop_column('candidate_profiles', 'state')
    op.drop_column('candidate_profiles', 'country')
    op.drop_column('candidate_profiles', 'gender')
    op.drop_column('candidate_profiles', 'dob')
    op.drop_column('candidate_profiles', 'phone')
    op.drop_column('candidate_profiles', 'photo_url')
