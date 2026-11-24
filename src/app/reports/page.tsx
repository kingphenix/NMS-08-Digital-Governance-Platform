'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  FileText,
  Calendar,
  ChevronDown,
  Download,
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  PiggyBank,
  Scale,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface IncomeItem { source: string; amount: number }
interface ExpenditureItem { category: string; amount: number }
interface FundPosition { fund: string; balance: number }
interface CompanyScore { company: string; expected: number; received: number; outstanding: number }

interface FinancialReport {
  id: string;
  report_month: string;
  period_start: string;
  period_end: string;
  status: string;
  prepared_by: string | null;
  reviewed_by: string | null;
  approved_by: string | null;
  opening_balance: number;
  total_income: number;
  total_expenditure: number;
  closing_balance: number;
  income_items: IncomeItem[];
  expenditure_items: ExpenditureItem[];
  fund_positions: FundPosition[];
  outstanding_obligations: number;
  unpaid_commitments: number;
  company_scorecard: CompanyScore[];
  highlights_text: string | null;
  key_activities: string[];
  welfare_interventions: number;
  projects_funded: number;
  closing_balance_records: number;
  closing_bank_balance: number;
  closing_other_accounts: number;
  unreconciled_difference: number;
  reconciliation_status: string;
  reconciliation_explanation: string | null;
  management_notes: string | null;
  published_at: string | null;
  created_at: string;
}

