'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Megaphone, Cake, AlertCircle, Sparkles } from 'lucide-react';

interface BirthdayPerson {
  name: string;
  company: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  showOnTicker?: boolean;
}

function getTodayMonthDay(): { month: string; day: string } {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return { month, day };
}

function matchMonthDay(dob?: string, monthDay?: { month: string; day: string }): boolean {
  if (!dob || !monthDay) return false;
  // Handle formats: "YYYY-MM-DD", "YYYY/MM/DD", "MM-DD", "DD/MM/YYYY"
  const clean = dob.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [, m, d] = parts;
      return m.padStart(2, '0') === monthDay.month && d.slice(0, 2).padStart(2, '0') === monthDay.day;
    }
    if (parts.length === 2) {
      const [m, d] = parts;
      return m.padStart(2, '0') === monthDay.month && d.padStart(2, '0') === monthDay.day;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      // Could be YYYY/MM/DD or DD/MM/YYYY
      if (parts[0].length === 4) {
        return parts[1].padStart(2, '0') === monthDay.month && parts[2].slice(0, 2).padStart(2, '0') === monthDay.day;
      } else {
        return parts[1].padStart(2, '0') === monthDay.month && parts[0].padStart(2, '0') === monthDay.day;
      }
    }
  }
  return false;
}

export function Ticker() {
  const [adminBroadcasts, setAdminBroadcasts] = useState<Announcement[]>([]);
  const [dynamicMembers, setDynamicMembers] = useState<Array<{ name: string; company: string; dob: string }>>([]);

  // Fetch admin announcements and registered members
  const fetchTickerData = async () => {
    try {
      // 1. Fetch announcements
      const resAnn = await fetch('/api/announcements');
      if (resAnn.ok) {
        const data = await resAnn.json();
        if (data.ok && Array.isArray(data.announcements)) {
          setAdminBroadcasts(data.announcements.filter((a: any) => a.active !== false && a.showOnTicker !== false));
        }
      }
    } catch {
      // Fallback to local storage if API is unreachable
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('nms08_admin_announcements');
          if (stored) {
            setAdminBroadcasts(JSON.parse(stored));
          }
        } catch {}
      }
    }

    try {
      // 2. Fetch registered members for birthdays
      const resMem = await fetch('/api/admin/members');
      if (resMem.ok) {
        const data = await resMem.json();
        if (data.ok && Array.isArray(data.members)) {
          setDynamicMembers(
            data.members.map((m: any) => ({
              name: m.full_name || m.name,
              company: m.company,
              dob: m.dob,
            }))
          );
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchTickerData();

    // Listen to custom cross-tab / cross-component broadcast events
    const handleUpdate = () => {
      fetchTickerData();
    };

    window.addEventListener('nms08-announcements-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nms08-announcements-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const messages = useMemo<string[]>(() => {
    const today = getTodayMonthDay();
    const birthdayPeople: BirthdayPerson[] = [];
    const seenNames = new Set<string>();

    const addPerson = (name?: string, company?: string, dob?: string) => {
      if (!name || seenNames.has(name.toLowerCase())) return;
      if (matchMonthDay(dob, today)) {
        seenNames.add(name.toLowerCase());
        birthdayPeople.push({
          name,
          company: company || 'NMS 08 Ex-Boy',
        });
      }
    };

    // Check logged-in user profile in session
    if (typeof window !== 'undefined') {
      try {
        const sessionProfile = sessionStorage.getItem('nms08_current_profile');
        if (sessionProfile) {
          const p = JSON.parse(sessionProfile);
          addPerson(p.full_name || p.name, p.company, p.dob);
        }
      } catch {}

      try {
        const localReg = localStorage.getItem('nms08_registered_members');
        if (localReg) {
          const arr = JSON.parse(localReg);
          if (Array.isArray(arr)) {
            arr.forEach((m: any) => addPerson(m.full_name || m.name, m.company, m.dob));
          }
        }
      } catch {}
    }

    // Check dynamic registered members from Supabase API
    dynamicMembers.forEach((m) => addPerson(m.name, m.company, m.dob));

    const birthdayMessages = birthdayPeople.map(
      (b) =>
        `🎂 Happy Birthday to Ex-Boy ${b.name} (${b.company})! The entire NMS 08 Ex-Boys set celebrates you today and wishes you sound health, long life, and greater heights!`
    );

    // Professional dues payment notices (requested by user)
    const duesMessages = [
      '🏛️ Cordial Notice to all Ex-Boys: Kindly remember to fulfill your 2026 annual dues and welfare contributions in a timely manner to sustain set governance, welfare mandates, and fraternal brotherhood.',
      '💳 Dues Compliance Reminder: Maintaining prompt payment of statutory dues preserves your voting franchise and guarantees full access to all fraternal welfare support benefits.',
    ];

    // Admin broadcasts
    const broadcastMessages = adminBroadcasts.map(
      (a) => `📢 Official Notice [${a.title}]: ${a.message}`
    );

    // Standard platform notice
    const generalNotices = [
      'Discipline, Knowledge & Patriotism — The timeless motto of the Nigerian Military School Ex-Boys.',
    ];

    return [
      ...birthdayMessages,
      ...duesMessages,
      ...broadcastMessages,
      ...generalNotices,
    ];
  }, [dynamicMembers, adminBroadcasts]);

  // Duplicate for smooth seamless marquee looping
  const doubled = useMemo(() => [...messages, ...messages], [messages]);

  return (
    <div
      className="w-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white overflow-hidden border-b border-emerald-900/40 shadow-sm select-none"
      role="marquee"
      aria-label="NMS 08 announcements and birthday bulletin"
      title="Hover to pause announcement ticker"
    >
      <div className="relative flex items-center h-8 sm:h-8.5">
        {/* Left Badge Indicator with glowing dot */}
        <div className="flex items-center gap-2 px-3 sm:px-4 shrink-0 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-emerald-950/70 h-full border-r border-emerald-500/30 z-10 shadow-sm text-emerald-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="hidden xs:inline tracking-wider">Live Bulletin</span>
        </div>

        {/* Moving Ticker Track (moves from right to left) */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="ticker-track flex items-center h-full whitespace-nowrap">
            {doubled.map((msg, idx) => {
              const isBirthday = msg.includes('🎂');
              const isBroadcast = msg.includes('📢');
              return (
                <span
                  key={`${idx}-${msg.slice(0, 16)}`}
                  className={`text-[11px] sm:text-[12px] font-medium px-6 flex items-center gap-3 transition-colors ${
                    isBirthday
                      ? 'text-amber-200 font-bold'
                      : isBroadcast
                      ? 'text-emerald-100 font-semibold'
                      : 'text-white/95'
                  }`}
                >
                  {isBirthday && <Cake className="w-3.5 h-3.5 text-amber-300 shrink-0 inline animate-bounce" />}
                  {isBroadcast && <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0 inline" />}
                  <span>{msg}</span>
                  <span className="text-emerald-300/50 mx-2" aria-hidden="true">◆</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticker;