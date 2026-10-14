import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided in .env');
  process.exit(1);
}

const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const anonSupabase = ANON_KEY
  ? createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } })
  : null;

const FUNCTION_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/register`;

const GENERIC_FAIL_MSG = "We couldn't verify those details. Check your NMS number and full name, or contact the electoral committee.";
const ALREADY_REG_MSG = "This NMS number has already registered. If you lost your code, contact the electoral committee.";
const RATE_LIMIT_MSG = "Too many attempts. Try again in 15 minutes.";

// Dedicated test row
const TEST_NMS = 'NMS/08/9999';
const TEST_FULL_NAME = 'Alexander Chukwuemeka OBIOMA';
const TEST_TOKENS = ['alexander', 'chukwuemeka', 'obioma'];

async function invokeRegister(body, customIp = null) {
  const effectiveKey = (ANON_KEY && ANON_KEY.startsWith('eyJ')) ? ANON_KEY : SERVICE_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': effectiveKey,
    'Authorization': `Bearer ${effectiveKey}`,
  };
  if (customIp) {
    headers['x-forwarded-for'] = customIp;
  }

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const status = res.status;
  const rawText = await res.text();
  let data = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    data = rawText;
  }
  if (status !== 200 && status !== 400 && status !== 409 && status !== 429) {
    console.error(`[DEBUG HTTP ${status}]`, rawText);
  }
  return { status, data };
}

async function resetTestRow() {
  const { data: row } = await adminSupabase
    .from('roster')
    .select('id')
    .eq('nms_number', TEST_NMS)
    .maybeSingle();

  if (row) {
    await adminSupabase.from('voters').delete().eq('roster_id', row.id);
    await adminSupabase
      .from('roster')
      .update({ registered: false, registered_at: null })
      .eq('id', row.id);
  }
}

async function resetAttempts() {
  await adminSupabase.from('registration_attempts').delete().gte('id', 0);
}

async function runTests() {
  console.log('====================================================');
  console.log('   NMS 08 Digital Governance - Registration Tests   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extraInfo = '') {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} - ${extraInfo}`);
      failed++;
    }
  }

  // Ensure dedicated test row exists in roster
  await adminSupabase.from('roster').upsert({
    nms_number: TEST_NMS,
    full_name: TEST_FULL_NAME,
    name_tokens: TEST_TOKENS,
    registered: false,
    registered_at: null,
  }, { onConflict: 'nms_number' });

  await resetTestRow();
  await resetAttempts();

  // 1. Correct NMS number + correct name
  console.log('\n--- Test Case 1: Correct registration ---');
  await resetAttempts();
  await resetTestRow();
  const res1 = await invokeRegister({ nms_number: TEST_NMS, full_name: TEST_FULL_NAME });
  assert('Registers successfully (status 200, ok=true)', res1.status === 200 && res1.data?.ok === true, JSON.stringify(res1.data));
  assert('Returns 6-character code', typeof res1.data?.code === 'string' && res1.data.code.length === 6, `Code: ${res1.data?.code}`);
  const registeredCode = res1.data?.code;

  // 2. Typed variants of valid number
  console.log('\n--- Test Case 2: Typed variants normalization ---');
  const variants = ['nms/08/9999', 'NMS 08 9999', 'NMS-08-9999', 'nms08 9999', 'NMS_08_9999', 'nms.08.9999'];
  for (const variant of variants) {
    await resetAttempts();
    await resetTestRow();
    const resVar = await invokeRegister({ nms_number: variant, full_name: TEST_FULL_NAME });
    assert(`Variant '${variant}' normalizes and registers`, resVar.status === 200 && resVar.data?.ok === true, JSON.stringify(resVar.data));
  }

  // 3. Malformed input returns generic failure and logs failed attempt
  console.log('\n--- Test Case 3: Malformed input handling ---');
  await resetAttempts();
  const malformedInputs = ['hello', '6672', 'NMS/08/'];
  for (const badNms of malformedInputs) {
    const resBad = await invokeRegister({ nms_number: badNms, full_name: TEST_FULL_NAME });
    assert(
      `Malformed input '${badNms}' returns status 400 and generic message`,
      resBad.status === 400 && resBad.data?.message === GENERIC_FAIL_MSG,
      JSON.stringify(resBad.data)
    );
  }

  // 4. Correct NMS number + wrong name
  console.log('\n--- Test Case 4: Correct NMS + wrong name ---');
  await resetAttempts();
  await resetTestRow();
  const resWrongName = await invokeRegister({ nms_number: TEST_NMS, full_name: 'John Totally Wrong' });
  assert(
    'Wrong name returns 400 with identical generic message',
    resWrongName.status === 400 && resWrongName.data?.message === GENERIC_FAIL_MSG,
    JSON.stringify(resWrongName.data)
  );

  // 5. NMS number not on the roster
  console.log('\n--- Test Case 5: Non-existent NMS number ---');
  await resetAttempts();
  const resNotFound = await invokeRegister({ nms_number: 'NMS/08/0001', full_name: 'Nobody Here' });
  assert(
    'Non-existent NMS number returns exact same generic message',
    resNotFound.status === 400 && resNotFound.data?.message === GENERIC_FAIL_MSG,
    JSON.stringify(resNotFound.data)
  );

  // 6. Same NMS number registered a second time (already registered)
  console.log('\n--- Test Case 6: Duplicate registration attempt ---');
  await resetAttempts();
  await resetTestRow();
  const firstReg = await invokeRegister({ nms_number: TEST_NMS, full_name: TEST_FULL_NAME });
  assert('First registration succeeds', firstReg.status === 200 && firstReg.data?.ok === true);
  const secondReg = await invokeRegister({ nms_number: TEST_NMS, full_name: TEST_FULL_NAME });
  assert(
    'Second registration returns status 409 and already-registered message',
    secondReg.status === 409 && secondReg.data?.message === ALREADY_REG_MSG,
    JSON.stringify(secondReg.data)
  );

  // 7. Name typed in different order
  console.log('\n--- Test Case 7: Permuted name order ---');
  await resetAttempts();
  await resetTestRow();
  const resPermuted = await invokeRegister({ nms_number: TEST_NMS, full_name: 'OBIOMA Alexander Chukwuemeka' });
  assert('Name in different order succeeds', resPermuted.status === 200 && resPermuted.data?.ok === true);

  // 8. Name typed without middle name
  console.log('\n--- Test Case 8: Name without middle name ---');
  await resetAttempts();
  await resetTestRow();
  const resNoMiddle = await invokeRegister({ nms_number: TEST_NMS, full_name: 'Alexander OBIOMA' });
  assert('Name without middle name succeeds', resNoMiddle.status === 200 && resNoMiddle.data?.ok === true);

  // 9. Single-word name
  console.log('\n--- Test Case 9: Single-word name ---');
  await resetAttempts();
  await resetTestRow();
  const resSingleWord = await invokeRegister({ nms_number: TEST_NMS, full_name: 'Alexander' });
  assert(
    'Single-word name rejected with generic failure',
    resSingleWord.status === 400 && resSingleWord.data?.message === GENERIC_FAIL_MSG,
    JSON.stringify(resSingleWord.data)
  );

  // 10. Two simultaneous requests for same NMS number
  console.log('\n--- Test Case 10: Atomic race condition concurrency check ---');
  await resetAttempts();
  await resetTestRow();
  const [race1, race2] = await Promise.all([
    invokeRegister({ nms_number: TEST_NMS, full_name: TEST_FULL_NAME }),
    invokeRegister({ nms_number: TEST_NMS, full_name: TEST_FULL_NAME }),
  ]);
  const raceSuccessCount = (race1.status === 200 ? 1 : 0) + (race2.status === 200 ? 1 : 0);
  const raceConflictCount = (race1.status === 409 ? 1 : 0) + (race2.status === 409 ? 1 : 0);
  assert(
    'Exactly one of simultaneous requests succeeds and the other gets 409',
    raceSuccessCount === 1 && raceConflictCount === 1,
    `Statuses: ${race1.status}, ${race2.status}`
  );

  // 11. Rate limit: 9 attempts within 15 minutes
  console.log('\n--- Test Case 11: Rate limiting (8 max per 15 min per IP) ---');
  await resetAttempts();
  let statusNinth = null;
  let bodyNinth = null;
  for (let i = 1; i <= 9; i++) {
    const resRate = await invokeRegister({ nms_number: 'NMS/08/0000', full_name: 'Bad Attempt' });
    if (i === 9) {
      statusNinth = resRate.status;
      bodyNinth = resRate.data;
    }
  }
  assert(
    'Ninth attempt returns status 429 with rate-limit message',
    statusNinth === 429 && bodyNinth?.message === RATE_LIMIT_MSG,
    `Status: ${statusNinth}, Body: ${JSON.stringify(bodyNinth)}`
  );

  // 12. RLS check with anon key
  console.log('\n--- Test Case 12: Row Level Security with Anon Key ---');
  if (anonSupabase) {
    const { data: rosterData, error: rosterErr } = await anonSupabase.from('roster').select('*').limit(5);
    const { data: votersData, error: votersErr } = await anonSupabase.from('voters').select('*').limit(5);
    const { data: attemptsData, error: attemptsErr } = await anonSupabase.from('registration_attempts').select('*').limit(5);

    const rosterBlocked = rosterErr != null || !rosterData || rosterData.length === 0;
    const votersBlocked = votersErr != null || !votersData || votersData.length === 0;
    const attemptsBlocked = attemptsErr != null || !attemptsData || attemptsData.length === 0;

    assert('Anon client cannot read roster table', rosterBlocked, rosterErr?.message ?? 'Data leaked');
    assert('Anon client cannot read voters table', votersBlocked, votersErr?.message ?? 'Data leaked');
    assert('Anon client cannot read registration_attempts table', attemptsBlocked, attemptsErr?.message ?? 'Data leaked');
  } else {
    console.warn('[SKIP] Anon key not provided; skipping direct anon RLS select test.');
  }

  // 13. Stored code_hash in voters is 64-char hex string, not plaintext
  console.log('\n--- Test Case 13: Code hash verification ---');
  await resetAttempts();
  await resetTestRow();
  const regCheck = await invokeRegister({ nms_number: TEST_NMS, full_name: TEST_FULL_NAME });
  const plaintextCode = regCheck.data?.code;

  const { data: testRoster } = await adminSupabase.from('roster').select('id').eq('nms_number', TEST_NMS).single();
  const { data: voterDirect } = await adminSupabase.from('voters').select('code_hash').eq('roster_id', testRoster.id).single();

  const codeHash = voterDirect?.code_hash;
  const is64Hex = typeof codeHash === 'string' && /^[0-9a-f]{64}$/i.test(codeHash);
  const isNotPlaintext = codeHash !== plaintextCode;

  assert('Stored code_hash is 64-character hex string', is64Hex, `Hash: ${codeHash}`);
  assert('Stored code_hash never equals plaintext code', isNotPlaintext, `Plaintext: ${plaintextCode}`);

  // 14. Password creation during registration and login verification
  console.log('\n--- Test Case 14: Password creation and NMS login access ---');
  await resetAttempts();
  await resetTestRow();

  const testPassword = 'ExBoySecure2026!';
  const expectedHash = crypto.createHash('sha256').update(testPassword).digest('hex');

  const regWithPwd = await invokeRegister({
    nms_number: TEST_NMS,
    full_name: TEST_FULL_NAME,
    company: 'Alpha Company',
    email: 'alexander.obioma@nms08alumni.org',
    password: testPassword,
  });

  assert('Registration with password returns ok: true', regWithPwd.status === 200 && regWithPwd.data?.ok === true);

  const { data: profileRow } = await adminSupabase
    .from('member_profiles')
    .select('*')
    .eq('nms_number', TEST_NMS)
    .single();

  assert('member_profiles contains stored password_hash', !!profileRow?.password_hash);
  assert('password_hash matches SHA-256 of visitor password', profileRow?.password_hash === expectedHash);

  // Test NMS access simulation
  const checkLogin = async (identifier, pwd) => {
    const inputHash = crypto.createHash('sha256').update(pwd.trim()).digest('hex');
    const trimmed = identifier.trim();
    const matchFull = trimmed.match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
    const canonical = matchFull ? `NMS/${matchFull[1]}/${matchFull[2]}` : null;

    let member = null;
    if (canonical) {
      const { data } = await adminSupabase.from('member_profiles').select('*').eq('nms_number', canonical).maybeSingle();
      member = data;
    }
    if (!member) {
      const { data } = await adminSupabase.from('member_profiles').select('*').ilike('nms_number', trimmed).maybeSingle();
      member = data;
    }
    if (!member || member.password_hash !== inputHash) {
      return false;
    }
    return true;
  };

  assert('Access granted with canonical NMS number NMS/08/9999', await checkLogin('NMS/08/9999', testPassword));
  assert('Access granted with lowercase nms/08/9999', await checkLogin('nms/08/9999', testPassword));
  assert('Access granted with spaced NMS 08 9999', await checkLogin('NMS 08 9999', testPassword));
  assert('Access denied with wrong password', !(await checkLogin('NMS/08/9999', 'WrongPassword123')));

  // Cleanup: Reset test row after testing
  console.log('\n--- Cleanup ---');
  await resetTestRow();
  await adminSupabase.from('roster').delete().eq('nms_number', TEST_NMS);
  await resetAttempts();
  console.log('Test row and rate-limit test data cleaned up.');

  console.log('\n====================================================');
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
