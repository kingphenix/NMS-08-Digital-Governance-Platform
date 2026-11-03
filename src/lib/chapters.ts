export type ChapterId =
  | 'abuja'
  | 'lagos'
  | 'rivers'
  | 'kaduna'
  | 'plateau'
  | 'enugu'
  | 'ibadan'
  | 'kano'
  | 'diaspora'
  | 'national';

export const CHAPTER_IDS: ChapterId[] = [
  'abuja',
  'lagos',
  'rivers',
  'kaduna',
  'plateau',
  'enugu',
  'ibadan',
  'kano',
  'diaspora',
  'national',
];

/**
 * Normalizes any home cell, state of residence, or address string into a standardized ChapterId.
 * Accurately maps names like "Lagos Metropolitan Chapter", "Ikeja / Victoria Island, Lagos", "Lagos", etc.
 */
export function normalizeChapterId(
  homeCell?: string | null,
  stateOfResidence?: string | null,
  address?: string | null
): ChapterId {
  const query = `${homeCell || ''} ${stateOfResidence || ''} ${address || ''}`.toLowerCase().trim();

  // Lagos Metropolitan Chapter (Ikeja, VI, Lekki, Eko, Lagos State)
  if (
    query.includes('lagos') ||
    query.includes('ikeja') ||
    query.includes('victoria island') ||
    query.includes('vi') ||
    query.includes('lekki') ||
    query.includes('eko') ||
    query.includes('surulere') ||
    query.includes('yaba') ||
    query.includes('ikoyi')
  ) {
    return 'lagos';
  }

  // Rivers & Niger Delta Chapter (Port Harcourt, Rivers, Delta, Bayelsa)
  if (
    query.includes('river') ||
    query.includes('port harcourt') ||
    query.includes('ph') ||
    query.includes('delta') ||
    query.includes('bayelsa') ||
    query.includes('warri') ||
    query.includes('yenagoa') ||
    query.includes('asaba')
  ) {
    return 'rivers';
  }

  // Kaduna Regional Chapter
  if (query.includes('kaduna') || query.includes('zaria') || query.includes('kafanchang')) {
    return 'kaduna';
  }

  // Plateau / Jos Chapter
  if (query.includes('plateau') || query.includes('jos') || query.includes('bukuru')) {
    return 'plateau';
  }

  // Enugu & Eastern Chapter (Enugu, Anambra, Imo, Abia, Ebonyi)
  if (
    query.includes('enugu') ||
    query.includes('anambra') ||
    query.includes('imo') ||
    query.includes('abia') ||
    query.includes('ebonyi') ||
    query.includes('eastern') ||
    query.includes('owerri') ||
    query.includes('onitsha') ||
    query.includes('awka') ||
    query.includes('aba') ||
    query.includes('umuahia') ||
    query.includes('nsukka')
  ) {
    return 'enugu';
  }

  // Ibadan & Western Chapter (Oyo, Osun, Ogun, Ondo, Ekiti)
  if (
    query.includes('ibadan') ||
    query.includes('oyo') ||
    query.includes('osun') ||
    query.includes('ogun') ||
    query.includes('ondo') ||
    query.includes('ekiti') ||
    query.includes('western') ||
    query.includes('abeokuta') ||
    query.includes('akure') ||
    query.includes('ado-ekiti') ||
    query.includes('osogbo') ||
    query.includes('ile-ife')
  ) {
    return 'ibadan';
  }

  // Kano & Northern Chapter (Kano, Katsina, Jigawa, Sokoto, Kebbi, Zamfara)
  if (
    query.includes('kano') ||
    query.includes('katsina') ||
    query.includes('jigawa') ||
    query.includes('sokoto') ||
    query.includes('kebbi') ||
    query.includes('zamfara') ||
    query.includes('northern') ||
    query.includes('dutse') ||
    query.includes('birnin kebbi') ||
    query.includes('gusau')
  ) {
    return 'kano';
  }

  // Diaspora Chapter (International: UK, USA, Canada, London, Europe, etc.)
  if (
    query.includes('diaspora') ||
    query.includes('uk') ||
    query.includes('usa') ||
    query.includes('london') ||
    query.includes('canada') ||
    query.includes('abroad') ||
    query.includes('america') ||
    query.includes('united kingdom') ||
    query.includes('europe') ||
    query.includes('international') ||
    query.includes('germany') ||
    query.includes('dubai') ||
    query.includes('uae')
  ) {
    return 'diaspora';
  }

  // Abuja Executive Chapter (FCT, Nasarawa, Niger, etc.)
  if (
    query.includes('abuja') ||
    query.includes('fct') ||
    query.includes('nasarawa') ||
    query.includes('niger') ||
    query.includes('suleja') ||
    query.includes('mararaba') ||
    query.includes('gwagwalada') ||
    query.includes('kuwje') ||
    query.includes('bwari')
  ) {
    return 'abuja';
  }

  if (query.includes('national') || query.includes('secretariat')) {
    return 'national';
  }

  return 'abuja';
}

/**
 * Calculates live chapter counts from any list of members, local storage records,
 * and current active user profile, ensuring deduplication by service number.
 */
export function calculateChapterCounts(
  memberList: any[] = [],
  currentProfile?: any,
  baseCounts?: Record<string, number>
): Record<string, number> {
  const counts: Record<string, number> = {
    abuja: 0,
    lagos: 0,
    rivers: 0,
    kaduna: 0,
    plateau: 0,
    enugu: 0,
    ibadan: 0,
    kano: 0,
    diaspora: 0,
    national: 0,
    ...(baseCounts || {}),
  };

  const countedNms = new Set<string>();

  const processMember = (m: any) => {
    if (!m) return;
    const nms = (m.nms_number || m.nmsNo || m.nms || '').toString().trim().toUpperCase();
    if (nms && countedNms.has(nms)) return;
    if (nms) countedNms.add(nms);

    const homeCell = m.home_cell || m.homeCell || null;
    const stateOfRes = m.state_of_residence || m.stateOfResidence || m.state_of_origin || m.stateOfOrigin;
    const address = m.address;

    const cid = normalizeChapterId(homeCell, stateOfRes, address);
    if (cid && counts[cid] !== undefined) {
      counts[cid]++;
    }
  };

  // 1. Process server or known members
  if (Array.isArray(memberList)) {
    memberList.forEach(processMember);
  }

  // 2. Process locally stored members in browser
  if (typeof window !== 'undefined') {
    try {
      const localSaved = localStorage.getItem('nms08_registered_members');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          parsed.forEach(processMember);
        }
      }

      const sessionSaved = sessionStorage.getItem('nms08_registered_members');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed)) {
          parsed.forEach(processMember);
        }
      }

      // 3. Process current stored profile
      const storedProfile =
        localStorage.getItem('nms08_current_profile') ||
        sessionStorage.getItem('nms08_current_profile');
      if (storedProfile) {
        const p = JSON.parse(storedProfile);
        processMember(p);
      }
    } catch (err) {
      console.warn('Error reading local storage for chapter counts:', err);
    }
  }

  // 4. Process passed-in current active profile object
  if (currentProfile) {
    processMember(currentProfile);
  }

  return counts;
}

