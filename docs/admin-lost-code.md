# Admin Procedure: Reissuing Lost Registration Codes

## Overview
Codes are generated once, hashed with SHA-256 before storage in the `voters` table, and returned to the voter exactly once. Codes are never stored in plaintext and **cannot be recovered**.

If a voter loses their registration code, an admin must reset their registration status so they can register again and generate a new code.

---

## Safety Preconditions (CRITICAL)
> [!CAUTION]
> **Never reset a voter who has already voted (`voters.has_voted = true`).**
> Resetting a voter who has already cast a ballot compromises election integrity. Always verify `has_voted = false` before proceeding.

---

## Step-by-Step Procedure

### 1. Verify Voter Status and Eligibility
Run this query in the Supabase SQL Editor (or via administrative service role script) using the voter's canonical NMS number (e.g., `NMS/08/6672`):

```sql
select 
  r.id as roster_id,
  r.nms_number,
  r.full_name,
  r.registered,
  r.registered_at,
  v.id as voter_id,
  v.has_voted,
  v.created_at as code_issued_at
from roster r
left join voters v on v.roster_id = r.id
where r.nms_number = 'NMS/08/6672';
```

- If `v.has_voted = true`: **STOP**. Do not reissue a code under any circumstances.
- If `r.registered = false` or `v.id is null`: The user has not completed registration yet. Direct them to the registration page.
- If `r.registered = true` and `v.has_voted = false`: Proceed to Step 2.

---

### 2. Reset the Registration Record
Execute the following atomic transaction to remove the old voter record and re-enable registration:

```sql
begin;

-- Delete the voter entry (removing the old code hash)
delete from voters
where roster_id in (
  select id from roster where nms_number = 'NMS/08/6672'
)
and has_voted = false;

-- Reset registration status on the roster row
update roster
set registered = false,
    registered_at = null
where nms_number = 'NMS/08/6672';

commit;
```

---

### 3. Record the Reset in Admin Audit Log
Record every reset in an administrative audit log with the following details:
- **Timestamp** (UTC / Local)
- **Admin Name / ID**
- **Voter NMS Number**
- **Voter Full Name**
- **Reason for Reset** (e.g., "Voter misplaced original one-time code prior to voting")

Example log entry:
```
[2026-10-14 18:30 UTC] Admin: electoral-committee-admin@nms08.org | NMS: NMS/08/6672 | Name: Isah NUPEKO Mohammed | Action: RESET_CODE | has_voted: FALSE
```

---

### 4. Direct Voter to Re-register
Notify the voter that their profile has been reset. Instruct them to visit the registration portal, re-enter their NMS number and full name, and immediately copy and write down the newly generated 6-character code.
