import type { StaticImageData } from 'next/image';

// Wedding invitations for Ex-Boys of the NMS 08 set.
// The flyers live in src/announcements and are shown in full on the Events page.

import flyerOifoh from '@/announcements/ASP Oifoh David Okaka weds Blessing Anjolaoluwa Koleoso (14-11-2026).jpeg';
import flyerQueen from '@/announcements/Queen Asam weds Hope Douglas (21-11-2026).jpeg';
import flyerRilwan from '@/announcements/Rilwan Haliru Tambuwal weds Sadiya Abbakar Zaki Tambuwal (27-11-2026).jpeg';
import flyerFarouq from '@/announcements/Farouq Haruna weds Bar. Maryam Sani Ahmad (18-12-2006).jpeg';
import flyerImrana from '@/announcements/LT. Imrana Aminu Mani weds Khadija Aminu Muhammad (25-12-2026).jpeg';

export interface Wedding {
  id: string;
  /** Couple exactly as printed on the invitation flyer. */
  couple: string;
  /** ISO date (YYYY-MM-DD) — drives the ticker cut-off and chronological sorting. */
  isoDate: string;
  /** Full invitation flyer, rendered as-is when a member opens the wedding. */
  flyer: StaticImageData;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Formats an ISO date as e.g. "Saturday, 14 November 2026". The date is built
 * from its own components, so the result is identical on the server and the
 * client and cannot drift with the visitor's timezone.
 */
export function formatWeddingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(year, month - 1, day));
}

/** Local calendar date as YYYY-MM-DD, so the cut-off follows the reader's day. */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const WEDDINGS: Wedding[] = [
  {
    id: 'wed-2026-11-14-oifoh',
    couple: 'ASP Oifoh David Okaka weds Blessing Anjolaoluwa Koleoso',
    isoDate: '2026-11-14',
    flyer: flyerOifoh,
  },
  {
    id: 'wed-2026-11-21-queen',
    couple: 'Queen Asam weds Hope Douglas',
    isoDate: '2026-11-21',
    flyer: flyerQueen,
  },
  {
    id: 'wed-2026-11-27-rilwan',
    couple: 'Rilwan Haliru Tambuwal weds Sadiya Abbakar Zaki Tambuwal',
    isoDate: '2026-11-27',
    flyer: flyerRilwan,
  },
  {
    id: 'wed-2026-12-18-farouq',
    couple: 'Farouq Haruna weds Bar. Maryam Sani Ahmad',
    isoDate: '2026-12-18',
    flyer: flyerFarouq,
  },
  {
    id: 'wed-2026-12-25-imrana',
    couple: 'LT. Imrana Aminu Mani weds Khadija Aminu Muhammad',
    isoDate: '2026-12-25',
    flyer: flyerImrana,
  },
];

/**
 * Weddings still to hold, soonest first. A wedding leaves the list the day after
 * it holds, which is what removes it from the announcement ticker.
 */
export function upcomingWeddings(today: Date = new Date()): Wedding[] {
  const todayKey = toDateKey(today);
  return WEDDINGS.filter((w) => w.isoDate >= todayKey).sort((a, b) =>
    a.isoDate.localeCompare(b.isoDate)
  );
}
