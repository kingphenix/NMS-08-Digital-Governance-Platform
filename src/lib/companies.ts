'use client';

import { useState, useEffect, useCallback } from 'react';
import { COMPANIES_LIST, CompanyInfo } from '@/lib/mock-data';

export type CompanyId = 'alpha' | 'bravo' | 'charlie' | 'delta' | 'echo' | 'foxtrot' | 'golf';

export const COMPANY_IDS: CompanyId[] = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf'];

export function normalizeCompanyId(raw?: string | null): CompanyId | null {
  if (!raw) return null;
  const c = raw.trim().toLowerCase();
  if (c.includes('alpha') || c === 'al') return 'alpha';
  if (c.includes('bravo') || c === 'br') return 'bravo';
  if (c.includes('charlie') || c === 'ch') return 'charlie';
  if (c.includes('delta') || c === 'de') return 'delta';
  if (c.includes('echo') || c === 'ec') return 'echo';
  if (c.includes('foxtrot') || c === 'fx') return 'foxtrot';
  if (c.includes('golf') || c === 'go') return 'golf';
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
        const nms = (m.nms_number || m.nmsNo || '').trim();
        if (nms) countedNms.add(nms);
      }
    }

    // Merge any locally registered members that may not yet be in baseCounts
    const localSaved = localStorage.getItem('nms08_registered_members');
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed)) {
        for (const m of parsed) {
          const nms = (m.nms_number || m.nmsNo || '').trim();
          if (nms && !countedNms.has(nms)) {
            countedNms.add(nms);
            const cid = normalizeCompanyId(m.company);
            if (cid && counts[cid] !== undefined) {
              counts[cid]++;
            }
          }
        }
      }
    }

    // Also check current active profile
    const currentProfile = localStorage.getItem('nms08_current_profile');
    if (currentProfile) {
      const p = JSON.parse(currentProfile);
      const nms = (p.nms_number || p.nmsNo || '').trim();
      if (nms && !countedNms.has(nms)) {
        countedNms.add(nms);
        const cid = normalizeCompanyId(p.company);
        if (cid && counts[cid] !== undefined) {
          counts[cid]++;
        }
      }
    }
  } catch {}

  return counts;
}

/**
 * Hook providing live company registered member counts,
 * keeping the entire UI in real-time sync with database registrations and local events.
 */
export function useLiveCompanies() {
  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    alpha: 0,
    bravo: 0,
    charlie: 0,
    delta: 0,
    echo: 0,
    foxtrot: 0,
    golf: 0,
  }));
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
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.counts) {
          const merged = getRegisteredCountsFromStorage(data.counts);
          setCounts(merged);
          const total = Object.values(merged).reduce((a, b) => a + b, 0);
          setTotalRegistered(Math.max(data.totalRegistered || 0, total));

          if (Array.isArray(data.companies)) {
            const compMap: Record<string, number> = {};
            data.companies.forEach((c: any) => {
              compMap[c.id] = c.duesComplianceRate || 0;
            });
            setComplianceRates(compMap);
          }
        }
      } else {
        // Fallback to storage
        const localCounts = getRegisteredCountsFromStorage();
        setCounts(localCounts);
        setTotalRegistered(Object.values(localCounts).reduce((a, b) => a + b, 0));
      }
    } catch {
      const localCounts = getRegisteredCountsFromStorage();
      setCounts(localCounts);
      setTotalRegistered(Object.values(localCounts).reduce((a, b) => a + b, 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('nms08-members-updated', handleUpdate);
    window.addEventListener('nms08-company-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nms08-members-updated', handleUpdate);
      window.removeEventListener('nms08-company-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
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
