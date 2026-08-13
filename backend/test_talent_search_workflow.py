import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.database.base import discover_models
discover_models()

from app.database.session import AsyncSessionLocal
from app.candidates.talent_service import TalentSearchService
from app.candidates.schemas import (
    TalentSearchFilterRequest,
    JobDescriptionMatchRequest,
)
from sqlalchemy import select
from app.auth.models import User


async def test_talent_search():
    print("=" * 80)
    print(" 🎯 STARTING TALENT SEARCH & DISCOVERY WORKFLOW TEST")
    print("=" * 80)

    async with AsyncSessionLocal() as db:
        user_stmt = select(User).where(User.deleted_at.is_(None)).limit(1)
        user = (await db.execute(user_stmt)).scalar_one_or_none()
        if not user:
            print("❌ No active users found in DB!")
            return

        company_id = getattr(user, "company_id", 1)
        service = TalentSearchService(db)

        # 1. Test Multi-Criteria Filter Search
        print("\n--- 1. Testing Multi-Criteria Candidate Pool Search ---")
        filter_req = TalentSearchFilterRequest(
            query="Developer",
            min_experience=1,
            max_experience=10,
            page=1,
            limit=10,
        )
        search_res = await service.search_talent(filter_req, company_id=company_id, user_id=user.id)
        print(f"✅ Found {search_res.total} candidates. Page items: {len(search_res.items)}")
        for idx, card in enumerate(search_res.items[:3], 1):
            print(f"  [{idx}] {card.masked_name} | Role: {card.current_role} | Exp: {card.total_experience} | Loc: {card.location_display} | Skills: {card.skills[:4]}")

        # 2. Test AI Job Description Matcher
        print("\n--- 2. Testing AI Job Description (JD) Candidate Matcher ---")
        sample_jd = """
        We are looking for a Senior Full Stack Engineer with 3+ years of experience in Python, React, TypeScript, and MySQL.
        The candidate should be located in India and have strong API design skills.
        """
        jd_req = JobDescriptionMatchRequest(jd_text=sample_jd, limit=5)
        jd_res = await service.match_candidates_by_jd(jd_req, company_id=company_id, user_id=user.id)
        print(f"✅ AI Parsed Title: '{jd_res.parsed_jd.extracted_title}', Skills: {jd_res.parsed_jd.extracted_skills}, Min Exp: {jd_res.parsed_jd.extracted_min_experience} yrs")
        print(f"✅ Ranked {len(jd_res.items)} candidates by AI Match Score:")
        for idx, card in enumerate(jd_res.items[:3], 1):
            tag_labels = [t.label for t in card.match_tags]
            print(f"  [{idx}] Match: {card.ai_match_score}% | Candidate: {card.masked_name} | Role: {card.current_role} | Tags: {tag_labels}")

        # 3. Test Candidate Saving / Bookmarking
        if search_res.items:
            test_cand = search_res.items[0]
            print(f"\n--- 3. Testing Bookmarking Candidate ID {test_cand.id} ---")
            saved = await service.save_candidate(test_cand.id, company_id=company_id, user_id=user.id, notes="Top candidate for Senior Engineer role")
            print(f"✅ Save Candidate Result: {saved}")

            saved_list = await service.list_saved_candidates(company_id=company_id, user_id=user.id)
            print(f"✅ Total Saved Candidates: {len(saved_list)}")

            # Unsave
            unsaved = await service.unsave_candidate(test_cand.id, company_id=company_id, user_id=user.id)
            print(f"✅ Unsave Candidate Result: {unsaved}")

        # 4. Test Profile Contact Unlock
        if search_res.items:
            test_cand = search_res.items[0]
            print(f"\n--- 4. Testing Profile Contact Unlock for Candidate ID {test_cand.id} ---")
            unlocked_card = await service.unlock_candidate_profile(test_cand.id, company_id=company_id, user_id=user.id)
            print(f"✅ Unlocked Name: '{unlocked_card.name}', Email: '{unlocked_card.email}', Phone: '{unlocked_card.phone}', Resume: '{unlocked_card.resume_url}'")
            print(f"✅ Is Unlocked: {unlocked_card.is_unlocked}")

    print("\n=" * 80)
    print(" 🎉 ALL TALENT SEARCH WORKFLOW TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_talent_search())
