'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
import {
  FINANCIAL_METRICS,
  COMPANIES_LIST,
  NEWS_LIST,
  ELECTION_DATA,
} from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { DuesTrendChart, CompanyComplianceChart } from './Charts';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Building,
  Vote,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Megaphone,
  Download,
  Filter,
  Plus,
  RefreshCw,
} from 'lucide-react';

export function AdminDashboard() {
  const [pendingMembers, setPendingMembers] = useState([
    { id: 'p-1', name: 'Ex-Boy Lt. Danladi Umar', nmsNo: 'NMS/08/4899', company: 'Delta Company', email: 'd.umar@mil.ng', date: '2 hours ago' },
    { id: 'p-2', name: 'Ex-Boy Engr. Chuka Okafor', nmsNo: 'NMS/08/4933', company: 'Bravo Company', email: 'chuka.o@tech.ng', date: 'Yesterday' },
  ]);

  const [verifiedCount, setVerifiedCount] = useState(445);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleVerify = (id: string) => {
    setPendingMembers(pendingMembers.filter(m => m.id !== id));
    setVerifiedCount(prev => prev + 1);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <Card variant="emerald" className="p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none">
          <Image
            src={mainLogo}
            alt="NMS Watermark Logo"
            width={240}
            height={240}
            className="w-60 h-auto object-contain"
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                National Executive Console
              </Badge>
              <Badge variant="outline" className="bg-emerald-950/50 text-emerald-100 border-white/20">
                Super Admin Access
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Governance & Administrative Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100">
              NMS 08 Alumni Secretariat Operations • Dues Oversight & Verification
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowBroadcastModal(true)}
            icon={<Megaphone className="w-4 h-4 text-emerald-400" />}
          >
            Broadcast Announcement
          </Button>
        </div>
      </Card>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Verified Ex-Boys</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">{verifiedCount} / 485</h3>
            <ProgressBar value={(verifiedCount / 485) * 100} showPercentage={false} height="sm" color="emerald" />
            <p className="text-[11px] text-slate-500">91.7% of total set registered</p>
          </CardContent>
        </Card>

        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Dues Revenue</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-700">
              ₦{(FINANCIAL_METRICS.totalDuesCollected / 1000000).toFixed(1)}M
            </h3>
            <ProgressBar value={FINANCIAL_METRICS.complianceRate} showPercentage={false} height="sm" color="emerald" />
            <p className="text-[11px] text-slate-500">Target: ₦40.0M (91.7%)</p>
          </CardContent>
        </Card>

        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Welfare Fund Reserve</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              ₦{(FINANCIAL_METRICS.welfareFundBalance / 1000000).toFixed(1)}M
            </h3>
            <Badge variant="emerald" size="sm">Solvent & Audited</Badge>
            <p className="text-[11px] text-slate-500">3 active claims under review</p>
          </CardContent>
        </Card>

        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Elections Participation</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <Vote className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">{ELECTION_DATA.totalVotesCast} Votes</h3>
            <ProgressBar value={(ELECTION_DATA.totalVotesCast / ELECTION_DATA.totalEligibleVoters) * 100} showPercentage={false} height="sm" color="emerald" />
            <p className="text-[11px] text-slate-500">66.0% voter turnout</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hoverEffect variant="glass">
          <CardHeader>
            <div>
              <CardTitle>Monthly Financial Dues Trend (₦ Millions)</CardTitle>
              <CardDescription>2026 Collection Run-rate</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DuesTrendChart data={FINANCIAL_METRICS.monthlyDuesTrend} />
          </CardContent>
        </Card>

        <Card hoverEffect variant="glass">
          <CardHeader>
            <div>
              <CardTitle>Company Dues Compliance (%)</CardTitle>
              <CardDescription>Inter-Company Performance Ranking</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CompanyComplianceChart data={FINANCIAL_METRICS.companyBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* PENDING MEMBER VERIFICATIONS TABLE */}
      <Card hoverEffect variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-800">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Pending Member Verifications</CardTitle>
              <CardDescription>Review credentials before granting voting rights</CardDescription>
            </div>
          </div>
          <Badge variant="amber">{pendingMembers.length} Pending</Badge>
        </CardHeader>

        <CardContent>
          {pendingMembers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              ✓ All pending Ex-Boy registrations have been verified!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="pb-3 px-2">Member Name</th>
                    <th className="pb-3 px-2">NMS Service No</th>
                    <th className="pb-3 px-2">Company</th>
                    <th className="pb-3 px-2">Registered Email</th>
                    <th className="pb-3 px-2">Timestamp</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingMembers.map((mem) => (
                    <tr key={mem.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-2 font-bold text-slate-900">{mem.name}</td>
                      <td className="py-3.5 px-2 font-semibold text-emerald-800">{mem.nmsNo}</td>
                      <td className="py-3.5 px-2 text-slate-700">{mem.company}</td>
                      <td className="py-3.5 px-2 text-slate-600">{mem.email}</td>
                      <td className="py-3.5 px-2 text-slate-400">{mem.date}</td>
                      <td className="py-3.5 px-2 text-right">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleVerify(mem.id)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve & Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BROADCAST ANNOUNCEMENT MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 space-y-4 shadow-2xl border border-white">
            <h3 className="text-lg font-bold text-slate-900">Broadcast Official Announcement</h3>
            <p className="text-xs text-slate-500">This notification will be dispatched to all 485 verified Ex-Boys via portal alert and email.</p>
            <textarea
              rows={4}
              placeholder="Enter announcement text..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => {
                  alert('Broadcast dispatched successfully!');
                  setShowBroadcastModal(false);
                  setBroadcastMessage('');
                }}
              >
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