const fmt = (n: number) =>
  '₦' + Math.abs(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtSigned = (n: number) =>
  (n < 0 ? '-' : '') + fmt(n);

const COMPANY_COLORS: Record<string, string> = {
  Alpha: 'bg-red-500',
  Bravo: 'bg-blue-500',
  Charlie: 'bg-amber-500',
  Delta: 'bg-emerald-500',
  Echo: 'bg-purple-500',
  Foxtrot: 'bg-orange-500',
  Golf: 'bg-cyan-500',
};

const AUTHENTIC_REPORT: FinancialReport = {
  id: '08080808-0000-4000-8000-000000002026',
  report_month: 'November 2026',
  period_start: '2026-11-01',
  period_end: '2026-11-30',
  status: 'published',
  prepared_by: 'Exboy Isaac Danmusa',
  reviewed_by: 'Exboy Ikenna Ukonna',
  approved_by: 'Exboy Filani Victor Oluwasegun',
  opening_balance: 0,
  total_income: 24000,
  total_expenditure: 0,
  closing_balance: 24000,
  income_items: [
    { source: 'Monthly Membership Dues', amount: 24000 },
    { source: 'Donations and Voluntary Contributions', amount: 0 },
    { source: 'Wedding Contributions', amount: 0 },
    { source: 'Special Levies', amount: 0 },
    { source: 'Sponsorships and Grants', amount: 0 },
    { source: 'Other Income', amount: 0 },
  ],
  expenditure_items: [
    { category: 'Welfare Support', amount: 0 },
    { category: 'Wedding Support', amount: 0 },
    { category: 'Bereavement Support', amount: 0 },
    { category: 'Administrative Expenses', amount: 0 },
    { category: 'Digital Platform / Technology', amount: 0 },
    { category: 'Events and Social Activities', amount: 0 },
    { category: 'Other Approved Expenses', amount: 0 },
  ],
  fund_positions: [
    { fund: 'General Fund', balance: 24000 },
    { fund: 'Welfare Fund', balance: 0 },
    { fund: 'Special Project Funds', balance: 0 },
    { fund: 'Restricted / Earmarked Funds', balance: 0 },
  ],
  outstanding_obligations: 0,
  unpaid_commitments: 0,
  company_scorecard: [
    { company: 'Alpha', expected: 0, received: 0, outstanding: 0 },
    { company: 'Bravo', expected: 0, received: 2000, outstanding: 0 },
    { company: 'Charlie', expected: 0, received: 22000, outstanding: 0 },
    { company: 'Delta', expected: 0, received: 0, outstanding: 0 },
    { company: 'Echo', expected: 0, received: 0, outstanding: 0 },
    { company: 'Foxtrot', expected: 0, received: 0, outstanding: 0 },
    { company: 'Golf', expected: 0, received: 0, outstanding: 0 },
  ],
  highlights_text: 'Inaugural financial transparency statement recording live collections since digital portal launch.',
  key_activities: [
    'Official launch of the NMS 08 Digital Governance Platform and automated Paystack dues gateway.',
    'Accreditation and profile verification for 168 Ex-Boys across all 7 military companies.',
    'First live member dues received and verified for November 2026.',
  ],
  welfare_interventions: 0,
  projects_funded: 0,
  closing_balance_records: 24000,
  closing_bank_balance: 24000,
  closing_other_accounts: 0,
  unreconciled_difference: 0,
  reconciliation_status: 'Reconciled',
  reconciliation_explanation: 'All collections verified against automated Paystack gateway settlements.',
  management_notes: 'This monthly report reflects live verified transactions on the platform for November 2026. All categories currently reading ₦0.00 indicate items awaiting manual reconciliation or subsequent disbursement by the Executive Council.',
  published_at: '2026-11-20T12:00:00.000Z',
  created_at: '2026-11-20T12:00:00.000Z',
};

function BarSegment({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{fmt(value)}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([AUTHENTIC_REPORT]);
  const [selectedId, setSelectedId] = useState<string | null>(AUTHENTIC_REPORT.id);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.reports) && d.reports.length > 0) {
          setReports(d.reports);
          setSelectedId((prev) => (d.reports.some((r: any) => r.id === prev) ? prev : d.reports[0].id));
        }
      })
      .catch(() => {
        // Fallback to AUTHENTIC_REPORT
      });
  }, []);

  const report = reports.find((r) => r.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card variant="glass" className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Reports Published Yet</h2>
          <p className="text-sm text-slate-500">
            The Brotherhood Accountability Reports will appear here once the financial committee publishes the first monthly report.
          </p>
          <p className="text-xs text-emerald-700 font-medium italic">
            &quot;Every naira received. Every naira spent. Every balance accounted for.&quot;
          </p>
          <Link href="/">
            <Button variant="outline" size="sm">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const incomeTotal = (report?.income_items || []).reduce((s, i) => s + (i.amount || 0), 0);
  const expenseTotal = (report?.expenditure_items || []).reduce((s, i) => s + (i.amount || 0), 0);
  const fundTotal = (report?.fund_positions || []).reduce((s, i) => s + (i.balance || 0), 0);
  const incomeMax = Math.max(...(report?.income_items || []).map((i) => i.amount || 0), 1);
  const expenseMax = Math.max(...(report?.expenditure_items || []).map((i) => i.amount || 0), 1);
  const scorecardMax = Math.max(...(report?.company_scorecard || []).map((c) => Math.max(c.expected || 0, c.received || 0)), 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        <div className="text-center space-y-3">
          <Badge variant="emerald" className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Financial Transparency</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The Brotherhood Accountability Report
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Every naira received. Every naira spent. Every balance accounted for. — NMS 08 Monthly Financial Transparency Dashboard
          </p>
        </div>

        {/* Month Selector & Print Action */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-apple-sm hover:bg-slate-50 transition-all text-sm font-medium text-slate-800"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{report?.report_month}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-apple-lg border border-slate-200 py-2 z-50 max-h-64 overflow-y-auto">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedId(r.id); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                      r.id === selectedId ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{r.report_month}</span>
                      {r.id === selectedId && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-emerald-600" />}
            onClick={() => window.print()}
            className="rounded-2xl shadow-apple-sm text-xs"
          >
            Download / Print PDF
          </Button>
        </div>
      </section>

      {report && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
          {/* ═══════ SECTION 1: HEADLINE CARDS ═══════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Opening Balance */}
            <Card variant="glass" className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Wallet className="w-4 h-4 text-slate-400" />
                Opening Balance
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {fmt(report.opening_balance)}
              </p>
            </Card>

            {/* Money Received */}
            <Card variant="glass" className="p-5 space-y-2 border-emerald-200/50">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                Money Received
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                {fmt(report.total_income)}
              </p>
            </Card>

            {/* Money Spent */}
            <Card variant="glass" className="p-5 space-y-2 border-rose-200/50">
              <div className="flex items-center gap-2 text-xs text-rose-700 font-medium">
                <ArrowUpCircle className="w-4 h-4 text-rose-500" />
                Money Spent
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight">
                {fmt(report.total_expenditure)}
              </p>
            </Card>

            {/* Closing Balance */}
            <Card variant="emerald" className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-100 font-medium">
                <PiggyBank className="w-4 h-4" />
                Closing Balance
              </div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {fmt(report.closing_balance)}
              </p>
              <p className="text-[10px] text-emerald-200 font-mono">
                Opening + Income − Expenditure
              </p>
            </Card>
          </div>

          {/* ═══════ SECTION 2 & 3: INCOME & EXPENDITURE CHARTS ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Composition */}
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Where The Money Came From
                </h3>
                <Badge variant="emerald" size="sm">{fmt(incomeTotal)}</Badge>
              </div>
              <div className="space-y-3">
                {(report.income_items || []).map((item, i) => (
                  <BarSegment key={i} label={item.source} value={item.amount} max={incomeMax} color="bg-emerald-500" />
                ))}
                {(!report.income_items || report.income_items.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No income items recorded for this period.</p>
                )}
              </div>
            </Card>

            {/* Expenditure Composition */}
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                  Where The Money Went
                </h3>
                <Badge variant="rose" size="sm">{fmt(expenseTotal)}</Badge>
              </div>
              <div className="space-y-3">
                {(report.expenditure_items || []).map((item, i) => (
                  <BarSegment key={i} label={item.category} value={item.amount} max={expenseMax} color="bg-rose-500" />
                ))}
                {(!report.expenditure_items || report.expenditure_items.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No expenditure items recorded for this period.</p>
                )}
              </div>
            </Card>
          </div>

          {/* ═══════ SECTION 4: FUND POSITION ═══════ */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-600" />
              Fund Position — What We Have and What We Owe
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Fund / Account</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Balance (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.fund_positions || []).map((fp, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2.5 px-3 text-slate-700">{fp.fund}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{fmt(fp.balance)}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/60 font-bold">
                    <td className="py-2.5 px-3 text-emerald-900">TOTAL FUND BALANCE</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800">{fmt(fundTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs">
                <span className="text-amber-700 font-medium">Outstanding Obligations:</span>
                <span className="font-bold text-amber-900 ml-2">{fmt(report.outstanding_obligations)}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs">
                <span className="text-amber-700 font-medium">Unpaid Approved Commitments:</span>
                <span className="font-bold text-amber-900 ml-2">{fmt(report.unpaid_commitments)}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Note: Earmarked funds are distinguished from freely available funds. They are not presented as money available for general expenditure.
            </p>
          </Card>

          {/* ═══════ SECTION 5: COMPANY CONTRIBUTION SCORECARD ═══════ */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Company Contribution Scorecard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2.5 px-3 font-bold text-slate-700">Company</th>
                    <th className="text-right py-2.5 px-3 font-bold text-slate-700">Expected (₦)</th>
                    <th className="text-right py-2.5 px-3 font-bold text-emerald-700">Received (₦)</th>
                    <th className="text-right py-2.5 px-3 font-bold text-amber-700">Outstanding (₦)</th>
                    <th className="text-right py-2.5 px-3 font-bold text-slate-600 hidden sm:table-cell">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.company_scorecard || []).map((c, i) => {
                    const pct = c.expected > 0 ? Math.round((c.received / c.expected) * 100) : (c.received > 0 ? 100 : 0);
                    const barColor = COMPANY_COLORS[c.company] || 'bg-slate-400';
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <span className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                            {c.company}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{fmt(c.expected)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">{fmt(c.received)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700">{fmt(c.outstanding)}</td>
                        <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {report.company_scorecard && report.company_scorecard.length > 0 && (
                    <tr className="bg-emerald-50/60 font-bold">
                      <td className="py-2.5 px-3 text-emerald-900">TOTAL</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        {fmt(report.company_scorecard.reduce((s, c) => s + (c.expected || 0), 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                        {fmt(report.company_scorecard.reduce((s, c) => s + (c.received || 0), 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-800">
                        {fmt(report.company_scorecard.reduce((s, c) => s + (c.outstanding || 0), 0))}
                      </td>
                      <td className="hidden sm:table-cell" />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {(!report.company_scorecard || report.company_scorecard.length === 0) && (
              <p className="text-xs text-slate-400 italic text-center">No company scorecard data for this period.</p>
            )}
          </Card>

          {/* ═══════ SECTION 6: PERFORMANCE HIGHLIGHTS ═══════ */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Financial Performance Highlights — This Month at a Glance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center space-y-1">
                <p className="text-lg font-black text-emerald-800">{fmt(report.total_income)}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Funds Received</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 text-center space-y-1">
                <p className="text-lg font-black text-rose-800">{fmt(report.total_expenditure)}</p>
                <p className="text-[10px] text-rose-600 font-medium">Funds Utilised</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center space-y-1">
                <p className="text-lg font-black text-amber-800">
                  {fmt(report.company_scorecard?.reduce((s, c) => s + (c.outstanding || 0), 0) || 0)}
                </p>
                <p className="text-[10px] text-amber-600 font-medium">Outstanding</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-3 text-center space-y-1">
                <p className="text-lg font-black text-sky-800">{report.welfare_interventions}</p>
                <p className="text-[10px] text-sky-600 font-medium">Welfare Interventions</p>
              </div>
            </div>

            {report.key_activities && report.key_activities.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700">Key Activities &amp; Financial Decisions</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                  {report.key_activities.map((act, i) => (
                    <li key={i} className="leading-relaxed">{act}</li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          {/* ═══════ SECTION 7: FINANCIAL RECONCILIATION ═══════ */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Financial Reconciliation
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Reconciliation Item</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Amount (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-3 text-slate-700">Closing Balance per Financial Records</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{fmt(report.closing_balance_records)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-3 text-slate-700">Closing Bank Balance</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{fmt(report.closing_bank_balance)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-3 text-slate-700">Closing Balance in Other Accounts / Wallets</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{fmt(report.closing_other_accounts)}</td>
                  </tr>
                  <tr className={`font-bold ${report.unreconciled_difference !== 0 ? 'bg-amber-50' : 'bg-emerald-50/60'}`}>
                    <td className="py-2.5 px-3 text-slate-900">Unreconciled Difference</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${report.unreconciled_difference !== 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {fmtSigned(report.unreconciled_difference)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-medium text-slate-600">Reconciliation Status:</span>
              <Badge variant={report.reconciliation_status === 'Reconciled' ? 'emerald' : 'amber'}>
                {report.reconciliation_status === 'Reconciled' ? (
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reconciled</span>
                ) : (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {report.reconciliation_status}</span>
                )}
              </Badge>
            </div>
            {report.reconciliation_explanation && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Explanation: </span>{report.reconciliation_explanation}
              </div>
            )}
          </Card>

          {/* ═══════ SECTION 8: MANAGEMENT NOTES ═══════ */}
          {report.management_notes && (
            <Card variant="glass" className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                Management Notes
              </h3>
              <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {report.management_notes}
              </div>
            </Card>
          )}

          {/* ═══════ SECTION 9: ACCOUNTABILITY DECLARATION ═══════ */}
          <Card variant="glass" className="p-6 space-y-4 border-emerald-200/50">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Accountability Declaration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We affirm that this report represents the financial transactions and balances recorded for the stated reporting period,
              subject to the reconciliation status and explanations disclosed above.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                <p className="text-slate-400 font-medium">Prepared by</p>
                <p className="font-bold text-slate-800">{report.prepared_by || '—'}</p>
                <p className="text-[10px] text-slate-400">Treasurer / Financial Secretary</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                <p className="text-slate-400 font-medium">Reviewed by</p>
                <p className="font-bold text-slate-800">{report.reviewed_by || '—'}</p>
                <p className="text-[10px] text-slate-400">Audit Committee</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-xs space-y-1 border border-emerald-200">
                <p className="text-emerald-600 font-medium">Approved for Publication</p>
                <p className="font-bold text-emerald-900">{report.approved_by || '—'}</p>
                <p className="text-[10px] text-emerald-600">Set Chairman</p>
              </div>
            </div>
          </Card>

          {/* Report period info & footer */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-xs text-slate-400">
              Reporting Period: {report.period_start} to {report.period_end}
              {report.published_at && ` • Published ${new Date(report.published_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
            <p className="text-sm font-bold text-emerald-800 italic">
              NMS 08 — One Set. One Brotherhood. One Vision.
            </p>
            <p className="text-[11px] text-slate-400">
              Financial transparency is our collective responsibility.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
