# Validation: Step 7 — Build /api/phyllo/disconnect route

# QA Validation: Step 7 — Build `/api/phyllo/disconnect` route

## Requirements Check

### 1. Route Definition
| PRD Requirement | Status |
|---|---|
| Route: `/api/phyllo/disconnect` | ✅ PASS |
| Method: `POST` | ✅ PASS |
| Purpose: Removes Phyllo connection for a platform | ✅ PASS |

The route is at `app/api/phyllo/disconnect/route.ts` and exports a `POST` handler.

### 2. Authentication
✅ **PASS** — The route authenticates the user via Supabase (`supabase.auth.getUser()`) and returns 401 if not authenticated (lines 30–37).

### 3. Platform Validation
✅ **PASS** — Validates that `platform` is either `"instagram"` or `"tiktok"` (line 43). X (Twitter) is correctly excluded per the "Out of Scope" section.

### 4. Phyllo User Lookup
✅ **PASS** — Retrieves `phyllo_user_id` from the `profiles` table and returns 404 if not found (lines 49–58).

### 5. Phyllo API Integration (Disconnect)
✅ **PASS** — Calls `POST /v1/accounts/{accountId}/disconnect` on Phyllo's API (lines 97–103). Supports both explicit `accountId` from the request body and automatic account resolution via the Phyllo accounts list API (lines 66–93).

### 6. Environment-Aware Base URL
✅ **PASS** — Uses `PHYLLO_ENV` to switch between staging (`api.staging.getphyllo.com`) and production (`api.getphyllo.com`) (lines 4–6). This aligns with the open question in the PRD about staging vs production environments.

### 7. Auth Header Construction
✅ **PASS** — Uses `PHYLLO_CLIENT_ID` and `PHYLLO_SECRET` environment variables with Basic auth (lines 8–12), matching the PRD's env var requirements.

### 8. DB Update: Set Connected Flag to False
✅ **PASS** — Updates the `instagram_connected` or `tiktok_connected` column to `false` (lines 117–123).

### 9. PRD Requirement: "Does not clear the stats already saved"
✅ **PASS** — The update only sets `{platform}_connected: false`. It does **not** clear `instagram_followers`, `instagram_avg_views`, `instagram_engagement_rate`, `instagram_total_posts`, `tiktok_followers`, etc. This matches the PRD: *"Disconnect removes the Phyllo connection for that platform (does not clear the stats already saved)."*

### 10. Error Handling
✅ **PASS** — Comprehensive error handling:
- 401 for unauthenticated users
- 400 for invalid platform
- 404 for no Phyllo account
- 502 for Phyllo API failures (both lookup and disconnect)
- 500 for DB update failures after successful Phyllo disconnect
- Graceful handling of Phyllo 404 (account already removed) — still updates DB (line 111)
- Catch-all try/catch with 500 response

### 11. Edge Case: No Phyllo Account on Platform
✅ **PASS** — If no account is found on Phyllo's side during lookup, it still marks the platform as disconnected in the DB (lines 82–91). This is a sensible defensive approach.

### 12. Audience Demographics Columns
Not applicable to this step — disconnect doesn't need to interact with audience data columns, and correctly doesn't.

---

## Minor Observations (non-blocking)

1. **`PHYLLO_ENV` not in PRD env vars** — The PRD specifies `PHYLLO_CLIENT_ID` and `PHYLLO_SECRET` but doesn't explicitly list `PHYLLO_ENV`. This is a reasonable addition but should be documented. ⚠️ **PARTIAL** — The PRD's open question about staging vs production is addressed here, but `PHYLLO_ENV` should be added to the env vars documentation.

2. **No rate limiting or CSRF protection** — Not specified in the PRD for this step, so not a failure, but worth noting for security hardening later.

3. **Type assertion `err: any`** (line 131) — Minor TypeScript style issue; `unknown` would be safer. Non-blocking.

---

## Overall Verdict

**✅ READY TO MERGE**

The implementation fully satisfies all PRD requirements for Step 7. The route correctly authenticates users, validates input, communicates with the Phyllo API, updates only the connected flag (preserving saved stats as required), and handles errors comprehensively. The edge case handling (account already removed, no account found) is thoughtful and robust.