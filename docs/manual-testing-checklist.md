# Manual Testing Checklist: NMS 08 Registration Portal

This checklist verifies the frontend user experience and Edge Function integration end-to-end.

## Pre-conditions
- Supabase project schema migrated (`supabase/migrations/001_registration_schema.sql`).
- Roster data imported (`scripts/import-roster.mjs`).
- `register` Edge Function deployed (`supabase functions deploy register`).
- Frontend running locally (`npm run dev`).
- Test candidate details ready:
  - **Valid Roster Member**: `NMS/08/6672` | Name: `Isah NUPEKO Mohammed`
  - **Dedicated Test Member**: `NMS/08/9999` | Name: `Alexander Chukwuemeka OBIOMA`

---

## UI Test Cases

| # | Test Scenario | Input Data | Expected Result | Pass/Fail |
|---|---------------|------------|-----------------|-----------|
| **1** | **Form Initial State** | Page load on `/register` | - NMS Number & Full Name inputs are empty.<br>- "Get my code" button is disabled until both fields are populated.<br>- Inputs have clean placeholders and hint labels. | [ ] |
| **2** | **In-flight Submission State** | Fill valid details and click "Get my code" | - Button text switches to "Verifying details..." with a loading spinner.<br>- Button is disabled to prevent double clicks/double submissions.<br>- Input fields are disabled while in flight. | [ ] |
| **3** | **Malformed NMS Number** | NMS: `hello` or `6672`<br>Name: `Isah NUPEKO Mohammed` | - Red error banner displays generic error: *"We couldn't verify those details. Check your NMS number and full name, or contact the electoral committee."*<br>- No specific mention of format invalidity. | [ ] |
| **4** | **Unmatched Name** | NMS: `NMS/08/6672`<br>Name: `Wrong Person Name` | - Identical generic error banner displayed.<br>- System does not reveal whether the NMS number exists. | [ ] |
| **5** | **Single-Word Name** | NMS: `NMS/08/6672`<br>Name: `Isah` | - Generic error banner displayed (requires at least 2 tokens). | [ ] |
| **6** | **Permuted & Accented Name** | NMS: `nms/08/6672`<br>Name: `Mohammed Isah` (order swapped, lowercase) | - Accredits successfully.<br>- Displays 6-character code in large monospace font. | [ ] |
| **7** | **Success Code Display** | Valid first-time registration | - Code display card appears.<br>- Code is large, monospaced, bold.<br>- Prominent warning: *"Write this down now. This code will NOT be shown again..."*<br>- "Copy Code" button copies code to clipboard and updates label to "Copied to Clipboard". | [ ] |
| **8** | **Ephemeral Code Verification** | Refresh page after receiving code | - The code disappears on refresh.<br>- Code is NOT found in `localStorage`, `sessionStorage`, or cookies. | [ ] |
| **9** | **Already Registered Attempt** | Re-enter `NMS/08/6672` + `Isah NUPEKO Mohammed` | - 409 Conflict handled.<br>- Displays: *"This NMS number has already registered. If you lost your code, contact the electoral committee."* | [ ] |
| **10** | **Rate Limiting** | Submit 9 invalid attempts rapidly | - On the 9th attempt, displays: *"Too many attempts. Try again in 15 minutes."* | [ ] |

---

## Post-Test Cleanup
If you used `NMS/08/6672` or `NMS/08/9999` for UI testing, reset the record using the Admin SQL procedure documented in [`docs/admin-lost-code.md`](file:///c:/Users/USER/Desktop/NMS-08-Digital-Governance-Platform-master/docs/admin-lost-code.md).
