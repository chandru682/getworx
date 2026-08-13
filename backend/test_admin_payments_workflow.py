"""Integration Test Suite for Super Admin Payments & Revenue Module."""
import asyncio
import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import AsyncSessionLocal
from app.admin.payment_service import AdminPaymentService


async def test_payments_workflow():
    print("=" * 60)
    print("STARTING SUPER ADMIN PAYMENTS & INVOICES WORKFLOW TEST")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        service = AdminPaymentService(session)

        # 1. Financial Overview KPIs
        print("\n[TEST 1] Financial Overview KPIs (This Month):")
        kpis = await service.get_financial_kpis(date_range="this_month")
        print(f" - Total Revenue: INR {kpis['total_revenue']['value']:,} ({kpis['total_revenue']['percentage_change']}%)")
        print(f" - MRR: INR {kpis['mrr']['value']:,} ({kpis['mrr']['percentage_change']}%)")
        print(f" - Pending Payments: INR {kpis['pending_payments']['value']:,}")
        print(f" - Refunds: INR {kpis['refunds']['value']:,}")
        assert "total_revenue" in kpis and "mrr" in kpis, "KPI overview calculation failed"

        # 2. Revenue Trend
        print("\n[TEST 2] Revenue Performance Trend (30 Days):")
        trend = await service.get_revenue_trend(date_range="30d")
        print(f" - Data points returned: {len(trend)}")
        assert len(trend) > 0, "Revenue trend returned zero data points"

        # 3. Revenue by Subscription Plan
        print("\n[TEST 3] Revenue Breakdown by Plan:")
        by_plan = await service.get_revenue_by_plan()
        for p in by_plan:
            print(f" - {p['plan_name']}: {p['active_subscriptions']} Active Subs | INR {p['revenue']:,} ({p['percentage_of_total']}%)")
        assert len(by_plan) > 0, "Revenue by plan returned zero items"

        # 4. Payment Health Summary
        print("\n[TEST 4] Payment Health Summary:")
        health = await service.get_payment_health()
        for h in health:
            print(f" - {h['status']}: {h['transaction_count']} Txs | INR {h['total_amount']:,}")
        assert len(health) >= 4, "Payment health breakdown incomplete"

        # 5. Subscription Overview Summary
        print("\n[TEST 5] Subscription Overview Summary:")
        sub_ov = await service.get_subscription_overview()
        print(f" - Active: {sub_ov['active']}, Expiring: {sub_ov['expiring_soon']}, Expired: {sub_ov['expired']}, Cancelled: {sub_ov['cancelled']}")
        assert sub_ov['total'] >= 0, "Subscription overview count invalid"

        # 6. Top Paying Companies
        print("\n[TEST 6] Top Paying Companies:")
        top_comps = await service.get_top_paying_companies(limit=5)
        for c in top_comps:
            print(f" - {c['company_name']}: Plan: {c['plan_name']} | INR {c['total_revenue']:,}")
        assert len(top_comps) > 0, "Top paying companies list empty"

        # 7. Recent Payment Transactions Ledger
        print("\n[TEST 7] Recent Transactions Ledger:")
        items, total = await service.get_transactions(page=1, limit=10)
        print(f" - Total transactions: {total}, Items fetched: {len(items)}")
        for t in items[:3]:
            print(f"   * {t['invoice_number']} | {t['company_name']} | INR {t['amount']:,} | {t['status']}")
        assert len(items) > 0, "Transaction ledger list empty"

        # 8. Itemized Invoice Breakdown
        print("\n[TEST 8] Itemized Invoice Details (Invoice 101):")
        inv = await service.get_invoice_details(payment_id=101)
        print(f" - Invoice No: {inv['invoice_number']}")
        print(f" - Company: {inv['company_name']}")
        print(f" - Subtotal: INR {inv['subtotal']:,}")
        print(f" - GST (18%): INR {inv['tax_amount']:,}")
        print(f" - Total Paid: INR {inv['total_amount']:,}")
        assert inv['total_amount'] > 0 and inv['tax_amount'] >= 0, "Invoice detail calculation invalid"

    print("\n" + "=" * 60)
    print(" SUCCESS: ALL PAYMENTS & INVOICES TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_payments_workflow())
