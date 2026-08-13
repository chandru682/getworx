"""Automated Integration Test for Super Admin Reports & BI Analytics Endpoints."""
import asyncio
from app.database.session import get_async_db_context
from app.admin.analytics_service import AdminAnalyticsService


async def run_analytics_tests():
    print("==================================================")
    print(" STARTING SUPER ADMIN BI ANALYTICS TEST SUITE ")
    print("==================================================")

    async with get_async_db_context() as db:
        service = AdminAnalyticsService(db)

        # 1. Executive KPIs
        kpis = await service.get_executive_kpis(date_range="30d")
        print(f"\n[TEST 1] Executive KPIs - Total Companies: {kpis['total_companies']['value']}, Active Jobs: {kpis['active_jobs']['value']}, MRR: INR {kpis['mrr']['value']}")
        assert "total_companies" in kpis and "mrr" in kpis, "Overview KPIs should include total companies and MRR"

        # 2. Platform Growth Trend
        growth = await service.get_platform_growth(date_range="30d", metric="applications")
        print(f"\n[TEST 2] Platform Growth - Data points count: {len(growth)}")
        assert len(growth) > 0, "Growth trend data points should not be empty"

        # 3. Recruitment Funnel
        funnel = await service.get_recruitment_funnel(date_range="30d")
        print(f"\n[TEST 3] Recruitment Funnel - Stages count: {len(funnel)}")
        for st in funnel:
            print(f"   -> Stage: {st['stage']} | Count: {st['count']} | Conv: {st['conversion_percentage']}%")
        assert len(funnel) == 6, "Recruitment funnel should have 6 stages"

        # 4. Applications Analytics
        apps_data = await service.get_application_analytics(date_range="30d")
        print(f"\n[TEST 4] Application Analytics - Total Apps: {apps_data['total_applications']}, Avg/Job: {apps_data['avg_applications_per_job']}")
        assert "trend" in apps_data, "Application analytics must include trend"

        # 5. Job Analytics
        job_data = await service.get_job_analytics()
        print(f"\n[TEST 5] Job Analytics - Active Jobs: {job_data['active_jobs']}, Categories count: {len(job_data['by_category'])}")
        assert "active_jobs" in job_data, "Job analytics must include active jobs count"

        # 6. Company Performance
        comp_perf, comp_total = await service.get_company_performance(page=1, limit=10)
        print(f"\n[TEST 6] Company Performance - Companies count: {len(comp_perf)}, Total: {comp_total}")
        assert comp_total >= 0, "Company total should be non-negative"

        # 7. Business Revenue Analytics
        rev = await service.get_revenue_analytics()
        print(f"\n[TEST 7] Business Revenue - MRR: INR {rev['mrr']}, ARR: INR {rev['arr']}, Active Subs: {rev['active_subscriptions']}")
        assert "mrr" in rev, "Revenue analytics must contain MRR"

        # 8. Candidate Analytics
        cand = await service.get_candidate_analytics()
        print(f"\n[TEST 8] Candidate Analytics - Total: {cand['total_candidates']}, Avg Completion: {cand['avg_profile_completion']}%")
        assert "total_candidates" in cand, "Candidate analytics must contain total candidates"

        # 9. Recruiter Analytics
        rec = await service.get_recruiter_analytics()
        print(f"\n[TEST 9] Recruiter Analytics - Total Recruiters: {rec['total_recruiters']}")
        assert "total_recruiters" in rec, "Recruiter analytics must contain total recruiters"

        # 10. Top Performers
        top = await service.get_top_performers()
        print(f"\n[TEST 10] Top Performers - Top Companies count: {len(top['top_companies'])}")
        assert "top_companies" in top, "Top performers must contain top_companies"

        # 11. Report Generation
        rep = await service.generate_report({"report_type": "platform", "date_range": "30d", "format": "csv"})
        print(f"\n[TEST 11] Report Generator - Created Report ID: {rep['id']}, Format: {rep['format']}")
        assert rep["id"].startswith("REP-"), "Generated report ID should start with REP-"

        # 12. Saved Reports History
        saved = await service.get_saved_reports()
        print(f"\n[TEST 12] Saved Reports - Total history count: {len(saved)}")
        assert len(saved) >= 1, "Saved reports history should not be empty"

    print("\n==================================================")
    print(" SUCCESS: ALL BI ANALYTICS & REPORTS TESTS PASSED!")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_analytics_tests())
