'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Save,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
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

const DEFAULT_INCOME_ITEMS: IncomeItem[] = [
  { source: 'Monthly Membership Dues', amount: 0 },
  { source: 'Donations and Voluntary Contributions', amount: 0 },
  { source: 'Wedding Contributions', amount: 0 },
  { source: 'Special Levies', amount: 0 },
  { source: 'Sponsorships and Grants', amount: 0 },
  { source: 'Other Income', amount: 0 },
];

const DEFAULT_EXPENDITURE_ITEMS: ExpenditureItem[] = [
  { category: 'Welfare Support', amount: 0 },
  { category: 'Wedding Support', amount: 0 },
  { category: 'Bereavement Support', amount: 0 },
  { category: 'Administrative Expenses', amount: 0 },
  { category: 'Digital Platform / Technology', amount: 0 },
  { category: 'Events and Social Activities', amount: 0 },
  { category: 'Other Approved Expenses', amount: 0 },
];

const DEFAULT_FUND_POSITIONS: FundPosition[] = [
  { fund: 'General Fund', balance: 0 },
  { fund: 'Welfare Fund', balance: 0 },
  { fund: 'Special Project Funds', balance: 0 },
  { fund: 'Restricted / Earmarked Funds', balance: 0 },
];

const DEFAULT_SCORECARD: CompanyScore[] = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf',
].map((c) => ({ company: c, expected: 0, received: 0, outstanding: 0 }));

const inputCls = 'w-full px-3 py-2 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs';
const labelCls = 'block text-xs font-bold text-slate-700 mb-1';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonth() {
  return new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

function newReport(): Omit<FinancialReport, 'id' | 'created_at'> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return {
    report_month: getCurrentMonth(),
    period_start: firstDay,
    period_end: lastDay,
    status: 'draft',
    prepared_by: null,
    reviewed_by: null,
    approved_by: null,
    opening_balance: 0,
    total_income: 0,
    total_expenditure: 0,
    closing_balance: 0,
    income_items: [...DEFAULT_INCOME_ITEMS],
    expenditure_items: [...DEFAULT_EXPENDITURE_ITEMS],
    fund_positions: [...DEFAULT_FUND_POSITIONS],
    outstanding_obligations: 0,
    unpaid_commitments: 0,
    company_scorecard: [...DEFAULT_SCORECARD],
    highlights_text: null,
    key_activities: [],
    welfare_interventions: 0,
    projects_funded: 0,
    closing_balance_records: 0,
    closing_bank_balance: 0,
    closing_other_accounts: 0,
    unreconciled_difference: 0,
    reconciliation_status: 'Pending',
    reconciliation_explanation: null,
    management_notes: null,
    published_at: null,
  };
}

