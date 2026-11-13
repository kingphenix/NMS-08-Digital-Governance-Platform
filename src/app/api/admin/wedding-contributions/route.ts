import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/server-auth';
import { isWeddingCompany } from '@/lib/wedding-contributions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/wedding-contributions
 * Body: { company: string, amount: number, mode?: 'add' | 'set' }
 * Records a contribution towards a company's wedding-fund total. Admins use
 * `add` (default) to log money as it comes in, or `set` to correct a figure.
 */
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Administrator authentication required.' }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const company = String(body?.company || '').trim().toLowerCase();
  const mode: 'add' | 'set' = body?.mode === 'set' ? 'set' : 'add';
  const amount = Number(body?.amount);

  if (!isWeddingCompany(company)) {
    return NextResponse.json({ ok: false, message: 'Unknown company.' }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Enter a valid contribution amount.' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: existing, error: readError } = await supabase
      .from('wedding_contributions')
      .select('amount_ngn')
      .eq('company', company)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ ok: false, message: 'Could not read the current total.' }, { status: 500 });
    }

    const current = Number(existing?.amount_ngn) || 0;
    const next = mode === 'set' ? amount : current + amount;

    const { error: writeError } = await supabase
      .from('wedding_contributions')
      .upsert(
        { company, amount_ngn: next, updated_at: new Date().toISOString() },
        { onConflict: 'company' }
      );

    if (writeError) {
      return NextResponse.json({ ok: false, message: 'Could not save the contribution.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, company, amount: next, mode });
  } catch {
    return NextResponse.json({ ok: false, message: 'Could not save the contribution.' }, { status: 500 });
  }
}
