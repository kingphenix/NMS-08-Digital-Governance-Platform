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
    // 1. Build map of server known members: nms -> normalized companyId
    const serverMemberMap = new Map<string, CompanyId | null>();
    if (Array.isArray(knownMembers)) {
      for (const m of knownMembers) {
        const nms = (m.nms_number || m.nmsNo || '').toString().trim().toUpperCase();
        if (nms) {
          serverMemberMap.set(nms, normalizeCompanyId(m.company));
        }
      }
    }

    // 2. Gather local member records (active profile and locally stored registered members)
    const localMembersMap = new Map<string, CompanyId | null>();

    const registerLocal = (m: any) => {
      if (!m) return;
      const nms = (m.nms_number || m.nmsNo || m.nms || '').toString().trim().toUpperCase();
      if (!nms) return;
      const cid = normalizeCompanyId(m.company);
      localMembersMap.set(nms, cid);
    };

    // Read localStorage registered members
    try {
      const localSaved = localStorage.getItem('nms08_registered_members');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) parsed.forEach(registerLocal);
      }
    } catch {}

    // Read sessionStorage registered members
    try {
      const sessionSaved = sessionStorage.getItem('nms08_registered_members');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed)) parsed.forEach(registerLocal);
      }
    } catch {}

    // Current active profile takes top precedence
    try {
      const currentLocal = localStorage.getItem('nms08_current_profile');
      if (currentLocal) registerLocal(JSON.parse(currentLocal));
    } catch {}
    try {
      const currentSession = sessionStorage.getItem('nms08_current_profile');
      if (currentSession) registerLocal(JSON.parse(currentSession));
    } catch {}

    // 3. Reconcile local members with server counts
    if (serverMemberMap.size === 0) {
      // Pure offline/fallback mode (no server members data)
      const hasBaseCounts = baseCounts && Object.values(baseCounts).some((v) => v > 0);
      if (!hasBaseCounts) {
        for (const [, cid] of localMembersMap) {
          if (cid && counts[cid] !== undefined) {
            counts[cid]++;
          }
        }
      }
    } else {
      // Server members known: reconcile any differences or new local members
      for (const [nms, localCid] of localMembersMap) {
        if (serverMemberMap.has(nms)) {
          const serverCid = serverMemberMap.get(nms);
          if (serverCid !== localCid) {
            // User changed company locally: decrement old company, increment new company
            if (serverCid && counts[serverCid] !== undefined && counts[serverCid] > 0) {
              counts[serverCid]--;
            }
            if (localCid && counts[localCid] !== undefined) {
              counts[localCid]++;
            }
          }
        } else {
          // Newly registered member not yet returned in server member set
          if (localCid && counts[localCid] !== undefined) {
            counts[localCid]++;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error reading storage for company counts:', err);
  }

  return counts;
}
