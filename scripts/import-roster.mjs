import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Canonical form: NMS/08/6672. Returns null if the input cannot be read as an NMS number.
// Keep this function IDENTICAL in scripts/import-roster.mjs and the Edge Function.
const normNms = (s) => {
  if (!s || typeof s !== 'string') return null;
  const m = s.trim().match(/^NMS[\s\/\-_.]*(\d{2})[\s\/\-_.]*(\d{1,6})$/i);
  return m ? `NMS/${m[1]}/${m[2]}` : null;
};

const toTokens = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z\s]/g, ' ')
    .split(/\s+/).filter(Boolean);

async function main() {
  console.log('--- Starting Roster Import ---');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment or .env file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // Determine CSV path
  const csvPath = path.resolve(rootDir, 'data', 'roster.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    trim: true,
    skip_empty_lines: true,
    bom: true,
  });

  console.log(`Read ${records.length} total rows from CSV.`);

  const malformedRows = [];
  const emptyValueRows = [];
  const shortNameRows = [];
  const duplicateNms = [];
  const seenNms = new Map();
  const validRows = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowNum = i + 2; // header is row 1

    const rawNms = (row['Number'] ?? row['nms_number'] ?? row['NMS No'] ?? row['NMS_NUMBER'] ?? '').trim();
    const rawName = (row['Full Name'] ?? row['full_name'] ?? row['Name'] ?? row['FULL_NAME'] ?? '').trim();

    if (!rawNms || !rawName) {
      emptyValueRows.push({ rowNum, rawNms, rawName, data: row });
      continue;
    }

    const nms = normNms(rawNms);
    if (!nms) {
      malformedRows.push({ rowNum, rawNms, rawName });
      continue;
    }

    if (seenNms.has(nms)) {
      duplicateNms.push({
        nms,
        originalRowNum: seenNms.get(nms),
        duplicateRowNum: rowNum,
        rawName,
      });
    } else {
      seenNms.set(nms, rowNum);
    }

    const tokens = toTokens(rawName);
    if (tokens.length < 2) {
      shortNameRows.push({ rowNum, nms, rawName, tokens });
    }

    validRows.push({
      nms_number: nms,
      full_name: rawName,
      name_tokens: tokens,
    });
  }

  // Reporting
  console.log('\n--- Validation Report ---');
  console.log(`Total rows processed: ${records.length}`);
  console.log(`Valid rows for import: ${validRows.length}`);
  console.log(`Empty value rows: ${emptyValueRows.length}`);
  console.log(`Malformed NMS rows: ${malformedRows.length}`);
  console.log(`Names with < 2 tokens: ${shortNameRows.length}`);
  console.log(`Duplicate NMS numbers: ${duplicateNms.length}`);

  if (emptyValueRows.length > 0) {
    console.warn('\nWarning: Rows with empty values:');
    console.table(emptyValueRows);
  }

  if (malformedRows.length > 0) {
    console.warn('\nWarning: Malformed NMS numbers:');
    console.table(malformedRows);
  }

  if (shortNameRows.length > 0) {
    console.warn('\nWarning: Names with fewer than 2 tokens:');
    console.table(shortNameRows);
  }

  if (duplicateNms.length > 0) {
    console.error('\nERROR: Duplicate NMS numbers detected:');
    console.table(duplicateNms);
    console.error('Halting import due to duplicate NMS numbers.');
    process.exit(1);
  }

  // Upsert in batches of 100
  const BATCH_SIZE = 100;
  console.log(`\nUpserting ${validRows.length} rows into 'roster' table in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('roster')
      .upsert(batch, {
        onConflict: 'nms_number',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
      process.exit(1);
    }
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} rows) upserted.`);
  }

  // Verification: Count rows in roster
  const { count, error: countError } = await supabase
    .from('roster')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error fetching final row count from roster:', countError);
  } else {
    console.log(`\n--- Import Complete ---`);
    console.log(`CSV row count: ${records.length}`);
    console.log(`Valid imported rows: ${validRows.length}`);
    console.log(`Roster table row count: ${count}`);
    if (count === validRows.length) {
      console.log('SUCCESS: Table row count matches valid CSV row count.');
    } else {
      console.log(`Notice: Table has ${count} rows (expected at least ${validRows.length}).`);
    }
  }

  // Spot check 3 rows
  const { data: sampleRows, error: sampleError } = await supabase
    .from('roster')
    .select('nms_number, full_name, name_tokens')
    .limit(3);

  if (sampleError) {
    console.error('Error fetching sample rows:', sampleError);
  } else {
    console.log('\n--- Spot Check (3 Rows) ---');
    console.log(JSON.stringify(sampleRows, null, 2));
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
