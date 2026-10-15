'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
import {
  CURRENT_USER,
  COMPANIES_LIST,
  NEWS_LIST,
  EVENTS_LIST,
  ELECTION_DATA,
  WELFARE_CLAIMS,
  DOCUMENTS_LIST,
  NOTIFICATIONS_LIST,
  FINANCIAL_METRICS,
} from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ElectionVotesChart } from './Charts';
import {
  ShieldCheck,
  Award,
  Users,
  Building,
  CreditCard,
  Calendar,
  Bell,
  FileText,
  Vote,
  Heart,
  CheckCircle2,
  Download,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Activity,
  Shield,
  Clock,
  Printer,
  RefreshCw,
} from 'lucide-react';

export function MemberDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'profile' | 'dues' | 'welfare' | 'elections' | 'docs'>('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LIST);
  const [welfareClaims, setWelfareClaims] = useState(WELFARE_CLAIMS);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showReceiptToast, setShowReceiptToast] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState<string | null>('cand-1');
  const [welfareForm, setWelfareForm] = useState({ type: 'Medical', amount: '', description: '' });

  // Dynamic user profile state (hydrated from session and Supabase)
  const [profile, setProfile] = useState({
    id: CURRENT_USER.id,
    name: CURRENT_USER.name,
    nmsNo: CURRENT_USER.nmsNo,
    squad: CURRENT_USER.squad,
    company: CURRENT_USER.company,
    homeCell: CURRENT_USER.homeCell,
    phone: CURRENT_USER.phone,
    email: CURRENT_USER.email,
    dob: CURRENT_USER.dob,
    stateOfOrigin: CURRENT_USER.stateOfOrigin,
    stateOfResidence: CURRENT_USER.stateOfResidence,
    address: CURRENT_USER.address || 'Abuja, Nigeria',
    maritalStatus: CURRENT_USER.maritalStatus,
    rankAppointment: CURRENT_USER.rankAppointment,
    setAppointment: CURRENT_USER.setAppointment || 'Member',
    occupation: CURRENT_USER.occupation,
    industry: CURRENT_USER.industry,
    business: CURRENT_USER.business,
    skills: CURRENT_USER.skills,
    professionalQualifications: CURRENT_USER.professionalQualifications,
    bloodGroup: CURRENT_USER.bloodGroup || 'O+',
    genotype: CURRENT_USER.genotype || 'AA',
    nextOfKin: CURRENT_USER.nextOfKin,
    relationship: CURRENT_USER.relationship,
    nextOfKinPhone: CURRENT_USER.nextOfKinPhone,
    membershipStatus: CURRENT_USER.membershipStatus,
    avatarUrl: CURRENT_USER.avatarUrl,
    isLiveProfile: false,
    registeredAt: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      let savedData: any = null;
      try {
        const stored = sessionStorage.getItem('nms08_current_profile');
        if (stored) {
          savedData = JSON.parse(stored);
        }
      } catch (err) {
        console.error('Failed to parse session profile', err);
      }

      const nmsQuery = savedData?.nms_number || savedData?.nmsNo;
      try {
        setLoadingProfile(true);
        const url = nmsQuery ? `/api/profile?nms=${encodeURIComponent(nmsQuery)}` : '/api/profile';
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.profile) {
            const dbP = json.profile;
            setProfile(prev => ({
              ...prev,
              name: dbP.full_name || savedData?.full_name || savedData?.name || prev.name,
              nmsNo: dbP.nms_number || savedData?.nms_number || savedData?.nmsNo || prev.nmsNo,
              company: dbP.company || savedData?.company || prev.company,
              rankAppointment: dbP.rank_appointment || savedData?.rank_appointment || savedData?.rankAppointment || prev.rankAppointment,
              setAppointment: dbP.set_appointment || savedData?.set_appointment || savedData?.setAppointment || prev.setAppointment,
              dob: dbP.dob || savedData?.dob || prev.dob,
              stateOfOrigin: dbP.state_of_origin || savedData?.state_of_origin || savedData?.stateOfOrigin || prev.stateOfOrigin,
              stateOfResidence: dbP.state_of_residence || savedData?.state_of_residence || savedData?.stateOfResidence || prev.stateOfResidence,
              address: dbP.address || savedData?.address || prev.address,
              maritalStatus: dbP.marital_status || savedData?.marital_status || savedData?.maritalStatus || prev.maritalStatus,
              email: dbP.email || savedData?.email || prev.email,
              phone: dbP.phone || savedData?.phone || prev.phone,
              occupation: dbP.occupation || savedData?.occupation || prev.occupation,
              industry: dbP.industry || savedData?.industry || prev.industry,
              business: dbP.business || savedData?.business || prev.business,
              skills: dbP.skills || savedData?.skills || prev.skills,
              professionalQualifications: dbP.professional_qualifications || savedData?.professional_qualifications || savedData?.professionalQualifications || prev.professionalQualifications,
              bloodGroup: dbP.blood_group || savedData?.blood_group || savedData?.bloodGroup || prev.bloodGroup,
              genotype: dbP.genotype || savedData?.genotype || prev.genotype,
              nextOfKin: dbP.next_of_kin || savedData?.next_of_kin || savedData?.nextOfKin || prev.nextOfKin,
              relationship: dbP.relationship || savedData?.relationship || prev.relationship,
              nextOfKinPhone: dbP.next_of_kin_phone || savedData?.next_of_kin_phone || savedData?.nextOfKinPhone || prev.nextOfKinPhone,
              isLiveProfile: true,
              registeredAt: dbP.created_at || '',
            }));
            return;
          }
        }
      } catch (err) {
        console.error('API profile fetch error:', err);
      } finally {
        setLoadingProfile(false);
      }

      if (savedData) {
        setProfile(prev => ({
          ...prev,
          name: savedData.full_name || savedData.name || prev.name,
          nmsNo: savedData.nms_number || savedData.nmsNo || prev.nmsNo,
          company: savedData.company || prev.company,
          rankAppointment: savedData.rank_appointment || savedData.rankAppointment || prev.rankAppointment,
          setAppointment: savedData.set_appointment || savedData.setAppointment || prev.setAppointment,
          dob: savedData.dob || prev.dob,
          stateOfOrigin: savedData.state_of_origin || savedData.stateOfOrigin || prev.stateOfOrigin,
          stateOfResidence: savedData.state_of_residence || savedData.stateOfResidence || prev.stateOfResidence,
          address: savedData.address || prev.address,
          maritalStatus: savedData.marital_status || savedData.maritalStatus || prev.maritalStatus,
          email: savedData.email || prev.email,
          phone: savedData.phone || prev.phone,
          occupation: savedData.occupation || prev.occupation,
          industry: savedData.industry || prev.industry,
          business: savedData.business || prev.business,
          skills: savedData.skills || prev.skills,
          professionalQualifications: savedData.professional_qualifications || savedData.professionalQualifications || prev.professionalQualifications,
          bloodGroup: savedData.blood_group || savedData.bloodGroup || prev.bloodGroup,
          genotype: savedData.genotype || prev.genotype,
          nextOfKin: savedData.next_of_kin || savedData.nextOfKin || prev.nextOfKin,
          relationship: savedData.relationship || prev.relationship,
          nextOfKinPhone: savedData.next_of_kin_phone || savedData.nextOfKinPhone || prev.nextOfKinPhone,
          isLiveProfile: true,
        }));
      }
    }

    loadProfile();
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const handleWelfareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!welfareForm.amount) return;
    const newClaim = {
      id: `wel-${Date.now().toString().slice(-3)}`,
      memberId: profile.id,
      memberName: profile.name,
      type: welfareForm.type as any,
      amountRequested: Number(welfareForm.amount),
      status: 'Under Review' as const,
      dateFiled: 'Just Now',
      description: welfareForm.description || 'Submitted via Member Portal',
    };
    setWelfareClaims([newClaim, ...welfareClaims]);
    setShowWelfareModal(false);
    setWelfareForm({ type: 'Medical', amount: '', description: '' });
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const userCompany = COMPANIES_LIST.find(c => 
    profile.company && c.name.toLowerCase().includes(profile.company.toLowerCase().split(' ')[0])
  ) || COMPANIES_LIST[0];

  // Initials-based identity chip (no personal photo on the governance platform)
  const nameInitials =
    profile.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'NMS';

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {showReceiptToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-emerald px-6 py-4 rounded-3xl shadow-apple-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div>
            <p className="text-sm font-semibold">Receipt Downloaded</p>
            <p className="text-xs text-emerald-100">Official 2026 NMS 08 Dues Receipt #NMS08-8921 saved.</p>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner (Apple Glassmorphism style) */}
      <Card variant="emerald" className="relative overflow-hidden p-8 sm:p-10">
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none">
          <Image
            src={mainLogo}
            alt="NMS 08 Watermark Logo"
            width={240}
            height={240}
            className="w-60 h-auto object-contain"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-emerald-950/40 ring-4 ring-white/30 shadow-2xl flex items-center justify-center">
                <span className="text-white font-extrabold text-2xl tracking-wide">{nameInitials}</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[10px] text-emerald-950 font-bold">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {profile.membershipStatus} Member
                </Badge>
                <Badge variant="outline" className="bg-emerald-950/40 text-emerald-100 border-white/20 font-mono">
                  {profile.nmsNo}
                </Badge>
                {profile.isLiveProfile && (
                  <Badge variant="outline" className="bg-emerald-400/20 text-emerald-200 border-emerald-400/30">
                    Live Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {profile.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                {profile.squad} • {profile.company} • {profile.homeCell}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                setShowReceiptToast(true);
                setTimeout(() => setShowReceiptToast(false), 4000);
              }}
              icon={<Download className="w-4 h-4 text-emerald-700" />}
              className="text-slate-900 font-semibold"
            >
              2026 Dues Receipt
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowWelfareModal(true)}
              icon={<Heart className="w-4 h-4 text-emerald-400" />}
            >
              Request Welfare
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'all', label: 'Dashboard Overview', icon: Sparkles },
          { key: 'profile', label: 'Full Member Profile', icon: Users },
          { key: 'dues', label: 'Dues & Financials', icon: CreditCard },
          { key: 'welfare', label: 'Welfare Fund', icon: Heart },
          { key: 'elections', label: 'Voting & Elections', icon: Vote },
          { key: 'docs', label: 'Documents', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-apple-glow shadow-emerald-600/20'
                  : 'glass-panel text-slate-700 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* COMPREHENSIVE MEMBER PROFILE DOSSIER (Rendered on 'profile' tab) */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Dossier Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-900 shadow-apple-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500 text-emerald-950">
                  Accredited Dossier
                </span>
                <span className="text-xs text-emerald-300 font-mono">
                  {profile.nmsNo}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-300">
                Official NMS 08 Ex-Boys Personnel Record • {profile.company} • {profile.rankAppointment}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                icon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Print Dossier
              </Button>
            </div>
          </div>

          {/* Dossier Information Grid: 6 Categorical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Military Service & Set Identity */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Military Service & Identity</CardTitle>
                    <CardDescription>Nigerian Military School Record</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">NMS Service No</span>
                  <span className="font-mono font-bold text-emerald-800">{profile.nmsNo}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">School Company</span>
                  <span className="font-semibold text-slate-900">{profile.company}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Rank as Boy Soldier</span>
                  <span className="font-semibold text-slate-800">{profile.rankAppointment || 'Ex-Boy Soldier'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Set Appointment</span>
                  <span className="font-semibold text-slate-800">{profile.setAppointment || 'Member'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Accreditation</span>
                  <Badge variant="emerald" size="sm">Roster Verified</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 2. Personal Particulars */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-blue-100 text-blue-800">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Identity & Demographics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Full Legal Name</span>
                  <span className="font-bold text-slate-900">{profile.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{profile.dob || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Marital Status</span>
                  <span className="font-semibold text-slate-800">{profile.maritalStatus || 'Single'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">State of Origin</span>
                  <span className="font-semibold text-slate-800">{profile.stateOfOrigin || 'Nigeria'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">State of Residence</span>
                  <span className="font-semibold text-slate-800">{profile.stateOfResidence || 'FCT Abuja'}</span>
                </div>
                <div className="py-1.5">
                  <span className="text-slate-500 font-medium block mb-1">Residential Address</span>
                  <span className="font-medium text-slate-800 block text-[11px] bg-slate-50 p-2 rounded-xl">
                    {profile.address || 'Not specified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Contact & Communication */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-purple-100 text-purple-800">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Contact Channels</CardTitle>
                    <CardDescription>Official Communications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium block text-[11px]">Primary Email</span>
                  <a href={`mailto:${profile.email}`} className="font-semibold text-emerald-700 hover:underline break-all">
                    {profile.email}
                  </a>
                </div>
                <div className="py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium block text-[11px]">Phone / WhatsApp</span>
                  <a href={`tel:${profile.phone}`} className="font-semibold text-slate-900 hover:underline">
                    {profile.phone || '+234 800 000 0000'}
                  </a>
                </div>
                <div className="py-1.5">
                  <span className="text-slate-500 font-medium block text-[11px]">Home Cell Association</span>
                  <span className="font-semibold text-slate-800">{profile.homeCell}</span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Professional & Career Profile */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Career & Profession</CardTitle>
                    <CardDescription>Industry & Expertise</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Occupation</span>
                  <span className="font-bold text-slate-900">{profile.occupation || 'Professional'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Industry Sector</span>
                  <span className="font-semibold text-slate-800">{profile.industry || 'Technology'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Employer / Business</span>
                  <span className="font-semibold text-slate-800">{profile.business || 'Private Practice'}</span>
                </div>
                <div className="py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium block mb-1">Qualifications</span>
                  <span className="font-medium text-slate-800 block text-[11px] bg-slate-50 p-2 rounded-xl">
                    {profile.professionalQualifications || 'B.Sc / HND'}
                  </span>
                </div>
                <div className="py-1.5">
                  <span className="text-slate-500 font-medium block mb-1">Skills & Expertise</span>
                  <span className="font-medium text-slate-800 block text-[11px] bg-slate-50 p-2 rounded-xl">
                    {profile.skills || 'Leadership, Strategy'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 5. Medical Emergency Data */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-rose-100 text-rose-800">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Medical Emergency</CardTitle>
                    <CardDescription>Welfare & Medical Profile</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1">Blood Group</span>
                    <span className="text-xl font-extrabold text-rose-900">{profile.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">Genotype</span>
                    <span className="text-xl font-extrabold text-amber-900">{profile.genotype || 'AA'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                  <p className="font-semibold text-slate-800 mb-0.5">Welfare Committee Access</p>
                  This emergency health data is strictly reserved for medical emergency response and welfare aid assistance.
                </div>
              </CardContent>
            </Card>

            {/* 6. Next of Kin Particulars */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Next of Kin Details</CardTitle>
                    <CardDescription>Emergency Contact Record</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Next of Kin Name</span>
                  <span className="font-bold text-slate-900">{profile.nextOfKin || 'Designated Contact'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Relationship</span>
                  <span className="font-semibold text-slate-800">{profile.relationship || 'Next of Kin'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Emergency Phone</span>
                  <a href={`tel:${profile.nextOfKinPhone}`} className="font-semibold text-emerald-700 hover:underline">
                    {profile.nextOfKinPhone || 'Not specified'}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Affiliation Cards (Company & Home Cell) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* COMPANY CARD */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Company Affiliation</CardTitle>
                    <CardDescription>{userCompany.name}</CardDescription>
                  </div>
                </div>
                <Badge variant="emerald">{userCompany.code}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-600 italic">
                  "{userCompany.motto}"
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Company Commander</span>
                    <span className="font-bold text-slate-900">{userCompany.commander}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Active Ex-Boys</span>
                    <span className="font-bold text-emerald-800">{userCompany.totalMembers} Members</span>
                  </div>
                </div>
                <ProgressBar
                  value={userCompany.duesComplianceRate}
                  label="Company Dues Compliance Rate"
                  sublabel="Top performing company in 2026 dues"
                  color="emerald"
                />
              </CardContent>
            </Card>

            {/* HOME CELL CARD */}
            <Card hoverEffect variant="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Home Cell Chapter</CardTitle>
                    <CardDescription>Regional Governance Network</CardDescription>
                  </div>
                </div>
                <Badge variant="subtle">Abuja Chapter</Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Chapter Location</span>
                    <span className="font-bold text-slate-900">Abuja, FCT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Chapter Chairman</span>
                    <span className="font-bold text-slate-900">Ex-Boy Barr. Obinna Eze</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Monthly Meetings</span>
                    <span className="font-semibold text-emerald-700">3rd Sunday of Every Month</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
                  <span>Active Regional Members</span>
                  <span className="font-bold text-slate-900">114 Ex-Boys in FCT</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* OVERVIEW CONTENT GRID (Rendered on 'all' tab) */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PROFILE SUMMARY CARD */}
          <Card hoverEffect variant="glass" className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Member Profile</CardTitle>
                  <CardDescription>Military Service Info</CardDescription>
                </div>
              </div>
              <Badge variant="emerald" dot>Verified</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Service No</span>
                <span className="font-mono font-bold text-slate-900">{profile.nmsNo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Squad / Platoon</span>
                <span className="font-semibold text-slate-800">{profile.squad}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Military Rank (NMS)</span>
                <span className="font-semibold text-slate-800">{profile.rankAppointment}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Occupation</span>
                <span className="font-semibold text-slate-800">{profile.occupation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-semibold text-emerald-700">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Residence</span>
                <span className="font-semibold text-slate-800">{profile.stateOfResidence}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-emerald-700 text-xs"
                onClick={() => setActiveTab('profile')}
              >
                View Complete Dossier →
              </Button>
            </CardFooter>
          </Card>

          {/* COMPANY CARD */}
          <Card hoverEffect variant="glass" className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Company Affiliation</CardTitle>
                  <CardDescription>{userCompany.name}</CardDescription>
                </div>
              </div>
              <Badge variant="emerald">{userCompany.code}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 italic">
                "{userCompany.motto}"
              </p>
              
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Company Commander</span>
                  <span className="font-bold text-slate-900">{userCompany.commander}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Active Ex-Boys</span>
                  <span className="font-bold text-emerald-800">{userCompany.totalMembers} Members</span>
                </div>
              </div>

              <ProgressBar
                value={userCompany.duesComplianceRate}
                label="Company Dues Compliance Rate"
                sublabel="Top performing company in 2026 dues"
                color="emerald"
              />
            </CardContent>
          </Card>

          {/* HOME CELL CARD */}
          <Card hoverEffect variant="glass" className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Home Cell Chapter</CardTitle>
                  <CardDescription>Regional Governance Network</CardDescription>
                </div>
              </div>
              <Badge variant="subtle">Abuja Chapter</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Chapter Location</span>
                  <span className="font-bold text-slate-900">Abuja, FCT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Chapter Chairman</span>
                  <span className="font-bold text-slate-900">Ex-Boy Barr. Obinna Eze</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Monthly Meetings</span>
                  <span className="font-semibold text-emerald-700">3rd Sunday of Every Month</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
                <span>Active Regional Members</span>
                <span className="font-bold text-slate-900">114 Ex-Boys in FCT</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DUES STATUS & FINANCIAL VISUALIZATIONS SECTION */}
      {(activeTab === 'all' || activeTab === 'dues') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* DUES STATUS CARDS WITH PROGRESS INDICATORS */}
          <Card hoverEffect variant="glass" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Membership & Dues Status 2026</CardTitle>
                  <CardDescription>Financial Record & Levies Breakdown</CardDescription>
                </div>
              </div>
              <Badge variant="emerald" dot>Up To Date</Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">2026 Annual Dues</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">₦150,000</span>
                    <Badge variant="emerald" size="sm">PAID</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Received Jan 14, 2026</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Welfare Fund Levy</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">₦50,000</span>
                    <Badge variant="emerald" size="sm">PAID</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Received Jan 14, 2026</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Reunion Gala Levy</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">₦30,000</span>
                    <Badge variant="emerald" size="sm">PAID</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Received Feb 02, 2026</p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/60 space-y-3">
                <ProgressBar
                  value={100}
                  label="2026 Personal Financial Compliance"
                  sublabel="Your account is 100% compliant. You are eligible to vote and run for set elections."
                  color="emerald"
                  height="lg"
                />
              </div>
            </CardContent>

            <CardFooter>
              <span className="text-xs text-slate-500">Transaction Ref: <strong className="text-slate-800">TXN-NMS08-2026-08112</strong></span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReceiptToast(true);
                  setTimeout(() => setShowReceiptToast(false), 4000);
                }}
                icon={<Download className="w-4 h-4 text-emerald-600" />}
              >
                Download Receipt PDF
              </Button>
            </CardFooter>
          </Card>

          {/* NATIONAL SET DUES METRICS VISUALIZATION */}
          <Card hoverEffect variant="glass">
            <CardHeader>
              <div>
                <CardTitle>National Treasury Overview</CardTitle>
                <CardDescription>2026 Set Dues Collection Target</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Collected</span>
                <h3 className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                  ₦{(FINANCIAL_METRICS.totalDuesCollected / 1000000).toFixed(1)}M
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Target: ₦{(FINANCIAL_METRICS.targetDues / 1000000).toFixed(1)}M (91.7%)
                </span>
              </div>

              <ProgressBar
                value={FINANCIAL_METRICS.complianceRate}
                label="Class Dues Participation"
                sublabel="445 out of 485 Ex-Boys have completed 2026 dues"
                color="emerald"
              />

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>Audited Treasury Account</span>
                <span className="font-semibold text-slate-800">Zenith Bank PLC</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WELFARE & VOTING / ELECTIONS MODULE */}
      {(activeTab === 'all' || activeTab === 'welfare' || activeTab === 'elections') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* WELFARE SCHEME CARD & DISBURSEMENT HISTORY */}
          <Card hoverEffect variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-700">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Welfare Scheme & Grants</CardTitle>
                  <CardDescription>Brotherhood Assistance Fund</CardDescription>
                </div>
              </div>
              <Button variant="emerald" size="sm" onClick={() => setShowWelfareModal(true)} icon={<PlusCircle className="w-4 h-4" />}>
                File Claim
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between shadow-apple-glow">
                <div>
                  <span className="text-xs text-emerald-200 font-medium">Welfare Fund Reserve</span>
                  <h4 className="text-2xl font-bold">₦24.8 Million</h4>
                </div>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  Instant Support
                </Badge>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Recent Claims</h5>
                {welfareClaims.map((claim) => (
                  <div key={claim.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{claim.type} Assistance</span>
                        <Badge
                          variant={claim.status === 'Disbursed' ? 'emerald' : claim.status === 'Approved' ? 'blue' : 'amber'}
                          size="sm"
                        >
                          {claim.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">{claim.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">₦{claim.amountRequested.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400">{claim.dateFiled}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* VOTING & ELECTIONS CARD */}
          <Card hoverEffect variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Democratic Elections</CardTitle>
                  <CardDescription>{ELECTION_DATA.title}</CardDescription>
                </div>
              </div>
              <Badge variant="emerald" dot>Voting Open</Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 p-3 rounded-2xl bg-slate-100/70">
                <span>Voter Turnout ({ELECTION_DATA.totalVotesCast} / {ELECTION_DATA.totalEligibleVoters})</span>
                <span className="font-bold text-emerald-800">66% Votes Cast</span>
              </div>

              {/* Live Candidate Poll Chart */}
              <div className="p-2 rounded-2xl bg-white border border-slate-200/80 shadow-apple-sm">
                <p className="text-[11px] font-semibold text-slate-500 px-3 pt-2">Live Vote Distribution (Presidential Office)</p>
                <ElectionVotesChart candidates={ELECTION_DATA.candidates} />
              </div>

              {/* Candidates Selection */}
              <div className="space-y-2">
                {ELECTION_DATA.candidates.map((cand) => {
                  const isSelected = votedCandidate === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setVotedCandidate(cand.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-apple-sm'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={cand.avatarUrl}
                          alt={cand.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{cand.name}</p>
                          <p className="text-[11px] text-slate-500">{cand.company} • {cand.position}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && <Badge variant="emerald" size="sm">VOTED</Badge>}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EVENTS & ANNOUNCEMENTS SECTION */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* UPCOMING EVENTS CARD */}
          <Card hoverEffect variant="glass" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Upcoming Set Events & Reunions</CardTitle>
                  <CardDescription>Calendar of Brotherhood Gatherings</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EVENTS_LIST.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-apple-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="emerald" size="sm">{evt.category}</Badge>
                        <span className="text-[11px] font-medium text-emerald-700">{evt.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{evt.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{evt.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{evt.attendeesCount} Attending</span>
                      <Button variant={evt.isRegistered ? 'ghost' : 'emerald'} size="sm">
                        {evt.isRegistered ? 'Registered ✓' : 'Register Now'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LATEST ANNOUNCEMENTS & NOTIFICATIONS */}
          <Card hoverEffect variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Notifications & Alerts</CardTitle>
                  <CardDescription>{unreadNotificationsCount} Unread Alerts</CardDescription>
                </div>
              </div>
              <button onClick={markAllRead} className="text-xs text-emerald-700 font-semibold hover:underline">
                Mark Read
              </button>
            </CardHeader>

            <CardContent className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    !notif.isRead ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50/60 border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-slate-900">{notif.title}</h5>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* DOCUMENTS LIBRARY */}
      {(activeTab === 'all' || activeTab === 'docs') && (
        <Card hoverEffect variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Constitutional & Official Documents</CardTitle>
                <CardDescription>Verified Governance Vault</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DOCUMENTS_LIST.map((doc) => (
                <div key={doc.id} className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-apple-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">{doc.title}</h5>
                    <p className="text-[11px] text-slate-400">{doc.category} • {doc.fileSize}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-xs"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setShowReceiptToast(true);
                      setTimeout(() => setShowReceiptToast(false), 4000);
                    }}
                  >
                    Download PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* WELFARE REQUEST MODAL */}
      {showWelfareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Request Welfare Aid</h3>
                  <p className="text-xs text-slate-500">NMS 08 Brotherhood Welfare Scheme</p>
                </div>
              </div>
              <button onClick={() => setShowWelfareModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleWelfareSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Claim Category</label>
                <select
                  value={welfareForm.type}
                  onChange={(e) => setWelfareForm({ ...welfareForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Medical">Medical Assistance Grant</option>
                  <option value="Bereavement">Bereavement Support Fund</option>
                  <option value="Emergency">Emergency Financial Relief</option>
                  <option value="Celebration">Celebration Grant (Wedding/Birth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Requested (NGN)</label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={welfareForm.amount}
                  onChange={(e) => setWelfareForm({ ...welfareForm, amount: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description / Reason</label>
                <textarea
                  rows={3}
                  placeholder="Provide brief details for the welfare committee..."
                  value={welfareForm.description}
                  onChange={(e) => setWelfareForm({ ...welfareForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <Button type="button" variant="ghost" onClick={() => setShowWelfareModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="emerald">
                  Submit Claim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
