'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
import shieldSvg from '@/assets/shield.svg';
import militaryManSvg from '@/assets/military-man.svg';
import cardSvg from '@/assets/card.svg';
import dogTagsSvg from '@/assets/Dog-tags.svg';
import rankSvg from '@/assets/rank.svg';
import speakerSvg from '@/assets/speaker.svg';
import buildingSvg from '@/assets/building.svg';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { DuesTrendChart, CompanyComplianceChart } from './Charts';
import { ANNUAL_ARREARS_CAP_NGN, ANNUAL_DISCOUNT_NGN, MONTHLY_DUES_NGN } from '@/lib/dues-utils';
import { formatNaira } from '@/lib/paystack';
import {
  ShieldAlert,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Megaphone,
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Droplet,
  Home,
  Sparkles,
  GraduationCap,
  Calendar,
  Trash2,
  Send,
  Layers,
  Bell,
  Check,
  Cake,
} from 'lucide-react';
import { normalizeCompanyId } from '@/lib/company-utils';

export interface MemberProfileData {
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

export type SortField =
  | 'industry'
  | 'blood_group'
  | 'company'
  | 'state_of_origin'
  | 'state_of_residence'
  | 'business'
  | 'skills'
  | 'professional_qualifications'
  | 'full_name'
  | 'created_at'
  | 'dob'
  | 'birth_month';

interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'dues' | 'general' | 'welfare' | 'event' | 'urgent';
  severity: 'info' | 'warning' | 'urgent';
  target: 'all' | 'registered' | 'members';
  showOnTicker: boolean;
  postedBy: string;
  createdAt: string;
  active: boolean;
}

