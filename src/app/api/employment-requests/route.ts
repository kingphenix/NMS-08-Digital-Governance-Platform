import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface EmploymentRequest {
  id: string;
  nms_number: string;
  full_name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  skills: string;
  job_interest: string;
  preferred_location?: string;
  status: 'Pending' | 'Contacted' | 'Reviewing' | 'Placed';
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'employment_requests.json');

function loadRequestsFromFile(): EmploymentRequest[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Could not read employment requests file:', err);
  }
  return [];
}

function saveRequestsToFile(requests: EmploymentRequest[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write employment requests file:', err);
  }
}

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const requests = loadRequestsFromFile();
  return NextResponse.json({
    ok: true,
    requests,
    total: requests.length,
  });
}

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request data.' }, { status: 400 });
  }

  const nms_number = String(body?.nms_number || body?.nms || '').trim().toUpperCase();
  const full_name = String(body?.full_name || body?.name || '').trim();
  const company = String(body?.company || '').trim();
  const phone = String(body?.phone || '').trim();
  const email = String(body?.email || '').trim();
  const industry = String(body?.industry || '').trim();
  const skills = String(body?.skills || '').trim();
  const job_interest = String(body?.job_interest || body?.jobInterest || body?.description || '').trim();
  const preferred_location = String(body?.preferred_location || body?.preferredLocation || '').trim();

  if (!nms_number || !full_name) {
    return NextResponse.json(
      { ok: false, message: 'NMS number and Full Name are required.' },
      { status: 400 }
    );
  }

  if (!industry) {
    return NextResponse.json(
      { ok: false, message: 'Please specify your industry sector.' },
      { status: 400 }
    );
  }

  if (!skills) {
    return NextResponse.json(
      { ok: false, message: 'Please specify your key skills & competencies.' },
      { status: 400 }
    );
  }

  if (!job_interest) {
    return NextResponse.json(
      { ok: false, message: 'Please describe the type of jobs or roles you are interested in.' },
      { status: 400 }
    );
  }

  // 1. Update member profile in Supabase with the newly provided/confirmed skills and industry
  const supabase = getServiceClient();
  if (supabase) {
    try {
      const updatePayload: Record<string, any> = {
        industry,
        skills,
        updated_at: new Date().toISOString(),
      };
      if (phone) updatePayload.phone = phone;
      if (email) updatePayload.email = email;

      await supabase
        .from('member_profiles')
        .update(updatePayload)
        .ilike('nms_number', nms_number);
    } catch (dbErr) {
      console.warn('Could not update member profile with skills/industry:', dbErr);
    }
  }

  // 2. Create the employment request record
  const now = new Date().toISOString();
  const currentRequests = loadRequestsFromFile();

  // Check if member already has a pending request; if so, update it, else add new
  const existingIndex = currentRequests.findIndex(
    (r) => r.nms_number.toUpperCase() === nms_number
  );

  let newOrUpdatedRequest: EmploymentRequest;

  if (existingIndex >= 0) {
    newOrUpdatedRequest = {
      ...currentRequests[existingIndex],
      full_name,
      company: company || currentRequests[existingIndex].company,
      phone: phone || currentRequests[existingIndex].phone,
      email: email || currentRequests[existingIndex].email,
      industry,
      skills,
      job_interest,
      preferred_location: preferred_location || currentRequests[existingIndex].preferred_location,
      status: 'Pending',
      updatedAt: now,
    };
    currentRequests[existingIndex] = newOrUpdatedRequest;
  } else {
    newOrUpdatedRequest = {
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nms_number,
      full_name,
      company,
      phone,
      email,
      industry,
      skills,
      job_interest,
      preferred_location,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };
    currentRequests.unshift(newOrUpdatedRequest);
  }

  saveRequestsToFile(currentRequests);

  // 3. Try to save to Supabase if employment_requests table exists (silent catch if not)
  if (supabase) {
    try {
      await supabase.from('employment_requests').upsert({
        id: newOrUpdatedRequest.id,
        nms_number,
        full_name,
        company,
        phone,
        email,
        industry,
        skills,
        job_interest,
        preferred_location,
        status: newOrUpdatedRequest.status,
        created_at: newOrUpdatedRequest.createdAt,
        updated_at: newOrUpdatedRequest.updatedAt,
      });
    } catch {
      // Table may not exist yet in Postgres schema, file backup is primary
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Your employment request has been submitted to the Executive Secretariat and Alumni Employment Desk.',
    request: newOrUpdatedRequest,
  });
}

export async function PATCH(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid data.' }, { status: 400 });
  }

  const { id, status } = body || {};
  if (!id || !status) {
    return NextResponse.json({ ok: false, message: 'Request ID and Status are required.' }, { status: 400 });
  }

  const currentRequests = loadRequestsFromFile();
  const idx = currentRequests.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, message: 'Request not found.' }, { status: 404 });
  }

  currentRequests[idx].status = status;
  currentRequests[idx].updatedAt = new Date().toISOString();
  saveRequestsToFile(currentRequests);

  const supabase = getServiceClient();
  if (supabase) {
    try {
      await supabase
        .from('employment_requests')
        .update({ status, updated_at: currentRequests[idx].updatedAt })
        .eq('id', id);
    } catch {}
  }

  return NextResponse.json({ ok: true, request: currentRequests[idx] });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, message: 'Request ID required.' }, { status: 400 });
  }

  let currentRequests = loadRequestsFromFile();
  currentRequests = currentRequests.filter((r) => r.id !== id);
  saveRequestsToFile(currentRequests);

  const supabase = getServiceClient();
  if (supabase) {
    try {
      await supabase.from('employment_requests').delete().eq('id', id);
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
