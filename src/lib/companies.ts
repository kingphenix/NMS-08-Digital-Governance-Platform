'use client';

import { useState, useEffect, useCallback } from 'react';
import { COMPANIES_LIST, CompanyInfo } from '@/lib/mock-data';

export type CompanyId = 'alpha' | 'bravo' | 'charlie' | 'delta' | 'echo' | 'foxtrot' | 'golf';

export const COMPANY_IDS: CompanyId[] = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf'];

export function normalizeCompanyId(raw?: string | null): CompanyId | null {
  if (!raw) return null;
  const c = raw.trim().toLowerCase();
  if (c.includes('alpha') || c === 'al' || c === 'a' || c.startsWith('a ') || c.startsWith('a-')) return 'alpha';
  if (c.includes('bravo') || c === 'br' || c === 'b' || c.startsWith('b ') || c.startsWith('b-')) return 'bravo';
  if (c.includes('charlie') || c === 'ch' || c === 'c' || c.startsWith('c ') || c.startsWith('c-')) return 'charlie';
  if (c.includes('delta') || c === 'de' || c === 'd' || c.startsWith('d ') || c.startsWith('d-')) return 'delta';
  if (c.includes('echo') || c === 'ec' || c === 'e' || c.startsWith('e ') || c.startsWith('e-')) return 'echo';
  if (c.includes('foxtrot') || c === 'fx' || c === 'f' || c.startsWith('f ') || c.startsWith('f-')) return 'foxtrot';
  if (c.includes('golf') || c === 'go' || c === 'g' || c.startsWith('g ') || c.startsWith('g-')) return 'golf';
  return null;
}

export function getCompanyFromRaw(raw?: string | null): CompanyInfo {
  const id = normalizeCompanyId(raw);
  if (id) {
    const found = COMPANIES_LIST.find((c) => c.id === id);
    if (found) return found;
  }
  return COMPANIES_LIST[0];
}

/**
 * Calculates registered member count per company from any list of member records,
 * and merges with any local browser submissions (e.g. freshly registered members).
 */
export function getRegisteredCountsFromStorage(
  baseCounts?: Record<string, number>,
  knownMembers?: Array<{ company?: string; nms_number?: string; nmsNo?: string }>
): Record<string, number> {
  const counts: Record<string, number> = {
    alpha: 0,
    bravo: 0,
    charlie: 0,
    delta: 0,
    echo: 0,
    foxtrot: 0,
    golf: 0,
    ...(baseCounts || {}),
  };

  if (typeof window === 'undefined') return counts;

  try {
    const countedNms = new Set<string>();
    if (Array.isArray(knownMembers)) {
      for (const m of knownMembers) {
        const nms = (m.nms_number || m.nmsNo || '').toString().trim().toUpperCase();
        if (nms) countedNms.add(nms);
      }
    }

    const processMember = (m: any) => {
      if (!m) return;
      const nms = (m.nms_number || m.nmsNo || m.nms || '').toString().trim().toUpperCase();
      if (nms && countedNms.has(nms)) return;
      if (nms) countedNms.add(nms);

      const compStr = m.company;
      const cid = normalizeCompanyId(compStr);
      if (cid && counts[cid] !== undefined) {
        counts[cid]++;
      }
    };

    // 1. Process localStorage registered members
    const localSaved = localStorage.getItem('nms08_registered_members');
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach(processMember);
      }
    }

    // 2. Process sessionStorage registered members
    const sessionSaved = sessionStorage.getItem('nms08_registered_members');
    if (sessionSaved) {
      const parsed = JSON.parse(sessionSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach(processMember);
      }
    }

    // 3. Process current active profile from localStorage and sessionStorage
    const currentLocal = localStorage.getItem('nms08_current_profile');
    if (currentLocal) {
      try {
        processMember(JSON.parse(currentLocal));
      } catch {}
    }
    const currentSession = sessionStorage.getItem('nms08_current_profile');
    if (currentSession) {
      try {
        processMember(JSON.parse(currentSession));
      } catch {}
    }
  } catch (err) {
    console.warn('Error reading storage for company counts:', err);
  }

  return counts;
}

/**
 * Hook providing live company registered member counts,
 * keeping the entire UI in real-time sync with database registrations and local events.
 *
 * Starts with all-zero counts (SSR-safe) and hydrates from localStorage + API
 * only after mount to avoid React hydration mismatches.
 */
export function useLiveCompanies() {
  // Always start with zeros — safe for SSR. localStorage is read in useEffect only.
  const [counts, setCounts] = useState<Record<string, number>>({
    alpha: 0,
    bravo: 0,
    charlie: 0,
    delta: 0,
    echo: 0,
    foxtrot: 0,
    golf: 0,
  });
  const [complianceRates, setComplianceRates] = useState<Record<string, number>>({
    alpha: 0,
    bravo: 0,
    charlie: 0,
    delta: 0,
    echo: 0,
    foxtrot: 0,
    golf: 0,
  });
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Fetch live data from API (Supabase) with cache busting
      const res = await fetch(`/api/companies?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.counts) {
          // API counts are the source of truth from Supabase.
          // Merge with any locally stored members not yet in DB (e.g. just registered).
          const apiCounts: Record<string, number> = data.counts;
          const merged = getRegisteredCountsFromStorage(apiCounts, data.members);
          setCounts(merged);
          setTotalRegistered(Math.max(data.totalRegistered || 0, Object.values(merged).reduce((a, b) => a + b, 0)));

          if (Array.isArray(data.companies)) {
            const compMap: Record<string, number> = {};
            data.companies.forEach((c: any) => {
              compMap[c.id] = c.duesComplianceRate || 0;
            });
            setComplianceRates(compMap);
          }
          return;
        }
      }
    } catch {
      // API unavailable — fall through to localStorage only
    }

    // Fallback: use localStorage only
    const fallback = getRegisteredCountsFromStorage();
    setCounts(fallback);
    setTotalRegistered(Object.values(fallback).reduce((a, b) => a + b, 0));
  }, []);

  useEffect(() => {
    // On mount: hydrate from localStorage immediately for instant display,
    // then kick off an API refresh.
    const local = getRegisteredCountsFromStorage();
    setCounts(local);
    setTotalRegistered(Object.values(local).reduce((a, b) => a + b, 0));
    setLoading(false);

    refresh();

    const handleUpdate = () => { refresh(); };

    window.addEventListener('nms08-members-updated', handleUpdate);
    window.addEventListener('nms08-company-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Periodically re-sync with server every 10 seconds
    const interval = setInterval(refresh, 10000);

    return () => {
      window.removeEventListener('nms08-members-updated', handleUpdate);
      window.removeEventListener('nms08-company-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [refresh]);

  const companies: CompanyInfo[] = COMPANIES_LIST.map((c) => ({
    ...c,
    totalMembers: counts[c.id] ?? 0,
    duesComplianceRate: complianceRates[c.id] ?? 0,
  }));

  return {
    companies,
    counts,
    totalRegistered,
    loading,
    refresh,
  };
}
