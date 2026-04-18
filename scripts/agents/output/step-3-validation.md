# Validation: Step 3 — Build /api/phyllo/create-user route

# QA Validation: Step 3 — Build `/api/phyllo/create-user` route

## PRD Requirements for this Route

| # | Requirement | Verdict | Details |
|---|-------------|---------|---------|
| 1 | Route is `POST /api/phyllo/create-user` | ✅ PASS | File at `app/api/phyllo/create-user/route.ts` exports `POST` — matches Next.js App Router conventions. |
| 2 | Purpose: "Creates or retrieves a Phyllo user for the athlete" | ✅ PASS | Lines 18–34 check for existing `phyllo_user_id` and return it if present (`existing: true`), making the endpoint idempotent. If none exists, a new Phyllo user is created. |
| 3 | Only authenticated athletes can call this route | ✅ PASS | Lines 8–15 call `supabase.auth.getUser()` and return 401 if no user session. |
| 4 | Stores `phyllo_user_id` in profiles table | ✅ PASS | Lines 67–70 update the `profiles` row with the new `phyllo_user_id`. |
| 5 | Uses `PHYLLO_CLIENT_ID` and `PHYLLO_SECRET` env vars | ⚠️ PARTIAL | The route delegates to `getPhylloAuthHeader()` and `getPhylloBaseUrl()` from `@/lib/phyllo`. The implementation of that helper is not provided for review, so we cannot confirm the env vars are consumed correctly. Assuming the helper exists and is correct, this passes — but **the helper file `lib/phyllo.ts` should be included in the review**. |
| 6 | Calls Phyllo API to create user | ✅ PASS | Lines 40–55 make a `POST` to `{phylloBaseUrl}/v1/users` with `Content-Type: application/json` and the auth header. |
| 7 | Supports Instagram and TikTok platforms | ✅ PASS | Lines 49–52 pass `work_platform_ids` for both Instagram and TikTok with what appear to be Phyllo's known platform UUIDs. |
| 8 | Error handling — Phyllo API failure | ✅ PASS | Lines 57–63 check `phylloResponse.ok`, log the error body, and return the upstream status code with detail. |
| 9 | Error handling — general exceptions | ✅ PASS | Lines 83–87 catch unexpected exceptions and return 500. |
| 10 | Error handling — DB update failure is non-fatal | ✅ PASS | Lines 73–80: if the `profiles` update fails, the route still returns the `phyllo_user_id` with a `warning` field. This is a smart resilience choice. |

---

## Additional Observations

### Minor Issues

1. **Hardcoded platform UUIDs (lines 49–52):** These UUIDs (`9bb8913b-...` for Instagram, `de55aeec-...` for TikTok) should be verified against Phyllo's documentation. If they're wrong, the entire integration silently targets the wrong platforms. Consider extracting these to constants in `lib/phyllo.ts` with descriptive names for maintainability.

2. **`user.email` as Phyllo user name (line 48):** `JSON.stringify({ name: user.email ?? \`user-${user.id}\` })` — Phyllo's `name` field receives the user's email address. This works but leaks PII to a third-party service. The PRD doesn't specify what to send here; using the fallback pattern `user-${user.id}` for all users might be more privacy-conscious.

3. **No rate limiting or abuse protection:** The PRD doesn't explicitly require it, but this endpoint creates billable Phyllo users. A malicious or buggy client could spam it. The idempotency check mitigates repeat calls for the same user, but there's no protection against rapid sequential calls before the first `phyllo_user_id` is saved (race condition).

4. **Race condition on idempotency:** If two concurrent requests arrive before `phyllo_user_id` is saved, both will pass the `if (profile.phyllo_user_id)` check and create two Phyllo users. The second `update` will overwrite the first. This is a low-probability edge case but worth noting. A `select ... for update` or a unique constraint on `phyllo_user_id` would prevent it.

5. **Missing `lib/phyllo.ts` from review:** The route depends on `getPhylloBaseUrl()` and `getPhylloAuthHeader()`. These are critical for correctness (staging vs production URL, Basic auth encoding). They need to be validated separately.

---

## Summary

| Category | Count |
|----------|-------|
| ✅ PASS | 9 |
| ⚠️ PARTIAL | 1 (helper file not provided) |
| ❌ FAIL | 0 |

---

## Verdict: **READY TO MERGE** ✅

The route implementation is solid, idempotent, well-structured, and handles all the PRD requirements for this step. The one partial item (`lib/phyllo.ts` not included in the review) is a review gap, not a code gap — ensure that file is validated separately. The minor issues noted (race condition, PII in name field, hardcoded UUIDs) are non-blocking but should be tracked for follow-up.