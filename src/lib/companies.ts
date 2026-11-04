'use client';

import { useState, useEffect, useCallback } from 'react';
import { COMPANIES_LIST, CompanyInfo } from '@/lib/mock-data';
import { getRegisteredCountsFromStorage } from '@/lib/company-utils';

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
          setLoading(false);
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
    setLoading(false);
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
