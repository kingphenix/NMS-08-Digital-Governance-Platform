'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
import militaryManSvg from '@/assets/military-man.svg';
import cardSvg from '@/assets/card.svg';
import voteSvg from '@/assets/vote.svg';
import dogTagsSvg from '@/assets/Dog-tags.svg';
import rankSvg from '@/assets/rank.svg';
import speakerSvg from '@/assets/speaker.svg';
import tankSvg from '@/assets/tank.svg';
import medalSvg from '@/assets/medal.svg';
import {
  COMPANIES_LIST,
  NEWS_LIST,
  EVENTS_LIST,
  ELECTION_DATA,
  WELFARE_CLAIMS,
  DOCUMENTS_LIST,
  NOTIFICATIONS_LIST,
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
  Megaphone,
  X,
  AlertTriangle,
  Camera,
  Trash2,
  Upload,
  Globe,
  Edit2,
} from 'lucide-react';

export interface ChapterInfo {
  id: string;
  name: string;
  shortName: string;
  location: string;
  region: string;
  chairman: string;
  meetingSchedule: string;
  secretariat: string;
  activeMembers: number;
}

export const CHAPTERS_LIST: ChapterInfo[] = [
  {
    id: 'abuja',
    name: 'Abuja Executive Chapter',
    shortName: 'Abuja Chapter',
    location: 'Abuja, Federal Capital Territory',
    region: 'North-Central & FCT',
    chairman: 'Ex-Boy Barr. Obinna Eze',
    meetingSchedule: '3rd Sunday of Every Month (5:00 PM)',
    secretariat: 'Suite 402, NMS 08 National Liaison Office, Central Business District, Abuja',
    activeMembers: 114,
  },
  {
    id: 'lagos',
    name: 'Lagos Metropolitan Chapter',
    shortName: 'Lagos Chapter',
    location: 'Ikeja / Victoria Island, Lagos',
    region: 'South-West',
    chairman: 'Ex-Boy Engr. Femi Adeleke',
    meetingSchedule: '2nd Sunday of Every Month (4:00 PM)',
    secretariat: 'Plot 18, Commercial Avenue, Ikeja GRA, Lagos',
    activeMembers: 98,
  },
  {
    id: 'rivers',
    name: 'Rivers & Niger Delta Chapter',
    shortName: 'Port Harcourt Chapter',
    location: 'Port Harcourt, Rivers State',
    region: 'South-South',
    chairman: 'Ex-Boy Dr. Tamuno Briggs',
    meetingSchedule: 'Last Sunday of Every Month (5:00 PM)',
    secretariat: '12 Tombia Street, GRA Phase 2, Port Harcourt',
    activeMembers: 52,
  },
  {
    id: 'kaduna',
    name: 'Kaduna Regional Chapter',
    shortName: 'Kaduna Chapter',
    location: 'Kaduna Central, Kaduna State',
    region: 'North-West',
    chairman: 'Ex-Boy Capt. Aliyu Mohammed',
    meetingSchedule: '1st Saturday of Every Month (11:00 AM)',
    secretariat: 'Old NDA Road, Ungwan Rimi, Kaduna',
    activeMembers: 64,
  },
  {
    id: 'plateau',
    name: 'Plateau / Jos Chapter',
    shortName: 'Jos Chapter',
    location: 'Jos, Plateau State',
    region: 'North-Central',
    chairman: 'Ex-Boy Pam Dung',
    meetingSchedule: '2nd Saturday of Every Month (3:00 PM)',
    secretariat: 'Rayfield Club House, Jos',
    activeMembers: 45,
  },
  {
    id: 'enugu',
    name: 'Enugu & Eastern Chapter',
    shortName: 'Enugu Chapter',
    location: 'Enugu, Enugu State',
    region: 'South-East',
    chairman: 'Ex-Boy Chinedu Okafor',
    meetingSchedule: '3rd Sunday of Every Month (4:30 PM)',
    secretariat: 'Independence Layout, Enugu',
    activeMembers: 39,
  },
  {
    id: 'ibadan',
    name: 'Ibadan & Western Chapter',
    shortName: 'Ibadan Chapter',
    location: 'Ibadan, Oyo State',
    region: 'South-West',
    chairman: 'Ex-Boy Dr. Kehinde Ojo',
    meetingSchedule: 'Last Sunday of Every Month (4:00 PM)',
    secretariat: 'Bodija Estate, Ibadan',
    activeMembers: 33,
  },
  {
    id: 'kano',
    name: 'Kano & Northern Chapter',
    shortName: 'Kano Chapter',
    location: 'Kano, Kano State',
    region: 'North-West',
    chairman: 'Ex-Boy Aminu Sanusi',
    meetingSchedule: '1st Sunday of Every Month (3:00 PM)',
    secretariat: 'Bompai Industrial Area, Kano',
    activeMembers: 28,
  },
  {
    id: 'diaspora',
    name: 'Diaspora Chapter (International)',
    shortName: 'Diaspora Chapter',
    location: 'Global (UK, USA, Canada, Europe)',
    region: 'International Diaspora',
    chairman: 'Ex-Boy Dr. Kunle Adeyemi',
    meetingSchedule: 'Monthly Virtual Townhall via Zoom',
    secretariat: 'Global Diaspora Coordination Bureau, London & Washington',
    activeMembers: 58,
  },
  {
    id: 'national',
    name: 'National Secretariat Chapter',
    shortName: 'National Roster',
    location: 'National Assembly of Ex-Boys',
    region: 'Federation of Nigeria',
    chairman: 'Set Executive Council',
    meetingSchedule: 'Quarterly General Assembly',
    secretariat: 'National Headquarters, Abuja',
    activeMembers: 533,
  },
];

