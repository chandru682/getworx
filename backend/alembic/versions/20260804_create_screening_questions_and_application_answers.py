"""create screening questions and application answers tables

Revision ID: 20260804_create_screening_questions_and_application_answers
Revises: 20260803_candidate_fields
Create Date: 2026-08-04 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '20260804_create_screening_questions_and_application_answers'
down_revision = '20260803_candidate_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'job_screening_questions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.String(length=50), nullable=False, server_default='paragraph'),
        sa.Column('options_json', sa.Text(), nullable=True),
        sa.Column('is_mandatory', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('is_knockout', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('preferred_answer', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
    )

    op.create_index('idx_job_screening_questions_job', 'job_screening_questions', ['job_id'])

    op.create_table(
        'application_answers',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('application_id', sa.Integer(), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('job_screening_questions.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('candidate_answer', sa.Text(), nullable=False),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
    )

    op.create_index('idx_application_answers_application', 'application_answers', ['application_id'])
    op.create_index('idx_application_answers_question', 'application_answers', ['question_id'])


def downgrade() -> None:
    op.drop_index('idx_application_answers_question', table_name='application_answers')
    op.drop_index('idx_application_answers_application', table_name='application_answers')
    op.drop_table('application_answers')

    op.drop_index('idx_job_screening_questions_job', table_name='job_screening_questions')
    op.drop_table('job_screening_questions')
