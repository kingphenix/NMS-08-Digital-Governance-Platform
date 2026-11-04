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

      const cid = normalizeCompanyId(m.company);
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