export function getChapterForMember(homeCell?: string, stateOfResidence?: string): ChapterInfo {
  const query = `${homeCell || ''} ${stateOfResidence || ''}`.toLowerCase();
  if (query.includes('lagos')) return CHAPTERS_LIST[1];
  if (query.includes('river') || query.includes('port harcourt') || query.includes('ph')) return CHAPTERS_LIST[2];
  if (query.includes('kaduna')) return CHAPTERS_LIST[3];
  if (query.includes('plateau') || query.includes('jos')) return CHAPTERS_LIST[4];
  if (query.includes('enugu') || query.includes('anambra') || query.includes('imo') || query.includes('abia') || query.includes('ebonyi')) return CHAPTERS_LIST[5];
  if (query.includes('ibadan') || query.includes('oyo') || query.includes('osun') || query.includes('ogun') || query.includes('ondo') || query.includes('ekiti')) return CHAPTERS_LIST[6];
  if (query.includes('kano') || query.includes('katsina') || query.includes('jigawa') || query.includes('sokoto')) return CHAPTERS_LIST[7];
  if (query.includes('diaspora') || query.includes('uk') || query.includes('usa') || query.includes('london') || query.includes('canada') || query.includes('abroad')) return CHAPTERS_LIST[8];
  if (query.includes('abuja') || query.includes('fct') || query.includes('nasarawa') || query.includes('niger')) return CHAPTERS_LIST[0];

  const found = CHAPTERS_LIST.find(c => homeCell && (c.name.toLowerCase().includes(homeCell.toLowerCase()) || homeCell.toLowerCase().includes(c.id)));
  if (found) return found;

  return CHAPTERS_LIST[0];
}

