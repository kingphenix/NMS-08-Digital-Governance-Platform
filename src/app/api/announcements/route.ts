import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';

export const runtime = 'nodejs';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'dues' | 'general' | 'welfare' | 'election' | 'event' | 'urgent';
  severity: 'info' | 'warning' | 'urgent';
  target: 'all' | 'registered' | 'members';
  showOnTicker: boolean;
  postedBy: string;
  createdAt: string;
  active: boolean;
}

// In-memory persistent storage across server lifecycle
let serverAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Statutory Monthly Dues & Welfare Levy Compliance Notice',
    message: 'A cordial reminder to all esteemed Ex-Boys: statutory dues are ₦2,000 monthly, capped at ₦24,000 for the 2026 cycle — or pay ₦20,000 once to settle the whole year. Kindly ensure your dues and welfare levies are up to date to support our set governance, welfare mandates, and fraternal obligations.',
    type: 'dues',
    severity: 'info',
    target: 'all',
    showOnTicker: true,
    postedBy: 'National Executive Secretariat',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'ann-002',
    title: '2026 National Annual General Meeting (AGM)',
    message: 'The 2026 Virtual National AGM is scheduled for October 28, 2026 at 6:00 PM WAT. All accredited Ex-Boys are enjoined to participate via the Digital Governance Portal.',
    type: 'event',
    severity: 'info',
    target: 'all',
    showOnTicker: true,
    postedBy: 'Exboy Ikenna Ukonna (General Secretary)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    active: true,
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    announcements: serverAnnouncements,
  });
}

export async function POST(request: Request) {
  // Broadcasting is an administrative action — the public ticker feed stays open,
  // but only an authenticated admin may publish.
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || !body.title || !body.message) {
      return NextResponse.json(
        { ok: false, message: 'Title and message are required for announcement broadcast.' },
        { status: 400 }
      );
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: body.title.trim(),
      message: body.message.trim(),
      type: body.type || 'general',
      severity: body.severity || 'info',
      target: body.target || 'all',
      showOnTicker: body.showOnTicker !== false,
      postedBy: body.postedBy?.trim() || 'Admin / National Executive Council',
      createdAt: new Date().toISOString(),
      active: true,
    };

    serverAnnouncements = [newAnnouncement, ...serverAnnouncements];

    return NextResponse.json({
      ok: true,
      message: 'Announcement successfully broadcast to all registered pages.',
      announcement: newAnnouncement,
      announcements: serverAnnouncements,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Failed to process broadcast.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ ok: false, message: 'Announcement ID is required.' }, { status: 400 });
    }

    serverAnnouncements = serverAnnouncements.filter((a) => a.id !== id);
    return NextResponse.json({
      ok: true,
      message: 'Announcement deleted successfully.',
      announcements: serverAnnouncements,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Failed to delete announcement.' },
      { status: 500 }
    );
  }
}
