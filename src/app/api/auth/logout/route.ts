import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/server-auth';

export const runtime = 'nodejs';

export async function POST() {
  return clearSession(NextResponse.json({ ok: true, message: 'Signed out.' }));
}