const SORT_OPTIONS: Array<{ field: SortField; label: string; icon: React.ReactNode }> = [
  { field: 'industry', label: 'Industry', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { field: 'blood_group', label: 'Blood Group', icon: <Droplet className="w-3.5 h-3.5" /> },
  { field: 'company', label: 'Company', icon: <Shield className="w-3.5 h-3.5" /> },
  { field: 'state_of_origin', label: 'State of Origin', icon: <MapPin className="w-3.5 h-3.5" /> },
  { field: 'state_of_residence', label: 'State of Residence', icon: <Home className="w-3.5 h-3.5" /> },
  { field: 'business', label: 'Business / Employer', icon: <Image src={buildingSvg} alt="Business" width={14} height={14} className="w-3.5 h-3.5 object-contain" /> },
  { field: 'skills', label: 'Skills', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { field: 'professional_qualifications', label: 'Professional Qualifications', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { field: 'full_name', label: 'Member Name', icon: <User className="w-3.5 h-3.5" /> },
  { field: 'created_at', label: 'Registration Date', icon: <Calendar className="w-3.5 h-3.5" /> },
  { field: 'dob', label: 'Date of Birth', icon: <Calendar className="w-3.5 h-3.5" /> },
  { field: 'birth_month', label: 'Birth Month', icon: <Cake className="w-3.5 h-3.5" /> },
];

export function AdminDashboard() {
  const [members, setMembers] = useState<MemberProfileData[]>([]);
  const [stats, setStats] = useState({ totalRegistered: 0, totalRoster: 0 });
  const [metrics, setMetrics] = useState({
    totalDuesCollected: 0,
    complianceRate: 0,
    targetDues: 0,
    welfareFundBalance: 0,
    activeClaimsUnderReview: 0,
    monthlyDuesTrend: [] as Array<{ month: string; amount: number }>,
    companyBreakdown: [] as Array<{ company: string; count: number; compliance: number }>,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<MemberProfileData | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Broadcast modal & announcements state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'dues' | 'general' | 'welfare' | 'event' | 'urgent'>('dues');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'info' | 'warning' | 'urgent'>('info');
  const [broadcastPinTicker, setBroadcastPinTicker] = useState(true);
  const [broadcastSender, setBroadcastSender] = useState('National Executive Secretariat');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [activeAnnouncements, setActiveAnnouncements] = useState<BroadcastAnnouncement[]>([]);

  // Admin portal password gate
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('nms08_admin_authed') === 'true') {
      setAdminAuthed(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        sessionStorage.setItem('nms08_admin_authed', 'true');
        setAdminPassword('');
        setAdminAuthed(true);
      } else {
        setAdminError(data?.message || 'Incorrect admin password. Please try again.');
      }
    } catch {
      setAdminError('Could not reach the server. Please try again.');
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/members');
      if (res.status === 401 || res.status === 403) {
        // The server session is missing/expired — force the password gate again.
        sessionStorage.removeItem('nms08_admin_authed');
        setAdminAuthed(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          let list: MemberProfileData[] = data.members || [];

          // Merge any locally registered member submissions
          if (typeof window !== 'undefined') {
            try {
              const localSaved = localStorage.getItem('nms08_registered_members');
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                if (Array.isArray(parsed)) {
                  parsed.forEach((pm: any) => {
                    if (!list.some((existing) => existing.nms_number === pm.nms_number)) {
                      list = [pm, ...list];
                    }
                  });
                }
              }
            } catch {}
          }

          setMembers(list);
          setStats(data.stats || { totalRegistered: list.length, totalRoster: 246 });
          if (data.metrics) {
            // Synchronize company breakdown with real registered counts from list
            const serverBreakdown = Array.isArray(data.metrics.companyBreakdown) ? data.metrics.companyBreakdown : [];
            const companyNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
            const syncBreakdown = companyNames.map((name) => {
              const count = list.filter((m) => (m.company || '').toLowerCase().includes(name.toLowerCase())).length;
              const match = serverBreakdown.find((b: any) => b.company.toLowerCase() === name.toLowerCase());
              return {
                company: name,
                count,
                compliance: match ? match.compliance : 0,
              };
            }).sort((a, b) => a.company.localeCompare(b.company));

            setMetrics((prev) => ({
              ...prev,
              ...data.metrics,
              companyBreakdown: syncBreakdown,
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load admin members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.announcements)) {
          setActiveAnnouncements(data.announcements);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nms08_admin_announcements', JSON.stringify(data.announcements));
          }
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('nms08_admin_announcements');
          if (stored) setActiveAnnouncements(JSON.parse(stored));
        } catch {}
      }
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchAnnouncements();

    const handleUpdate = () => {
      fetchMembers();
      fetchAnnouncements();
    };

    window.addEventListener('nms08-members-updated', handleUpdate);
    window.addEventListener('nms08-company-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nms08-members-updated', handleUpdate);
      window.removeEventListener('nms08-company-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Compute live registered member counts per company for filters and summaries
  const companyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      alpha: 0,
      bravo: 0,
      charlie: 0,
      delta: 0,
      echo: 0,
      foxtrot: 0,
      golf: 0,
    };
    members.forEach((m) => {
      const cid = normalizeCompanyId(m.company);
      if (cid && counts[cid] !== undefined) {
        counts[cid]++;
      }
    });
    return counts;
  }, [members]);

  // Helper: extract numeric month from "YYYY-MM-DD" date string
  const extractMonth = (d: string): number => {
    if (!d) return 0;
    const parts = d.split('-');
    return parts.length >= 2 ? parseInt(parts[1], 10) : 0;
  };

  // Helper: month number to readable name
  const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const getMonthName = (d: string): string => {
    const m = extractMonth(d);
    return MONTH_NAMES[m] || 'Unknown Month';
  };

  // Helper: format date of birth cleanly (e.g. "14 May 1992")
  const formatDob = (d: string): string => {
    if (!d) return 'Not Specified';
    const parts = d.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const monthName = MONTH_NAMES[month] || '';
      if (monthName && !isNaN(day)) {
        return `${day} ${monthName} ${year}`;
      }
    }
    return d;
  };

  // Filtered and Sorted members computation
  const filteredAndSortedMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = members.filter((m) => {
      const matchesSearch =
        !q ||
        m.full_name?.toLowerCase().includes(q) ||
        m.nms_number?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.occupation?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q) ||
        m.company?.toLowerCase().includes(q) ||
        m.blood_group?.toLowerCase().includes(q) ||
        m.business?.toLowerCase().includes(q) ||
        m.skills?.toLowerCase().includes(q) ||
        m.professional_qualifications?.toLowerCase().includes(q) ||
        m.state_of_origin?.toLowerCase().includes(q) ||
        m.state_of_residence?.toLowerCase().includes(q);

      const matchesCompany =
        selectedCompany === 'ALL' ||
        m.company?.toLowerCase().includes(selectedCompany.toLowerCase());

      return matchesSearch && matchesCompany;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'created_at') {
        const tA = new Date(a.created_at || 0).getTime();
        const tB = new Date(b.created_at || 0).getTime();
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      }

      if (sortBy === 'dob') {
        const tA = new Date(a.dob || 0).getTime();
        const tB = new Date(b.dob || 0).getTime();
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      }

      if (sortBy === 'birth_month') {
        const mA = extractMonth(a.dob || '');
        const mB = extractMonth(b.dob || '');
        if (mA !== mB) return sortOrder === 'asc' ? mA - mB : mB - mA;
        // Secondary sort by day within the same month
        const dA = a.dob ? parseInt(a.dob.split('-')[2] || '0', 10) : 0;
        const dB = b.dob ? parseInt(b.dob.split('-')[2] || '0', 10) : 0;
        return sortOrder === 'asc' ? dA - dB : dB - dA;
      }

      const valA = ((a as any)[sortBy] || '').toString().toLowerCase().trim();
      const valB = ((b as any)[sortBy] || '').toString().toLowerCase().trim();
      const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [members, searchQuery, selectedCompany, sortBy, sortOrder]);

  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setShowSortDropdown(false);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    try {
      setBroadcastSending(true);
      const payload = {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: broadcastCategory,
        severity: broadcastSeverity,
        target: 'all',
        showOnTicker: broadcastPinTicker,
        postedBy: broadcastSender.trim() || 'National Executive Council / Admin',
      };

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setBroadcastSuccess('Announcement broadcast successfully dispatched to all member pages & ticker!');
          fetchAnnouncements();

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nms08-announcements-updated'));
          }

          setTimeout(() => {
            setShowBroadcastModal(false);
            setBroadcastTitle('');
            setBroadcastMessage('');
            setBroadcastSuccess(null);
          }, 1200);
        }
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nms08-announcements-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const registrationPercentage =
    stats.totalRoster > 0
      ? ((stats.totalRegistered / stats.totalRoster) * 100).toFixed(1)
      : '0';

  if (!adminAuthed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card variant="glass" className="p-8 space-y-6">
            <div className="text-center space-y-3 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center p-2.5 shadow-apple-sm">
                <Image src={shieldSvg} alt="Admin Security Shield" width={32} height={32} className="w-8 h-8 object-contain" />
              </div>
              <Badge variant="emerald">Restricted Access</Badge>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Admin Portal Access
              </h1>
              <p className="text-xs text-slate-500">
                Enter the administrative password to unlock the National Executive Console.
              </p>
            </div>

            {adminError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <p className="font-medium">{adminError}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="emerald"
                className="w-full justify-center text-sm py-3"
                icon={<Shield className="w-4 h-4" />}
              >
                Unlock Admin Console
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  const activeSortLabel = SORT_OPTIONS.find((s) => s.field === sortBy)?.label || 'Registration Date';

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
              variant="secondary"
              size="sm"
              onClick={() => setShowBroadcastModal(true)}
              icon={<Image src={speakerSvg} alt="Speaker" width={16} height={16} className="w-4 h-4 object-contain" />}
            >
              Post Broadcast Notification
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
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Image src={militaryManSvg} alt="Registered Ex-Boys" width={20} height={20} className="w-5 h-5 object-contain" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {stats.totalRegistered}{' '}
              <span className="text-xs font-normal text-slate-500">/ {stats.totalRoster}</span>
            </h3>
            <ProgressBar value={Number(registrationPercentage)} showPercentage={false} height="sm" color="emerald" />
            <p className="text-[11px] text-slate-500">{registrationPercentage}% accreditation rate</p>
          </CardContent>
        </Card>

        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Dues Collected</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Image src={cardSvg} alt="Dues Levies" width={20} height={20} className="w-5 h-5 object-contain" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              ₦{(metrics.totalDuesCollected / 1_000_000).toFixed(1)}M
            </h3>
            <ProgressBar value={metrics.complianceRate} showPercentage={false} height="sm" color="emerald" />
            <p className="text-[11px] text-slate-500">{metrics.complianceRate}% set compliance</p>
            <p className="text-[11px] text-slate-400">
              {formatNaira(MONTHLY_DUES_NGN)}/month per Ex-Boy • {formatNaira(ANNUAL_DISCOUNT_NGN)} settles the year
              (max {formatNaira(ANNUAL_ARREARS_CAP_NGN)})
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect variant="glass">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Welfare Fund Balance</span>
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Image src={buildingSvg} alt="Welfare Fund" width={20} height={20} className="w-5 h-5 object-contain" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              ₦{(metrics.welfareFundBalance / 1_000_000).toFixed(1)}M
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{metrics.activeClaimsUnderReview} claims under review</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* REGISTERED EX-BOYS DIRECTORY & DOSSIER ACCESS TABLE */}
      <Card hoverEffect variant="glass">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shadow-apple-sm flex items-center justify-center">
                <Image src={dogTagsSvg} alt="Dog Tags Roster" width={22} height={22} className="w-5 h-5 object-contain" />
              </div>
              <div>
                <CardTitle>Accredited Ex-Boys Member Profiles</CardTitle>
                <CardDescription>
                  Live member dossiers sorted by {activeSortLabel} ({filteredAndSortedMembers.length} records shown)
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
              <Badge variant="emerald">Live Synchronized</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* SEARCH & SORT CONTROLS BAR */}
          <div className="space-y-3 pb-2 border-b border-slate-200/60">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, service no (e.g. NMS/08/4912), industry, blood group, skills, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>

              {/* Company Filter Dropdown */}
              <div className="w-full lg:w-44">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="ALL">All Companies ({members.length})</option>
                  <option value="Alpha">Alpha Company ({companyCounts.alpha})</option>
                  <option value="Bravo">Bravo Company ({companyCounts.bravo})</option>
                  <option value="Charlie">Charlie Company ({companyCounts.charlie})</option>
                  <option value="Delta">Delta Company ({companyCounts.delta})</option>
                  <option value="Echo">Echo Company ({companyCounts.echo})</option>
                  <option value="Foxtrot">Foxtrot Company ({companyCounts.foxtrot})</option>
                  <option value="Golf">Golf Company ({companyCounts.golf})</option>
                </select>
              </div>

              {/* PRIMARY SORT DROPDOWN BUTTON (Requested by user) */}
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                    className="shadow-apple-sm whitespace-nowrap"
                  >
                    <span>Sort Members By</span>
                    <span className="ml-1 text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {activeSortLabel}
                    </span>
                  </Button>

                  {/* Dropdown Menu */}
                  {showSortDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-apple-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Sort Criteria
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Order: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                        </span>
                      </div>
                      <div className="py-1 max-h-72 overflow-y-auto space-y-0.5">
                        {SORT_OPTIONS.map((opt) => {
                          const isSelected = sortBy === opt.field;
                          return (
                            <button
                              key={opt.field}
                              onClick={() => handleSortChange(opt.field)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={isSelected ? 'text-emerald-700' : 'text-slate-400'}>
                                  {opt.icon}
                                </span>
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Order Direction Toggle (Ascending / Descending) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={`Toggle order: currently ${sortOrder === 'asc' ? 'Ascending (A-Z)' : 'Descending (Z-A)'}`}
                  icon={sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-700" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />}
                >
                  <span className="hidden sm:inline font-mono">{sortOrder === 'asc' ? 'A → Z' : 'Z → A'}</span>
                </Button>
              </div>
            </div>

            {/* QUICK SORT PILL BUTTONS (One-click access to all requested criteria) */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Quick Sort:
              </span>
              {[
                { field: 'industry' as SortField, label: 'Industry', icon: <Briefcase className="w-3 h-3" /> },
                { field: 'blood_group' as SortField, label: 'Blood Group', icon: <Droplet className="w-3 h-3" /> },
                { field: 'company' as SortField, label: 'Company', icon: <Shield className="w-3 h-3" /> },
                { field: 'state_of_origin' as SortField, label: 'State of Origin', icon: <MapPin className="w-3 h-3" /> },
                { field: 'state_of_residence' as SortField, label: 'State of Residence', icon: <Home className="w-3 h-3" /> },
                { field: 'business' as SortField, label: 'Business', icon: <Image src={buildingSvg} alt="Business" width={12} height={12} className="w-3 h-3 object-contain" /> },
                { field: 'skills' as SortField, label: 'Skills', icon: <Sparkles className="w-3 h-3" /> },
                { field: 'professional_qualifications' as SortField, label: 'Qualifications', icon: <GraduationCap className="w-3 h-3" /> },
                { field: 'birth_month' as SortField, label: 'Birth Month', icon: <Cake className="w-3 h-3" /> },
              ].map((pill) => {
                const isActive = sortBy === pill.field;
                return (
                  <button
                    key={pill.field}
                    onClick={() => handleSortChange(pill.field)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-apple-sm ring-2 ring-emerald-600/30'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span>{pill.icon}</span>
                    <span>{pill.label}</span>
                    {isActive && (
                      <span className="text-[9px] opacity-80">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                );
              })}

              {sortBy !== 'created_at' && (
                <button
                  onClick={() => {
                    setSortBy('created_at');
                    setSortOrder('desc');
                  }}
                  className="px-2 py-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold underline ml-auto"
                >
                  Reset Sort
                </button>
              )}
            </div>
          </div>

          {/* Members Table — Context-Aware Clean Sort View */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading verified Ex-Boy dossiers...</span>
            </div>
          ) : filteredAndSortedMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              {members.length === 0
                ? 'No registered member profiles recorded yet. When visitors register, their full profiles will appear here.'
                : 'No registered members match your search or filter criteria.'}
            </div>
          ) : (() => {
            // Determine if a focused sort is active (not the default "all columns" view)
            const isDefaultView = sortBy === 'created_at' || sortBy === 'full_name';

            // Build group headers for grouped sort views (birth_month, blood_group, company, etc.)
            const shouldGroup = !isDefaultView;

            // Grouping key function
            const getGroupKey = (mem: MemberProfileData): string => {
              switch (sortBy) {
                case 'blood_group': return mem.blood_group || 'Not Specified';
                case 'company': return mem.company || 'Unassigned';
                case 'state_of_origin': return mem.state_of_origin || 'Not Specified';
                case 'state_of_residence': return mem.state_of_residence || 'Not Specified';
                case 'industry': return mem.industry || mem.occupation || 'Not Specified';
                case 'business': return mem.business || 'Not Specified';
                case 'skills': return mem.skills || 'Not Specified';
                case 'professional_qualifications': return mem.professional_qualifications || 'Not Specified';
                case 'birth_month': return getMonthName(mem.dob || '');
                case 'dob': return mem.dob || 'Not Specified';
                default: return '';
              }
            };

            // Get group icon and color
            const getGroupStyle = (): { bg: string; text: string; border: string; icon: React.ReactNode } => {
              switch (sortBy) {
                case 'blood_group': return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: <Droplet className="w-4 h-4 text-rose-600" /> };
                case 'company': return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: <Shield className="w-4 h-4 text-emerald-600" /> };
                case 'state_of_origin': return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', icon: <MapPin className="w-4 h-4 text-indigo-600" /> };
                case 'state_of_residence': return { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', icon: <Home className="w-4 h-4 text-violet-600" /> };
                case 'industry': return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: <Briefcase className="w-4 h-4 text-amber-600" /> };
                case 'business': return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', icon: <Image src={buildingSvg} alt="Business" width={16} height={16} className="w-4 h-4 object-contain" /> };
                case 'skills': return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: <Sparkles className="w-4 h-4 text-blue-600" /> };
                case 'professional_qualifications': return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: <GraduationCap className="w-4 h-4 text-purple-600" /> };
                case 'birth_month': return { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', icon: <Cake className="w-4 h-4 text-pink-600" /> };
                case 'dob': return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', icon: <Calendar className="w-4 h-4 text-teal-600" /> };
                default: return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', icon: <Layers className="w-4 h-4 text-slate-600" /> };
              }
            };

            // Get the contextual value for the sort field
            const getSortValue = (mem: MemberProfileData): string => {
              switch (sortBy) {
                case 'blood_group': return `${mem.blood_group || 'N/A'} (${mem.genotype || 'AA'})`;
                case 'company': return mem.company || 'N/A';
                case 'state_of_origin': return mem.state_of_origin || 'N/A';
                case 'state_of_residence': return mem.state_of_residence || 'N/A';
                case 'industry': return mem.industry || mem.occupation || 'N/A';
                case 'business': return mem.business || 'N/A';
                case 'skills': return mem.skills || 'N/A';
                case 'professional_qualifications': return mem.professional_qualifications || 'N/A';
                case 'birth_month': return formatDob(mem.dob || '');
                case 'dob': return formatDob(mem.dob || '');
                default: return '';
              }
            };

            // Get secondary detail for additional context
            const getSecondaryDetail = (mem: MemberProfileData): string => {
              switch (sortBy) {
                case 'birth_month':
                  return [mem.phone ? `Tel: ${mem.phone}` : '', mem.state_of_residence ? `Resides: ${mem.state_of_residence}` : '', mem.email].filter(Boolean).join(' • ') || '—';
                case 'dob':
                  return [mem.phone ? `Tel: ${mem.phone}` : '', mem.state_of_residence ? `Resides: ${mem.state_of_residence}` : ''].filter(Boolean).join(' • ') || '—';
                case 'blood_group': {
                  const parts: string[] = [];
                  if (mem.next_of_kin) parts.push(`Next of Kin: ${mem.next_of_kin}`);
                  if (mem.next_of_kin_phone) parts.push(`NOK Tel: ${mem.next_of_kin_phone}`);
                  return parts.join(' • ') || 'No emergency contact on file';
                }
                case 'company':
                  return [mem.rank_appointment, mem.state_of_residence ? `Resides: ${mem.state_of_residence}` : '', mem.phone].filter(Boolean).join(' • ') || '—';
                case 'state_of_origin':
                  return [mem.state_of_residence ? `Current Residence: ${mem.state_of_residence}` : '', mem.phone ? `Tel: ${mem.phone}` : ''].filter(Boolean).join(' • ') || '—';
                case 'state_of_residence':
                  return [mem.state_of_origin ? `Origin: ${mem.state_of_origin}` : '', mem.address ? `Address: ${mem.address}` : ''].filter(Boolean).join(' • ') || '—';
                case 'industry':
                  return [mem.business ? `Employer: ${mem.business}` : '', mem.occupation ? `Role: ${mem.occupation}` : ''].filter(Boolean).join(' • ') || '—';
                case 'business':
                  return [mem.industry ? `Industry: ${mem.industry}` : '', mem.occupation ? `Role: ${mem.occupation}` : ''].filter(Boolean).join(' • ') || '—';
                case 'skills':
                  return mem.professional_qualifications ? `Qualifications: ${mem.professional_qualifications}` : '—';
                case 'professional_qualifications':
                  return mem.skills ? `Skills: ${mem.skills}` : '—';
                default:
                  return '—';
              }
            };

            if (isDefaultView) {
              // DEFAULT VIEW: Show all columns in classic table
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <th
                          className="pb-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors"
                          onClick={() => handleSortChange('full_name')}
                        >
                          <div className="flex items-center gap-1">
                            <span>Ex-Boy Name</span>
                            {sortBy === 'full_name' && (
                              <span className="text-emerald-700">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="pb-3 px-3">Service No</th>
                        <th
                          className="pb-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors"
                          onClick={() => handleSortChange('company')}
                          title="Click to sort and focus by Company"
                        >
                          <div className="flex items-center gap-1">
                            <span>Company</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          </div>
                        </th>
                        <th
                          className="pb-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors"
                          onClick={() => handleSortChange('blood_group')}
                          title="Click to sort and focus by Blood Group"
                        >
                          <div className="flex items-center gap-1">
                            <span>Blood Group</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          </div>
                        </th>
                        <th
                          className="pb-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors"
                          onClick={() => handleSortChange('state_of_origin')}
                          title="Click to sort and focus by State of Origin"
                        >
                          <div className="flex items-center gap-1">
                            <span>Origin & Residence</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          </div>
                        </th>
                        <th
                          className="pb-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors"
                          onClick={() => handleSortChange('industry')}
                          title="Click to sort and focus by Industry"
                        >
                          <div className="flex items-center gap-1">
                            <span>Industry & Business</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          </div>
                        </th>
                        <th
                          className="pb-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors"
                          onClick={() => handleSortChange('skills')}
                          title="Click to sort and focus by Skills & Qualifications"
                        >
                          <div className="flex items-center gap-1">
                            <span>Skills & Qualifications</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          </div>
                        </th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAndSortedMembers.map((mem) => (
                        <tr key={mem.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900">{mem.full_name}</div>
                            <div className="text-[11px] text-slate-400">{mem.rank_appointment || 'Boy Soldier'}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                              {mem.nms_number}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800">{mem.company}</div>
                            <div className="text-[11px] text-slate-400">{mem.set_appointment || 'Member'}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                                {mem.blood_group || 'O+'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{mem.genotype || 'AA'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-medium text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{mem.state_of_origin || 'N/A'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">Resides: {mem.state_of_residence || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800">{mem.industry || mem.occupation || 'N/A'}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[160px]" title={mem.business}>
                              {mem.business || mem.occupation || 'Self-employed'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-medium text-slate-700 truncate max-w-[170px]" title={mem.professional_qualifications}>
                              {mem.professional_qualifications || 'N/A'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]" title={mem.skills}>
                              {mem.skills || 'General Management'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <Button
                              variant="emerald"
                              size="sm"
                              onClick={() => setSelectedMember(mem)}
                              icon={<Eye className="w-3.5 h-3.5" />}
                            >
                              Dossier
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // FOCUSED SORT VIEW: Grouped, clean data with only relevant columns
            const groupStyle = getGroupStyle();
            const groups: Array<{ key: string; members: MemberProfileData[] }> = [];
            const groupMap = new Map<string, MemberProfileData[]>();

            filteredAndSortedMembers.forEach((mem) => {
              const key = getGroupKey(mem);
              if (!groupMap.has(key)) {
                groupMap.set(key, []);
                groups.push({ key, members: groupMap.get(key)! });
              }
              groupMap.get(key)!.push(mem);
            });

            return (
              <div className="space-y-4">
                {/* Active Sort Summary Banner */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${groupStyle.bg} ${groupStyle.border} border`}>
                  {groupStyle.icon}
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${groupStyle.text}`}>
                      Sorted by {activeSortLabel}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {filteredAndSortedMembers.length} members across {groups.length} group{groups.length !== 1 ? 's' : ''} • {sortOrder === 'asc' ? 'Ascending' : 'Descending'} order
                    </p>
                  </div>
                  <button
                    onClick={() => { setSortBy('created_at'); setSortOrder('desc'); }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline transition-colors"
                  >
                    Show All Columns
                  </button>
                </div>

                {/* Grouped Data Sections */}
                {groups.map((group) => (
                  <div key={group.key} className="rounded-2xl border border-slate-200/80 overflow-hidden">
                    {/* Group Header */}
                    <div className={`flex items-center justify-between px-4 py-2.5 ${groupStyle.bg} ${groupStyle.border} border-b`}>
                      <div className="flex items-center gap-2">
                        {groupStyle.icon}
                        <h4 className={`font-bold text-sm ${groupStyle.text}`}>{group.key}</h4>
                      </div>
                      <Badge variant="emerald" size="sm">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Clean Focused Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
                            <th className="pb-2.5 pt-2.5 px-4">#</th>
                            <th className="pb-2.5 pt-2.5 px-3">Ex-Boy Name</th>
                            <th className="pb-2.5 pt-2.5 px-3">Service No</th>
                            <th className="pb-2.5 pt-2.5 px-3">
                              {sortBy === 'company' ? 'Role / Appointment' : 'Company'}
                            </th>
                            <th className={`pb-2.5 pt-2.5 px-3 ${groupStyle.text} font-bold`}>
                              {sortBy === 'birth_month' ? 'Date of Birth' : activeSortLabel}
                            </th>
                            <th className="pb-2.5 pt-2.5 px-3">Additional Detail</th>
                            <th className="pb-2.5 pt-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.members.map((mem, idx) => (
                            <tr key={mem.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{mem.full_name}</div>
                                <div className="text-[11px] text-slate-400">{mem.rank_appointment || 'Boy Soldier'}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-[11px]">
                                  {mem.nms_number}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-700 text-[11px]">
                                  {sortBy === 'company' ? (mem.set_appointment || 'Member') : mem.company}
                                </div>
                              </td>
                              <td className={`py-3 px-3 ${groupStyle.bg} rounded-lg`}>
                                <div className={`font-bold ${groupStyle.text}`}>{getSortValue(mem)}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-[11px] text-slate-500 max-w-[200px] truncate" title={getSecondaryDetail(mem)}>
                                  {getSecondaryDetail(mem) || '—'}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <Button
                                  variant="emerald"
                                  size="sm"
                                  onClick={() => setSelectedMember(mem)}
                                  icon={<Eye className="w-3.5 h-3.5" />}
                                >
                                  Dossier
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* ACTIVE BROADCAST ANNOUNCEMENTS MANAGEMENT CARD */}
      <Card hoverEffect variant="glass">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shadow-apple-sm flex items-center justify-center">
                <Image src={speakerSvg} alt="Broadcast Speaker" width={20} height={20} className="w-5 h-5 object-contain" />
              </div>
              <div>
                <CardTitle>Active Portal Broadcasts & Member Notifications</CardTitle>
                <CardDescription>
                  Announcements currently live on all member dashboards and the scrolling bulletin ticker
                </CardDescription>
              </div>
            </div>

            <Button
              variant="emerald"
              size="sm"
              onClick={() => setShowBroadcastModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              New Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeAnnouncements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No active broadcasts published. Click "New Announcement" to broadcast to all registered pages.
            </div>
          ) : (
            <div className="space-y-3">
              {activeAnnouncements.map((ann) => {
                const isUrgent = ann.severity === 'urgent';
                const isWarning = ann.severity === 'warning';
                return (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isUrgent
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : isWarning
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-white border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={isUrgent ? 'rose' : isWarning ? 'amber' : 'emerald'}
                          size="sm"
                        >
                          {ann.type?.toUpperCase() || 'GENERAL'}
                        </Badge>
                        <h4 className="font-bold text-sm text-slate-900">{ann.title}</h4>
                        {ann.showOnTicker && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Live on Ticker
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                        <span>By: {ann.postedBy}</span>
                        <span>•</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-100/50 shrink-0"
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Retract
                    </Button>
                  </div>
                );
              })}
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
                  <Image src={dogTagsSvg} alt="Military Dossier" width={18} height={18} className="w-4 h-4 object-contain" />
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
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Image src={rankSvg} alt="Rank" width={14} height={14} className="w-3.5 h-3.5 object-contain inline-block" />
                    Rank as Boy Soldier:
                  </span>
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
              <CardDescription>₦2,000 monthly instalments collected in 2026</CardDescription>
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

      {/* BROADCAST ANNOUNCEMENT MODAL (Requested by user) */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Image src={speakerSvg} alt="Broadcast Speaker" width={20} height={20} className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Broadcast Official Notice</h3>
                  <p className="text-xs text-slate-500">
                    Dispatches to all registered member dashboards and the live site ticker.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="font-semibold">{broadcastSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent Dues Reconciliation Notice for 2026 Set Compliance"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Category</label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="dues">Dues & Levies</option>
                    <option value="general">General Notice</option>
                    <option value="welfare">Welfare Support</option>
                    <option value="event">Event / AGM</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity / Priority</label>
                  <select
                    value={broadcastSeverity}
                    onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="info">Standard Notice (Emerald)</option>
                    <option value="warning">Important Alert (Amber)</option>
                    <option value="urgent">Urgent Action Required (Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the official notification text that will appear on every registered member page..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuing Authority / Sender</label>
                <input
                  type="text"
                  placeholder="e.g. National Executive Council / Financial Secretary"
                  value={broadcastSender}
                  onChange={(e) => setBroadcastSender(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinTicker"
                  checked={broadcastPinTicker}
                  onChange={(e) => setBroadcastPinTicker(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="pinTicker" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Display on the scrolling live bulletin ticker across the website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  disabled={broadcastSending}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  {broadcastSending ? 'Broadcasting...' : 'Broadcast to Members'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
