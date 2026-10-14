'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
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
  Search,
  Eye,
  X,
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Activity,
  Heart,
  Printer,
} from 'lucide-react';

interface MemberProfileData {
  id: string;
  roster_id: string;
  nms_number: string;
  full_name: string;
  company: string;
  rank_appointment: string;
  set_appointment: string;
  dob: string;
  state_of_origin: string;
  state_of_residence: string;
  address: string;
  marital_status: string;
  email: string;
  phone: string;
  occupation: string;
  industry: string;
  business: string;
  skills: string;
  professional_qualifications: string;
  blood_group: string;
  genotype: string;
  next_of_kin: string;
  relationship: string;
  next_of_kin_phone: string;
  created_at: string;
  roster?: {
    registered: boolean;
    registered_at: string;
  };
}

export function AdminDashboard() {
  const [members, setMembers] = useState<MemberProfileData[]>([]);
  const [stats, setStats] = useState({ totalRegistered: 0, totalRoster: 0 });
  const [metrics, setMetrics] = useState({
    totalDuesCollected: 0,
    complianceRate: 0,
    targetDues: 0,
    welfareFundBalance: 0,
    activeClaimsUnderReview: 0,
    totalVotesCast: 0,
    totalEligibleVoters: 0,
    monthlyDuesTrend: [] as Array<{ month: string; amount: number }>,
    companyBreakdown: [] as Array<{ company: string; count: number; compliance: number }>,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<MemberProfileData | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setMembers(data.members || []);
          setStats(data.stats || { totalRegistered: 0, totalRoster: 0 });
          if (data.metrics) {
            setMetrics((prev) => ({ ...prev, ...data.metrics }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load admin members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.full_name?.toLowerCase().includes(q) ||
      m.nms_number?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.occupation?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.state_of_origin?.toLowerCase().includes(q) ||
      m.state_of_residence?.toLowerCase().includes(q);

    const matchesCompany =
      selectedCompany === 'ALL' ||
      m.company?.toLowerCase().includes(selectedCompany.toLowerCase());

    return matchesSearch && matchesCompany;
  });

  const exportToCsv = () => {
    if (!members.length) return;
    const headers = [
      'NMS Service No',
      'Full Name',
      'Company',
      'Military Rank',
      'Set Appointment',
      'Date of Birth',
      'State of Origin',
      'State of Residence',
      'Residential Address',
      'Marital Status',
      'Email Address',
      'Phone Number',
      'Occupation',
      'Industry',
      'Employer / Business',
      'Qualifications',
      'Skills',
      'Blood Group',
      'Genotype',
      'Next of Kin Name',
      'Relationship',
      'Next of Kin Phone',
      'Registration Date',
    ];

    const rows = members.map((m) => [
      `"${m.nms_number || ''}"`,
      `"${m.full_name || ''}"`,
      `"${m.company || ''}"`,
      `"${m.rank_appointment || ''}"`,
      `"${m.set_appointment || ''}"`,
      `"${m.dob || ''}"`,
      `"${m.state_of_origin || ''}"`,
      `"${m.state_of_residence || ''}"`,
      `"${(m.address || '').replace(/"/g, '""')}"`,
      `"${m.marital_status || ''}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.occupation || ''}"`,
      `"${m.industry || ''}"`,
      `"${m.business || ''}"`,
      `"${(m.professional_qualifications || '').replace(/"/g, '""')}"`,
      `"${(m.skills || '').replace(/"/g, '""')}"`,
      `"${m.blood_group || ''}"`,
      `"${m.genotype || ''}"`,
      `"${m.next_of_kin || ''}"`,
      `"${m.relationship || ''}"`,
      `"${m.next_of_kin_phone || ''}"`,
      `"${m.created_at || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `NMS_08_Registered_Members_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const registrationPercentage =
    stats.totalRoster > 0
      ? ((stats.totalRegistered / stats.totalRoster) * 100).toFixed(1)
      : '0';

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
              NMS 08 Alumni Secretariat Operations • Live Member Dossiers & Accredited Roster
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={exportToCsv}
              icon={<Download className="w-4 h-4 text-emerald-700" />}
              className="text-slate-900 font-semibold"
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBroadcastModal(true)}
              icon={<Megaphone className="w-4 h-4 text-emerald-400" />}
            >
              Broadcast Announcement
            </Button>
          </div>
        </div>
      </Card>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Registered Ex-Boys</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {stats.totalRegistered} / {stats.totalRoster}
            </h3>
            <ProgressBar
              value={stats.totalRoster > 0 ? (stats.totalRegistered / stats.totalRoster) * 100 : 0}
              showPercentage={false}
              height="sm"
              color="emerald"
            />
            <p className="text-[11px] text-slate-500">
              {registrationPercentage}% of national roster accredited
            </p>
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
              ₦{(metrics.totalDuesCollected / 1_000_000).toFixed(1)}M
            </h3>
            <ProgressBar
              value={metrics.complianceRate}
              showPercentage={false}
              height="sm"
              color="emerald"
            />
            <p className="text-[11px] text-slate-500">
              {metrics.complianceRate}% compliance
              {metrics.targetDues > 0
                ? ` • Target: ₦${(metrics.targetDues / 1_000_000).toFixed(1)}M`
                : ''}
            </p>
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
              ₦{(metrics.welfareFundBalance / 1_000_000).toFixed(1)}M
            </h3>
            <Badge variant="emerald" size="sm">Solvent & Audited</Badge>
            <p className="text-[11px] text-slate-500">
              {metrics.activeClaimsUnderReview} active{' '}
              {metrics.activeClaimsUnderReview === 1 ? 'claim' : 'claims'} under review
            </p>
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
            <h3 className="text-2xl font-extrabold text-slate-900">
              {metrics.totalVotesCast} Votes
            </h3>
            <ProgressBar
              value={
                metrics.totalEligibleVoters > 0
                  ? (metrics.totalVotesCast / metrics.totalEligibleVoters) * 100
                  : 0
              }
              showPercentage={false}
              height="sm"
              color="emerald"
            />
            <p className="text-[11px] text-slate-500">
              {metrics.totalEligibleVoters > 0
                ? `${((metrics.totalVotesCast / metrics.totalEligibleVoters) * 100).toFixed(1)}% voter turnout`
                : 'No active election recorded yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* REGISTERED EX-BOYS DIRECTORY & DOSSIER ACCESS TABLE */}
      <Card hoverEffect variant="glass">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Accredited Ex-Boys Member Profiles</CardTitle>
                <CardDescription>
                  Complete visitor registration submissions & full dossiers ({filteredMembers.length} shown)
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMembers}
                icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>
              <Badge variant="emerald">Live Supabase Sync</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pb-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, NMS number (e.g. NMS/08/6672), email, phone, occupation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                <option value="ALL">All Companies</option>
                <option value="Alpha">Alpha Company</option>
                <option value="Bravo">Bravo Company</option>
                <option value="Charlie">Charlie Company</option>
                <option value="Delta">Delta Company</option>
                <option value="Echo">Echo Company</option>
                <option value="Foxtrot">Foxtrot Company</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading verified Ex-Boy dossiers from Supabase...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              {members.length === 0
                ? 'No registered member profiles recorded in Supabase yet. When visitors register, their full profiles will appear here.'
                : 'No registered members match your search criteria.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Ex-Boy Name</th>
                    <th className="pb-3 px-3">Service No</th>
                    <th className="pb-3 px-3">Company & Rank</th>
                    <th className="pb-3 px-3">Contact</th>
                    <th className="pb-3 px-3">Career</th>
                    <th className="pb-3 px-3">Registered At</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((mem) => (
                    <tr key={mem.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{mem.full_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {mem.state_of_origin} • Resides in {mem.state_of_residence}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          {mem.nms_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{mem.company}</div>
                        <div className="text-[11px] text-slate-500">{mem.rank_appointment || 'Boy Soldier'}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-slate-700">{mem.email}</div>
                        <div className="text-[11px] text-slate-400">{mem.phone}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">{mem.occupation || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{mem.industry || ''}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        {mem.created_at ? new Date(mem.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => setSelectedMember(mem)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Full Dossier
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

      {/* FULL MEMBER PROFILE DOSSIER MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-apple-sm">
                  {selectedMember.full_name ? selectedMember.full_name[0].toUpperCase() : 'N'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedMember.full_name}</h3>
                    <Badge variant="emerald" size="sm">Verified Member</Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Service No: {selectedMember.nms_number} • {selectedMember.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Categorical Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. Military Background */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Military Background</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">NMS Service No:</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedMember.nms_number}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">School Company:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.company}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Rank as Boy Soldier:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.rank_appointment || 'Boy Soldier'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Set Appointment:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.set_appointment || 'Member'}</span>
                </div>
              </div>

              {/* 2. Personal Information */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <User className="w-4 h-4 text-blue-700" />
                  <span>Personal Demographics</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Date of Birth:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.dob || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Marital Status:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.marital_status || 'Single'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">State of Origin:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.state_of_origin}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">State of Residence:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.state_of_residence}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Address:</span>
                  <span className="font-medium text-slate-800 block text-[11px] bg-white p-1.5 rounded-lg border border-slate-200">
                    {selectedMember.address || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* 3. Contact Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <Mail className="w-4 h-4 text-purple-700" />
                  <span>Contact Information</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block text-[11px]">Email Address:</span>
                  <a href={`mailto:${selectedMember.email}`} className="font-semibold text-emerald-700 hover:underline break-all">
                    {selectedMember.email}
                  </a>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block text-[11px]">Phone / WhatsApp:</span>
                  <a href={`tel:${selectedMember.phone}`} className="font-semibold text-slate-900 hover:underline">
                    {selectedMember.phone || 'Not specified'}
                  </a>
                </div>
              </div>

              {/* 4. Professional Career */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <Briefcase className="w-4 h-4 text-indigo-700" />
                  <span>Professional Career</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Occupation:</span>
                  <span className="font-bold text-slate-900">{selectedMember.occupation || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Industry:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.industry || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employer / Business:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.business || 'N/A'}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Qualifications:</span>
                  <span className="font-medium text-slate-800 block text-[11px] bg-white p-1.5 rounded-lg border border-slate-200">
                    {selectedMember.professional_qualifications || 'None specified'}
                  </span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Skills:</span>
                  <span className="font-medium text-slate-800 block text-[11px] bg-white p-1.5 rounded-lg border border-slate-200">
                    {selectedMember.skills || 'None specified'}
                  </span>
                </div>
              </div>

              {/* 5. Medical Emergency Data */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <Activity className="w-4 h-4 text-rose-700" />
                  <span>Medical Emergency Info</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Blood Group</span>
                    <span className="text-lg font-extrabold text-rose-900">{selectedMember.blood_group || 'O+'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Genotype</span>
                    <span className="text-lg font-extrabold text-amber-900">{selectedMember.genotype || 'AA'}</span>
                  </div>
                </div>
              </div>

              {/* 6. Next of Kin Information */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <Heart className="w-4 h-4 text-emerald-700" />
                  <span>Next of Kin Particulars</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Next of Kin Name:</span>
                  <span className="font-bold text-slate-900">{selectedMember.next_of_kin || 'Designated Contact'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.relationship || 'Next of Kin'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Contact Phone:</span>
                  <a href={`tel:${selectedMember.next_of_kin_phone}`} className="font-semibold text-emerald-700 hover:underline">
                    {selectedMember.next_of_kin_phone || 'Not specified'}
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                Registered on: {selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleString() : 'N/A'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Profile
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            {metrics.monthlyDuesTrend.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No dues payments recorded yet.
              </div>
            ) : (
              <DuesTrendChart data={metrics.monthlyDuesTrend} />
            )}
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
            {metrics.companyBreakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No company-level dues data recorded yet.
              </div>
            ) : (
              <CompanyComplianceChart data={metrics.companyBreakdown} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* BROADCAST ANNOUNCEMENT MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 space-y-4 shadow-2xl border border-white">
            <h3 className="text-lg font-bold text-slate-900">Broadcast Official Announcement</h3>
            <p className="text-xs text-slate-500">
              This notification will be dispatched to all accredited Ex-Boys via portal alert and email.
            </p>
            <textarea
              rows={4}
              placeholder="Enter announcement text..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowBroadcastModal(false)}>
                Cancel
              </Button>
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