export function MemberDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'profile' | 'dues' | 'welfare' | 'elections' | 'docs'>('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LIST);
  const [welfareClaims, setWelfareClaims] = useState(WELFARE_CLAIMS);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showReceiptToast, setShowReceiptToast] = useState(false);
  const [showPhotoToast, setShowPhotoToast] = useState(false);
  const [photoToastMessage, setPhotoToastMessage] = useState('Passport photo updated successfully!');
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileSaving, setEditProfileSaving] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({
    company: '',
    homeCell: '',
    phone: '',
    stateOfResidence: '',
    address: '',
    maritalStatus: 'Single',
    occupation: '',
    industry: '',
    business: '',
    skills: '',
    professionalQualifications: '',
    nextOfKin: '',
    relationship: '',
    nextOfKinPhone: '',
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [adminBroadcasts, setAdminBroadcasts] = useState<any[]>([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<string[]>([]);
  const [votedCandidate, setVotedCandidate] = useState<string | null>(null);
  const [welfareForm, setWelfareForm] = useState({ type: 'Medical', amount: '', description: '' });
  const [treasuryMetrics, setTreasuryMetrics] = useState({
    totalDuesCollected: 0,
    complianceRate: 0,
    targetDues: 0,
  });

  // Dynamic user profile state (hydrated from session, localStorage and Supabase)
  const [profile, setProfile] = useState({
    id: '',
    name: 'Ex-Boy Member',
    nmsNo: 'NMS/08/----',
    squad: '',
    company: 'Unassigned',
    homeCell: '',
    phone: '',
    email: '',
    dob: '',
    stateOfOrigin: '',
    stateOfResidence: '',
    address: '',
    maritalStatus: 'Single',
    rankAppointment: 'Ex-Boy',
    setAppointment: 'Member',
    occupation: '',
    industry: '',
    business: '',
    skills: '',
    professionalQualifications: '',
    bloodGroup: 'O+',
    genotype: 'AA',
    nextOfKin: '',
    relationship: '',
    nextOfKinPhone: '',
    membershipStatus: 'Active' as const,
    avatarUrl: '',
    isLiveProfile: false,
    registeredAt: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadProfile() {
      let savedData: any = null;
      try {
        const stored =
          sessionStorage.getItem('nms08_current_profile') ||
          localStorage.getItem('nms08_current_profile');
        if (stored) {
          savedData = JSON.parse(stored);
        }
      } catch (err) {
        console.error('Failed to parse session profile', err);
      }

      const authed =
        typeof window !== 'undefined' &&
        (sessionStorage.getItem('nms08_member_authed') === 'true' ||
          localStorage.getItem('nms08_member_authed') === 'true');
      if (!savedData && !authed) {
        setIsAuthed(false);
        return;
      }
      setIsAuthed(true);

      const nmsQuery = savedData?.nms_number || savedData?.nmsNo;
      const cachedAvatar =
        (nmsQuery && localStorage.getItem(`nms08_avatar_${nmsQuery}`)) ||
        localStorage.getItem('nms08_active_avatar') ||
        savedData?.avatarUrl ||
        savedData?.avatar_url ||
        '';

      if (!nmsQuery) {
        if (savedData) {
          const defaultChapter = getChapterForMember(savedData.home_cell || savedData.homeCell, savedData.state_of_residence || savedData.stateOfResidence);
          setProfile((prev) => {
            const effectiveCompany = savedData.company || prev.company;
            return {
              ...prev,
              ...savedData,
              company: effectiveCompany,
              squad: savedData.squad || (effectiveCompany ? effectiveCompany.replace(/\s*Company\s*/i, '').trim() : prev.squad),
              homeCell: savedData.home_cell || savedData.homeCell || defaultChapter.name,
              avatarUrl: cachedAvatar || savedData.avatarUrl || savedData.avatar_url || prev.avatarUrl,
              isLiveProfile: true,
            };
          });
        }
        return;
      }

      try {
        setLoadingProfile(true);
        const url = `/api/profile?nms=${encodeURIComponent(nmsQuery)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.profile) {
            const dbP = json.profile;
            const computedChapter = getChapterForMember(
              dbP.home_cell || savedData?.home_cell || savedData?.homeCell,
              dbP.state_of_residence || savedData?.state_of_residence || savedData?.stateOfResidence
            );

            setProfile((prev) => {
              const effectiveCompany = dbP.company || savedData?.company || prev.company;
              return {
                ...prev,
                name: dbP.full_name || savedData?.full_name || savedData?.name || prev.name,
                nmsNo: dbP.nms_number || savedData?.nms_number || savedData?.nmsNo || prev.nmsNo,
                company: effectiveCompany,
                squad: dbP.squad || savedData?.squad || (effectiveCompany ? effectiveCompany.replace(/\s*Company\s*/i, '').trim() : prev.squad),
                homeCell: dbP.home_cell || savedData?.home_cell || savedData?.homeCell || computedChapter.name,
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
                avatarUrl: cachedAvatar || dbP.avatar_url || savedData?.avatar_url || savedData?.avatarUrl || prev.avatarUrl,
                isLiveProfile: true,
                registeredAt: dbP.created_at || '',
              };
            });
            return;
          }
        }
      } catch (err) {
        console.error('API profile fetch error:', err);
      } finally {
        setLoadingProfile(false);
      }

      if (savedData) {
        const computedChapter = getChapterForMember(
          savedData.home_cell || savedData.homeCell,
          savedData.state_of_residence || savedData.stateOfResidence
        );
        setProfile((prev) => {
          const effectiveCompany = savedData.company || prev.company;
          return {
            ...prev,
            name: savedData.full_name || savedData.name || prev.name,
            nmsNo: savedData.nms_number || savedData.nmsNo || prev.nmsNo,
            company: effectiveCompany,
            squad: savedData.squad || (effectiveCompany ? effectiveCompany.replace(/\s*Company\s*/i, '').trim() : prev.squad),
            homeCell: savedData.home_cell || savedData.homeCell || computedChapter.name,
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
            avatarUrl: cachedAvatar || savedData.avatar_url || savedData.avatarUrl || prev.avatarUrl,
            isLiveProfile: true,
          };
        });
      }
    }

    loadProfile();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.onload = () => {
        // Compress and scale down to 400x400 max to keep storage nimble and crisp
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          // Update local state
          setProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));

          // Update session storage
          try {
            const currentStored = sessionStorage.getItem('nms08_current_profile');
            const parsed = currentStored ? JSON.parse(currentStored) : {};
            parsed.avatarUrl = dataUrl;
            parsed.avatar_url = dataUrl;
            sessionStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
          } catch {}

          // Update localStorage
          try {
            if (profile.nmsNo) {
              localStorage.setItem(`nms08_avatar_${profile.nmsNo}`, dataUrl);
            }
            localStorage.setItem('nms08_active_avatar', dataUrl);
          } catch {}

          // Persist to API
          if (profile.nmsNo) {
            fetch('/api/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nms: profile.nmsNo,
                avatar_url: dataUrl,
              }),
            }).catch((err) => console.warn('Profile picture sync error:', err));
          }

          setPhotoToastMessage('Passport photo updated successfully!');
          setShowPhotoToast(true);
          setTimeout(() => setShowPhotoToast(false), 4000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfile((prev) => ({ ...prev, avatarUrl: '' }));
    try {
      const currentStored = sessionStorage.getItem('nms08_current_profile');
      if (currentStored) {
        const parsed = JSON.parse(currentStored);
        delete parsed.avatarUrl;
        delete parsed.avatar_url;
        sessionStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
      }
      if (profile.nmsNo) {
        localStorage.removeItem(`nms08_avatar_${profile.nmsNo}`);
      }
      localStorage.removeItem('nms08_active_avatar');
    } catch {}

    if (profile.nmsNo) {
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nms: profile.nmsNo,
          avatar_url: '',
        }),
      }).catch((err) => console.warn('Profile remove error:', err));
    }

    setPhotoToastMessage('Passport photo removed.');
    setShowPhotoToast(true);
    setTimeout(() => setShowPhotoToast(false), 4000);
  };

  const handleUpdateChapter = (chapterName: string) => {
    setProfile((prev) => ({ ...prev, homeCell: chapterName }));
    try {
      const currentStored = sessionStorage.getItem('nms08_current_profile');
      const parsed = currentStored ? JSON.parse(currentStored) : {};
      parsed.homeCell = chapterName;
      parsed.home_cell = chapterName;
      sessionStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
    } catch {}

    if (profile.nmsNo) {
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nms: profile.nmsNo,
          home_cell: chapterName,
        }),
      }).catch((err) => console.warn('Chapter update error:', err));
    }
    setShowChapterModal(false);
    setPhotoToastMessage(`Home Cell updated to ${chapterName}`);
    setShowPhotoToast(true);
    setTimeout(() => setShowPhotoToast(false), 4000);
  };

  const handleUpdateCompany = (companyName: string) => {
    const derivedSquad = companyName ? companyName.replace(/\s*Company\s*/i, '').trim() : '';
    setProfile((prev) => ({ ...prev, company: companyName, squad: derivedSquad || prev.squad }));
    try {
      const currentStored = sessionStorage.getItem('nms08_current_profile');
      const parsed = currentStored ? JSON.parse(currentStored) : {};
      parsed.company = companyName;
      parsed.squad = derivedSquad;
      sessionStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
    } catch {}

    try {
      const currentStored = localStorage.getItem('nms08_current_profile');
      const parsed = currentStored ? JSON.parse(currentStored) : {};
      parsed.company = companyName;
      parsed.squad = derivedSquad;
      localStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
    } catch {}

    if (profile.nmsNo) {
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nms: profile.nmsNo,
          company: companyName,
        }),
      }).catch((err) => console.warn('Company update error:', err));
    }
    setShowCompanyModal(false);
    setPhotoToastMessage(`Company Affiliation updated to ${companyName}`);
    setShowPhotoToast(true);
    setTimeout(() => setShowPhotoToast(false), 4000);
  };

  const openEditProfile = () => {
    setProfileEditForm({
      company: profile.company || 'Alpha Company',
      homeCell: profile.homeCell || 'Abuja Executive Chapter',
      phone: profile.phone || '',
      stateOfResidence: profile.stateOfResidence || '',
      address: profile.address || '',
      maritalStatus: profile.maritalStatus || 'Single',
      occupation: profile.occupation || '',
      industry: profile.industry || '',
      business: profile.business || '',
      skills: profile.skills || '',
      professionalQualifications: profile.professionalQualifications || '',
      nextOfKin: profile.nextOfKin || '',
      relationship: profile.relationship || '',
      nextOfKinPhone: profile.nextOfKinPhone || '',
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileSaving(true);
    try {
      const derivedSquad = profileEditForm.company
        ? profileEditForm.company.replace(/\s*Company\s*/i, '').trim()
        : profile.squad;
      const updated = {
        ...profile,
        ...profileEditForm,
        squad: derivedSquad || profile.squad,
      };
      setProfile(updated);

      try {
        const stored = sessionStorage.getItem('nms08_current_profile');
        const parsed = stored ? JSON.parse(stored) : {};
        Object.assign(parsed, profileEditForm);
        parsed.home_cell = profileEditForm.homeCell;
        parsed.squad = derivedSquad;
        sessionStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
      } catch {}

      try {
        const stored = localStorage.getItem('nms08_current_profile');
        const parsed = stored ? JSON.parse(stored) : {};
        Object.assign(parsed, profileEditForm);
        parsed.home_cell = profileEditForm.homeCell;
        parsed.squad = derivedSquad;
        localStorage.setItem('nms08_current_profile', JSON.stringify(parsed));
      } catch {}

      if (profile.nmsNo) {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nms: profile.nmsNo,
            ...profileEditForm,
            home_cell: profileEditForm.homeCell,
          }),
        });
      }

      setShowEditProfileModal(false);
      setPhotoToastMessage('Personal particulars saved successfully!');
      setShowPhotoToast(true);
      setTimeout(() => setShowPhotoToast(false), 4000);
    } catch (err) {
      console.error('Error saving profile particulars:', err);
    } finally {
      setEditProfileSaving(false);
    }
  };

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

  const effectiveSquad = profile.squad && profile.squad.toLowerCase() !== 'alpha' || (profile.company && profile.company.toLowerCase().includes('alpha'))
    ? profile.squad || (profile.company ? profile.company.replace(/\s*Company\s*/i, '').trim() : userCompany.name.replace(/\s*Company\s*/i, '').trim())
    : (profile.company ? profile.company.replace(/\s*Company\s*/i, '').trim() : userCompany.name.replace(/\s*Company\s*/i, '').trim());

  const userChapter = getChapterForMember(profile.homeCell, profile.stateOfResidence);

  // Fetch admin broadcast announcements that appear on every registered page
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.announcements)) {
            setAdminBroadcasts(data.announcements.filter((a: any) => a.active !== false));
          }
        }
      } catch {
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('nms08_admin_announcements');
            if (stored) setAdminBroadcasts(JSON.parse(stored));
          } catch {}
        }
      }
    };

    loadAnnouncements();

    const loadTreasury = async () => {
      try {
        const res = await fetch('/api/admin/members');
        if (res.ok) {
          const data = await res.json();
          if (data?.metrics) {
            setTreasuryMetrics({
              totalDuesCollected: data.metrics.totalDuesCollected || 0,
              complianceRate: data.metrics.complianceRate || 0,
              targetDues: data.metrics.targetDues || 0,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load treasury metrics:', err);
      }
    };
    loadTreasury();

    if (typeof window !== 'undefined') {
      try {
        const dismissed = localStorage.getItem('nms08_dismissed_announcements');
        if (dismissed) setDismissedBroadcasts(JSON.parse(dismissed));
      } catch {}
    }

    const handleUpdate = () => loadAnnouncements();
    window.addEventListener('nms08-announcements-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nms08-announcements-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleDismissAnnouncement = (id: string) => {
    const updated = [...dismissedBroadcasts, id];
    setDismissedBroadcasts(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nms08_dismissed_announcements', JSON.stringify(updated));
      } catch {}
    }
  };

  const visibleBroadcasts = adminBroadcasts.filter(
    (a) => !dismissedBroadcasts.includes(a.id)
  );

  // Initials-based identity chip (no personal photo on the governance platform)
  const nameInitials =
    profile.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'NMS';

  if (isAuthed === false) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="glass-panel p-8 sm:p-12 text-center space-y-6 rounded-3xl border border-slate-200 shadow-apple-md">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-900/10 border border-emerald-900/20 flex items-center justify-center">
            <Image src={militaryManSvg} alt="Ex-Boy Portal" width={40} height={40} className="w-10 h-10 object-contain" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ex-Boy Portal Authentication Required</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Please sign in with your NMS Service Number and Password to access your official membership records, dues receipts, welfare claims, and election ballot.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="emerald" onClick={() => window.location.href = '/login'} className="gap-2">
              Sign In to Member Portal
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/register'} className="gap-2">
              Register Membership
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
        aria-hidden="true"
      />

      {/* Toast Notifications */}
      {showReceiptToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-emerald px-6 py-4 rounded-3xl shadow-apple-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div>
            <p className="text-sm font-semibold">Receipt Downloaded</p>
            <p className="text-xs text-emerald-100">Official 2026 NMS 08 Dues Receipt #NMS08-8921 saved.</p>
          </div>
        </div>
      )}

      {showPhotoToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-emerald px-6 py-4 rounded-3xl shadow-apple-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div>
            <p className="text-sm font-semibold">Profile Updated</p>
            <p className="text-xs text-emerald-100">{photoToastMessage}</p>
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
            <div className="relative group">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-3xl bg-emerald-950/40 ring-4 ring-white/30 shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer relative"
                title="Click to upload or update Ex-Boy passport photo"
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-extrabold text-2xl tracking-wide">{nameInitials}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white drop-shadow" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 hover:bg-emerald-300 border-2 border-white flex items-center justify-center text-emerald-950 shadow-md transition-transform hover:scale-110"
                title="Upload / Change Photo"
              >
                <Camera className="w-3 h-3 text-emerald-950" />
              </button>

              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 border border-white flex items-center justify-center text-white shadow-md transition-transform hover:scale-110"
                  title="Remove Photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 flex items-center gap-1.5">
                  <Image src={militaryManSvg} alt="Ex-Boy Member" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
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
                {effectiveSquad} Platoon • {profile.company} • {userChapter.name}
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

      {/* OFFICIAL EXECUTIVE ANNOUNCEMENTS & NOTIFICATIONS (Requested by user) */}
      {visibleBroadcasts.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Image src={speakerSvg} alt="Speaker Broadcast" width={16} height={16} className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Secretariat Notifications ({visibleBroadcasts.length})
              </span>
            </div>
            {dismissedBroadcasts.length > 0 && (
              <button
                onClick={() => {
                  setDismissedBroadcasts([]);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('nms08_dismissed_announcements');
                  }
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 underline font-medium"
              >
                Restore Hidden Notices
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {visibleBroadcasts.map((ann) => {
              const isUrgent = ann.severity === 'urgent';
              const isWarning = ann.severity === 'warning';

              return (
                <div
                  key={ann.id}
                  className={`p-4 sm:p-5 rounded-3xl border shadow-apple-sm transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isUrgent
                      ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-1 ring-rose-200'
                      : isWarning
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-200'
                      : 'bg-emerald-50/80 border-emerald-300/80 text-emerald-950'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`p-2 rounded-2xl shrink-0 mt-0.5 flex items-center justify-center ${
                        isUrgent
                          ? 'bg-rose-200 text-rose-800'
                          : isWarning
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Image src={speakerSvg} alt="Speaker" width={16} height={16} className="w-4 h-4 object-contain" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={isUrgent ? 'rose' : isWarning ? 'amber' : 'emerald'}
                          size="sm"
                        >
                          {isUrgent ? 'URGENT NOTICE' : isWarning ? 'IMPORTANT' : ann.type?.toUpperCase() || 'OFFICIAL'}
                        </Badge>
                        <h3 className="font-bold text-sm text-slate-900">{ann.title}</h3>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {ann.message}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>Issued by: {ann.postedBy || 'National Secretariat'}</span>
                        <span>•</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAnnouncement(ann.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 hover:bg-black/5"
                      icon={<X className="w-3.5 h-3.5" />}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'all', label: 'Dashboard Overview', icon: Sparkles, isSvg: false },
          { key: 'profile', label: 'Full Member Profile', icon: militaryManSvg, isSvg: true },
          { key: 'dues', label: 'Dues & Financials', icon: cardSvg, isSvg: true },
          { key: 'welfare', label: 'Welfare Fund', icon: Heart, isSvg: false },
          { key: 'elections', label: 'Voting & Elections', icon: voteSvg, isSvg: true },
          { key: 'docs', label: 'Documents', icon: FileText, isSvg: false },
        ].map((tab) => {
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
              {tab.isSvg ? (
                <Image src={tab.icon as any} alt={tab.label} width={16} height={16} className={`w-4 h-4 object-contain ${isActive ? 'brightness-200' : ''}`} />
              ) : (
                <tab.icon className="w-4 h-4" />
              )}
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
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-200">{userChapter.shortName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-300">
                Official NMS 08 Ex-Boys Personnel Record • {profile.company} • {profile.rankAppointment}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                icon={<Camera className="w-3.5 h-3.5" />}
                onClick={() => avatarInputRef.current?.click()}
              >
                {profile.avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={openEditProfile}
              >
                Edit Particulars
              </Button>
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
                  <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Image src={dogTagsSvg} alt="Dog Tags" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
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
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">School Company</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{profile.company}</span>
                    <button
                      type="button"
                      onClick={() => setShowCompanyModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-0.5 ml-1"
                      title="Edit Company Affiliation"
                    >
                      <Edit2 className="w-3 h-3 inline" />
                      Edit
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Image src={rankSvg} alt="Rank" width={14} height={14} className="w-3.5 h-3.5 object-contain inline-block" />
                    Rank as Boy Soldier
                  </span>
                  <span className="font-semibold text-slate-800">{profile.rankAppointment || 'Ex-Boy Soldier'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Image src={medalSvg} alt="Medal / Appointment" width={14} height={14} className="w-3.5 h-3.5 object-contain inline-block" />
                    Set Appointment
                  </span>
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
                <div className="flex justify-between items-center py-1.5">
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Home Cell Association</span>
                    <span className="font-semibold text-slate-800">{profile.homeCell}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowChapterModal(true)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-0.5"
                    title="Change Home Cell Chapter"
                  >
                    <Edit2 className="w-3 h-3 inline" />
                    Edit
                  </button>
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
                  <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Image src={tankSvg} alt="Company Tank" width={20} height={20} className="w-5 h-5 object-contain" />
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
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs text-emerald-800"
                  onClick={() => setShowCompanyModal(true)}
                  icon={<Shield className="w-3.5 h-3.5" />}
                >
                  Change Company Affiliation
                </Button>
              </CardFooter>
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
                <Badge variant="subtle">{userChapter.shortName}</Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Chapter Location</span>
                    <span className="font-bold text-slate-900">{userChapter.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Chapter Chairman</span>
                    <span className="font-bold text-slate-900">{userChapter.chairman}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Monthly Meetings</span>
                    <span className="font-semibold text-emerald-700">{userChapter.meetingSchedule}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Secretariat</span>
                    <span className="text-right text-slate-700 font-medium max-w-[170px] truncate" title={userChapter.secretariat}>
                      {userChapter.secretariat}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
                  <span>Active Regional Members</span>
                  <span className="font-bold text-slate-900">{userChapter.activeMembers} Ex-Boys</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs text-emerald-800"
                  onClick={() => setShowChapterModal(true)}
                  icon={<Globe className="w-3.5 h-3.5" />}
                >
                  Change Home Cell Chapter
                </Button>
              </CardFooter>
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
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Image src={militaryManSvg} alt="Member Profile" width={20} height={20} className="w-5 h-5 object-contain" />
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
                <span className="font-semibold text-slate-800">{effectiveSquad}</span>
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
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Image src={tankSvg} alt="Company Tank" width={20} height={20} className="w-5 h-5 object-contain" />
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
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs text-emerald-800"
                onClick={() => setShowCompanyModal(true)}
                icon={<Shield className="w-3.5 h-3.5" />}
              >
                Change Company Affiliation
              </Button>
            </CardFooter>
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
              <Badge variant="subtle">{userChapter.shortName}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Chapter Location</span>
                  <span className="font-bold text-slate-900">{userChapter.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Chapter Chairman</span>
                  <span className="font-bold text-slate-900">{userChapter.chairman}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Monthly Meetings</span>
                  <span className="font-semibold text-emerald-700">{userChapter.meetingSchedule}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Secretariat</span>
                  <span className="text-right text-slate-700 font-medium max-w-[170px] truncate" title={userChapter.secretariat}>
                    {userChapter.secretariat}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
                <span>Active Regional Members</span>
                <span className="font-bold text-slate-900">{userChapter.activeMembers} Ex-Boys</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs text-emerald-800"
                onClick={() => setShowChapterModal(true)}
                icon={<Globe className="w-3.5 h-3.5" />}
              >
                Change Home Cell Chapter
              </Button>
            </CardFooter>
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
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Image src={cardSvg} alt="Dues Levies" width={20} height={20} className="w-5 h-5 object-contain" />
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
                  {treasuryMetrics.totalDuesCollected > 0
                    ? `₦${(treasuryMetrics.totalDuesCollected / 1_000_000).toFixed(1)}M`
                    : '₦0.00'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {treasuryMetrics.targetDues > 0
                    ? `Target: ₦${(treasuryMetrics.targetDues / 1_000_000).toFixed(1)}M (${treasuryMetrics.complianceRate}%)`
                    : '2026 Collection Cycle Active'}
                </span>
              </div>

              <ProgressBar
                value={treasuryMetrics.complianceRate}
                label="Class Dues Participation"
                sublabel={`${treasuryMetrics.complianceRate}% of verified Ex-Boys have completed 2026 dues`}
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
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Image src={voteSvg} alt="Voting & Elections" width={20} height={20} className="w-5 h-5 object-contain" />
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
                <span className="font-bold text-emerald-800">
                  {ELECTION_DATA.totalEligibleVoters > 0
                    ? `${((ELECTION_DATA.totalVotesCast / ELECTION_DATA.totalEligibleVoters) * 100).toFixed(0)}% Votes Cast`
                    : 'No votes cast yet'}
                </span>
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

      {/* HOME CELL CHAPTER SELECTION MODAL */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Your Home Cell Chapter</h3>
                  <p className="text-xs text-slate-500">Connect with fellow Ex-Boys in your regional jurisdiction</p>
                </div>
              </div>
              <button
                onClick={() => setShowChapterModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 shrink-0">
              Your Home Cell chapter determines your monthly fellowship, welfare coordination, and regional delegation votes.
            </p>

            <div className="overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
              {CHAPTERS_LIST.map((chap) => {
                const isSelected = userChapter.id === chap.id || profile.homeCell === chap.name;
                return (
                  <div
                    key={chap.id}
                    onClick={() => handleUpdateChapter(chap.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 shadow-apple-sm ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{chap.name}</span>
                        {isSelected && (
                          <Badge variant="emerald" size="sm">
                            CURRENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-700">{chap.location}</strong> • Chairman: {chap.chairman}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Meeting: {chap.meetingSchedule}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className="text-xs font-semibold text-slate-500">{chap.activeMembers} Ex-Boys</span>
                      <Button
                        variant={isSelected ? 'emerald' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        {isSelected ? 'Active Chapter' : 'Select'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <Button variant="ghost" onClick={() => setShowChapterModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MILITARY COMPANY AFFILIATION SELECTION MODAL */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Image src={tankSvg} alt="Company Tank" width={24} height={24} className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Your Military Company</h3>
                  <p className="text-xs text-slate-500">Update your school company affiliation and battalion unit</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 shrink-0">
              Your military company determines your inter-company drill standing, sports roster, company dues tracking, and cadet company identity.
            </p>

            <div className="overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
              {COMPANIES_LIST.map((comp) => {
                const isSelected =
                  profile.company.toLowerCase().includes(comp.name.toLowerCase().split(' ')[0]) ||
                  profile.company.toLowerCase().includes(comp.id.toLowerCase());
                return (
                  <div
                    key={comp.id}
                    onClick={() => handleUpdateCompany(comp.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 shadow-apple-sm ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{comp.name}</span>
                        <Badge variant="subtle" size="sm">{comp.code}</Badge>
                        {isSelected && (
                          <Badge variant="emerald" size="sm">
                            CURRENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        "{comp.motto}"
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium">
                        Commander: <strong>{comp.commander}</strong> • {comp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className="text-xs font-semibold text-slate-500">{comp.totalMembers} Ex-Boys</span>
                      <Button
                        variant={isSelected ? 'emerald' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        {isSelected ? 'Active Company' : 'Select'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <Button variant="ghost" onClick={() => setShowCompanyModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE PARTICULARS MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Edit2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Member Particulars</h3>
                  <p className="text-xs text-slate-500">Update your contact details, career profile, and emergency contacts</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="overflow-y-auto space-y-4 pr-1 max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Military Company Affiliation <span className="text-emerald-700">*</span>
                  </label>
                  <select
                    value={profileEditForm.company}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {COMPANIES_LIST.map((comp) => (
                      <option key={comp.id} value={comp.name}>
                        {comp.name} ({comp.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Home Cell Chapter <span className="text-emerald-700">*</span>
                  </label>
                  <select
                    value={profileEditForm.homeCell}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, homeCell: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {CHAPTERS_LIST.map((chap) => (
                      <option key={chap.id} value={chap.name}>
                        {chap.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={profileEditForm.phone}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State of Residence</label>
                  <input
                    type="text"
                    value={profileEditForm.stateOfResidence}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, stateOfResidence: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Abuja, Lagos, Rivers, UK"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={profileEditForm.address}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Residential address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={profileEditForm.maritalStatus}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, maritalStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={profileEditForm.occupation}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, occupation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Software Engineer, Pilot, Legal Counsel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={profileEditForm.industry}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Information Technology, Energy, Defense"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Employer</label>
                  <input
                    type="text"
                    value={profileEditForm.business}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, business: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Company Name or Self-Employed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Qualifications</label>
                  <input
                    type="text"
                    value={profileEditForm.professionalQualifications}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, professionalQualifications: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. B.Sc, MBA, PMP, BL, COREN"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Skills & Competencies</label>
                  <input
                    type="text"
                    value={profileEditForm.skills}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, skills: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Strategy, Project Management, Leadership"
                  />
                </div>

                <div className="sm:col-span-2 border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Emergency Next of Kin Details</h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next of Kin Full Name</label>
                  <input
                    type="text"
                    value={profileEditForm.nextOfKin}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, nextOfKin: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={profileEditForm.relationship}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, relationship: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Spouse, Brother, Mother"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next of Kin Phone</label>
                  <input
                    type="text"
                    value={profileEditForm.nextOfKinPhone}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, nextOfKinPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <Button type="button" variant="ghost" onClick={() => setShowEditProfileModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="emerald" disabled={editProfileSaving}>
                  {editProfileSaving ? 'Saving Changes...' : 'Save Particulars'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