export function AdminReportsManager() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    snapshot: true,
    income: true,
    expenditure: true,
    funds: false,
    scorecard: false,
    highlights: false,
    reconciliation: false,
    management: false,
    accountability: false,
  });

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports?admin=true');
      const data = await res.json();
      if (data.ok) setReports(data.reports || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startNew = () => {
    setEditingReport(newReport());
    setIsNew(true);
    setMessage(null);
  };

  const startEdit = (r: FinancialReport) => {
    setEditingReport({ ...r });
    setIsNew(false);
    setMessage(null);
  };

  const recalcTotals = (rpt: any) => {
    const totalIncome = (rpt.income_items || []).reduce((s: number, i: any) => s + (parseFloat(i.amount) || 0), 0);
    const totalExpenditure = (rpt.expenditure_items || []).reduce((s: number, i: any) => s + (parseFloat(i.amount) || 0), 0);
    const closingBalance = (parseFloat(rpt.opening_balance) || 0) + totalIncome - totalExpenditure;
    return { ...rpt, total_income: totalIncome, total_expenditure: totalExpenditure, closing_balance: closingBalance };
  };

  const handleSave = async (publish = false) => {
    if (!editingReport) return;
    setSaving(true);
    setMessage(null);

    const payload = recalcTotals(editingReport);
    if (publish) payload.status = 'published';

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? payload : { ...payload, id: editingReport.id }),
      });
      const data = await res.json();

      if (data.ok) {
        setMessage({ type: 'success', text: publish ? 'Report published successfully!' : 'Report saved as draft.' });
        setEditingReport(null);
        setIsNew(false);
        fetchReports();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save report.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: 'success', text: 'Report deleted.' });
        fetchReports();
      }
    } catch {}
  };

  const updateField = (key: string, value: any) => {
    setEditingReport((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateArrayItem = (arrayKey: string, index: number, field: string, value: any) => {
    setEditingReport((prev: any) => {
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: field === 'amount' || field === 'expected' || field === 'received' || field === 'outstanding' || field === 'balance' ? parseFloat(value) || 0 : value };
      return { ...prev, [arrayKey]: arr };
    });
  };

  const addArrayItem = (arrayKey: string, template: any) => {
    setEditingReport((prev: any) => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), template],
    }));
  };

  const removeArrayItem = (arrayKey: string, index: number) => {
    setEditingReport((prev: any) => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const addKeyActivity = () => {
    setEditingReport((prev: any) => ({
      ...prev,
      key_activities: [...(prev.key_activities || []), ''],
    }));
  };

  const updateKeyActivity = (index: number, value: string) => {
    setEditingReport((prev: any) => {
      const acts = [...(prev.key_activities || [])];
      acts[index] = value;
      return { ...prev, key_activities: acts };
    });
  };

  const SectionHeader = ({ sectionKey, title, icon }: { sectionKey: string; title: string; icon: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-2 text-sm font-bold text-emerald-900 uppercase tracking-wider border-b-2 border-emerald-100"
    >
      <span className="flex items-center gap-2">{icon} {title}</span>
      {expandedSections[sectionKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );

  const fmt = (n: number) => '₦' + Math.abs(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

  // ───── Report List View ─────
  if (!editingReport) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Brotherhood Accountability Reports
          </h3>
          <Button variant="emerald" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={startNew}>
            New Report
          </Button>
        </div>

        {message && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-slate-400">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400">No reports yet. Click &quot;New Report&quot; to create the first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{r.report_month}</p>
                    <p className="text-[10px] text-slate-400">
                      {r.period_start} → {r.period_end} • Closing: {fmt(r.closing_balance)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'published' ? 'emerald' : 'amber'} size="sm">
                    {r.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(r)}>Edit</Button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ───── Report Editor View ─────
  const rpt = editingReport;
  const calculated = recalcTotals(rpt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          {isNew ? 'Create New Report' : `Editing: ${rpt.report_month}`}
        </h3>
        <button
          onClick={() => { setEditingReport(null); setIsNew(false); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Meta Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Report Month</label>
          <input className={inputCls} value={rpt.report_month || ''} onChange={(e) => updateField('report_month', e.target.value)} placeholder="e.g. November 2026" />
        </div>
        <div>
          <label className={labelCls}>Period Start</label>
          <input type="date" className={inputCls} value={rpt.period_start || ''} onChange={(e) => updateField('period_start', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Period End</label>
          <input type="date" className={inputCls} value={rpt.period_end || ''} onChange={(e) => updateField('period_end', e.target.value)} />
        </div>
      </div>

      {/* Section: Financial Snapshot */}
      <SectionHeader sectionKey="snapshot" title="Financial Snapshot" icon={<span className="text-emerald-600 font-black">1</span>} />
      {expandedSections.snapshot && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Opening Balance (₦)</label>
            <input type="number" step="0.01" className={inputCls} value={rpt.opening_balance || ''} onChange={(e) => updateField('opening_balance', e.target.value)} />
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-emerald-600 font-medium">Auto-calculated</p>
            <p className="text-xs"><strong>Total Income:</strong> {fmt(calculated.total_income)}</p>
            <p className="text-xs"><strong>Total Expenditure:</strong> {fmt(calculated.total_expenditure)}</p>
            <p className="text-xs"><strong>Closing Balance:</strong> {fmt(calculated.closing_balance)}</p>
          </div>
        </div>
      )}

      {/* Section: Income */}
      <SectionHeader sectionKey="income" title="Where The Money Came From" icon={<span className="text-emerald-600 font-black">2</span>} />
      {expandedSections.income && (
        <div className="space-y-2">
          {(rpt.income_items || []).map((item: IncomeItem, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={item.source} onChange={(e) => updateArrayItem('income_items', i, 'source', e.target.value)} placeholder="Income source" />
              <input type="number" step="0.01" className={`${inputCls} w-32`} value={item.amount || ''} onChange={(e) => updateArrayItem('income_items', i, 'amount', e.target.value)} placeholder="₦ Amount" />
              <button onClick={() => removeArrayItem('income_items', i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => addArrayItem('income_items', { source: '', amount: 0 })} className="text-xs text-emerald-600 font-medium hover:text-emerald-800 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add income source
          </button>
        </div>
      )}

      {/* Section: Expenditure */}
      <SectionHeader sectionKey="expenditure" title="Where The Money Went" icon={<span className="text-emerald-600 font-black">3</span>} />
      {expandedSections.expenditure && (
        <div className="space-y-2">
          {(rpt.expenditure_items || []).map((item: ExpenditureItem, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={item.category} onChange={(e) => updateArrayItem('expenditure_items', i, 'category', e.target.value)} placeholder="Expenditure category" />
              <input type="number" step="0.01" className={`${inputCls} w-32`} value={item.amount || ''} onChange={(e) => updateArrayItem('expenditure_items', i, 'amount', e.target.value)} placeholder="₦ Amount" />
              <button onClick={() => removeArrayItem('expenditure_items', i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => addArrayItem('expenditure_items', { category: '', amount: 0 })} className="text-xs text-emerald-600 font-medium hover:text-emerald-800 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add expenditure category
          </button>
        </div>
      )}

      {/* Section: Fund Position */}
      <SectionHeader sectionKey="funds" title="Fund Position" icon={<span className="text-emerald-600 font-black">4</span>} />
      {expandedSections.funds && (
        <div className="space-y-3">
          {(rpt.fund_positions || []).map((fp: FundPosition, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={fp.fund} onChange={(e) => updateArrayItem('fund_positions', i, 'fund', e.target.value)} placeholder="Fund name" />
              <input type="number" step="0.01" className={`${inputCls} w-32`} value={fp.balance || ''} onChange={(e) => updateArrayItem('fund_positions', i, 'balance', e.target.value)} placeholder="₦ Balance" />
              <button onClick={() => removeArrayItem('fund_positions', i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => addArrayItem('fund_positions', { fund: '', balance: 0 })} className="text-xs text-emerald-600 font-medium hover:text-emerald-800 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add fund
          </button>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className={labelCls}>Outstanding Obligations (₦)</label>
              <input type="number" step="0.01" className={inputCls} value={rpt.outstanding_obligations || ''} onChange={(e) => updateField('outstanding_obligations', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Unpaid Approved Commitments (₦)</label>
              <input type="number" step="0.01" className={inputCls} value={rpt.unpaid_commitments || ''} onChange={(e) => updateField('unpaid_commitments', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Section: Company Scorecard */}
      <SectionHeader sectionKey="scorecard" title="Company Contribution Scorecard" icon={<span className="text-emerald-600 font-black">5</span>} />
      {expandedSections.scorecard && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
            <span>Company</span><span>Expected (₦)</span><span>Received (₦)</span><span>Outstanding (₦)</span>
          </div>
          {(rpt.company_scorecard || []).map((c: CompanyScore, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <input className={inputCls} value={c.company} onChange={(e) => updateArrayItem('company_scorecard', i, 'company', e.target.value)} />
              <input type="number" step="0.01" className={inputCls} value={c.expected || ''} onChange={(e) => updateArrayItem('company_scorecard', i, 'expected', e.target.value)} />
              <input type="number" step="0.01" className={inputCls} value={c.received || ''} onChange={(e) => updateArrayItem('company_scorecard', i, 'received', e.target.value)} />
              <input type="number" step="0.01" className={inputCls} value={c.outstanding || ''} onChange={(e) => updateArrayItem('company_scorecard', i, 'outstanding', e.target.value)} />
            </div>
          ))}
        </div>
      )}

      {/* Section: Highlights */}
      <SectionHeader sectionKey="highlights" title="Performance Highlights" icon={<span className="text-emerald-600 font-black">6</span>} />
      {expandedSections.highlights && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Welfare Interventions</label>
              <input type="number" className={inputCls} value={rpt.welfare_interventions || ''} onChange={(e) => updateField('welfare_interventions', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Projects Funded</label>
              <input type="number" className={inputCls} value={rpt.projects_funded || ''} onChange={(e) => updateField('projects_funded', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Key Activities &amp; Financial Decisions</label>
            {(rpt.key_activities || []).map((act: string, i: number) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input className={`${inputCls} flex-1`} value={act} onChange={(e) => updateKeyActivity(i, e.target.value)} placeholder={`Activity ${i + 1}`} />
                <button onClick={() => {
                  const acts = [...(rpt.key_activities || [])];
                  acts.splice(i, 1);
                  updateField('key_activities', acts);
                }} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={addKeyActivity} className="text-xs text-emerald-600 font-medium hover:text-emerald-800 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add activity
            </button>
          </div>
        </div>
      )}

      {/* Section: Reconciliation */}
      <SectionHeader sectionKey="reconciliation" title="Financial Reconciliation" icon={<span className="text-emerald-600 font-black">7</span>} />
      {expandedSections.reconciliation && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Closing Balance per Records (₦)</label>
              <input type="number" step="0.01" className={inputCls} value={rpt.closing_balance_records || ''} onChange={(e) => updateField('closing_balance_records', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Closing Bank Balance (₦)</label>
              <input type="number" step="0.01" className={inputCls} value={rpt.closing_bank_balance || ''} onChange={(e) => updateField('closing_bank_balance', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Other Accounts / Wallets (₦)</label>
              <input type="number" step="0.01" className={inputCls} value={rpt.closing_other_accounts || ''} onChange={(e) => updateField('closing_other_accounts', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Unreconciled Difference (₦)</label>
              <input type="number" step="0.01" className={inputCls} value={rpt.unreconciled_difference || ''} onChange={(e) => updateField('unreconciled_difference', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Reconciliation Status</label>
              <select className={inputCls} value={rpt.reconciliation_status || 'Pending'} onChange={(e) => updateField('reconciliation_status', e.target.value)}>
                <option value="Reconciled">Reconciled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Explanation (if any)</label>
              <input className={inputCls} value={rpt.reconciliation_explanation || ''} onChange={(e) => updateField('reconciliation_explanation', e.target.value)} placeholder="Details..." />
            </div>
          </div>
        </div>
      )}

      {/* Section: Management Notes */}
      <SectionHeader sectionKey="management" title="Management Notes" icon={<span className="text-emerald-600 font-black">8</span>} />
      {expandedSections.management && (
        <textarea
          className={`${inputCls} min-h-[80px]`}
          value={rpt.management_notes || ''}
          onChange={(e) => updateField('management_notes', e.target.value)}
          placeholder="Brief explanation of unusual expenditure, major financial developments..."
        />
      )}

      {/* Section: Accountability */}
      <SectionHeader sectionKey="accountability" title="Accountability Declaration" icon={<span className="text-emerald-600 font-black">9</span>} />
      {expandedSections.accountability && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Prepared by</label>
            <input className={inputCls} value={rpt.prepared_by || ''} onChange={(e) => updateField('prepared_by', e.target.value)} placeholder="Treasurer / Financial Secretary" />
          </div>
          <div>
            <label className={labelCls}>Reviewed by</label>
            <input className={inputCls} value={rpt.reviewed_by || ''} onChange={(e) => updateField('reviewed_by', e.target.value)} placeholder="Audit Committee Representative" />
          </div>
          <div>
            <label className={labelCls}>Approved by</label>
            <input className={inputCls} value={rpt.approved_by || ''} onChange={(e) => updateField('approved_by', e.target.value)} placeholder="Set Chairman" />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
        <Button variant="outline" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={() => handleSave(false)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button variant="emerald" size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={() => handleSave(true)} disabled={saving}>
          {saving ? 'Publishing...' : 'Publish Report'}
        </Button>
        <button
          onClick={() => { setEditingReport(null); setIsNew(false); }}
          className="text-xs text-slate-500 hover:text-slate-700 font-medium ml-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
