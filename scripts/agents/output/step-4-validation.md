# Validation: Step 4 — Build /api/phyllo/create-token route

# QA Validation — Step 4: Build `/api/phyllo/create-token` route

## PRD Requirements Checklist

### Route Definition
| Requirement | Status | Notes |
|---|---|---|
| Route path is `/api/phyllo/create-token` | ✅ PASS | File located at `app/api/phyllo/create-token/route.ts` — correct Next.js App Router convention |
| Method is POST | ✅ PASS | Exports `async function POST(request: NextRequest)` |
| Purpose: Generates a short-lived SDK token for the frontend | ✅ PASS | Calls Phyllo's `/v1/sdk-tokens` endpoint and returns `sdk_token` + `expires_at` |

### Authentication & Authorization
| Requirement | Status | Notes |
|---|---|---|
| User must be authenticated | ✅ PASS | Checks `supabase.auth.getUser()` and returns 401 if no user (lines 11–19) |
| Prevents token generation for another user's Phyllo account | ✅ PASS | Cross-checks `phyllo_user_id` from request body against the profile's stored `phyllo_user_id` and returns 403 on mismatch (lines 37–45) |

### Environment Variables
| Requirement | Status | Notes |
|---|---|---|
| Uses `PHYLLO_CLIENT_ID` | ✅ PASS | Read at line 48 |
| Uses `PHYLLO_SECRET` | ✅ PASS | Read at line 49 |
| Handles missing env vars gracefully | ✅ PASS | Returns 500 with "Server configuration error" if either is missing (lines 51–55) |

### Phyllo API Integration
| Requirement | Status | Notes |
|---|---|---|
| Uses correct Phyllo base URL for staging vs production | ✅ PASS | Switches on `PHYLLO_ENV` — staging: `api.staging.getphyllo.com`, production: `api.getphyllo.com` (lines 4–6) |
| Uses Basic auth with client_id:secret | ✅ PASS | Base64-encodes credentials (line 57) |
| Sends correct Phyllo products | ✅ PASS | Sends `["IDENTITY", "IDENTITY.AUDIENCE", "ENGAGEMENT", "ENGAGEMENT.AUDIENCE"]` — matches all four PRD-required products |
| Sends `user_id` in request body | ✅ PASS | `user_id: phyllo_user_id` (line 66) |
| Returns `sdk_token` and `expires_at` to frontend | ✅ PASS | Lines 81–84 |

### Error Handling
| Requirement | Status | Notes |
|---|---|---|
| Invalid/missing request body | ✅ PASS | try/catch on `request.json()` returns 400 (lines 23–27) |
| Missing `phyllo_user_id` param | ✅ PASS | Returns 400 with descriptive message (lines 31–35) |
| Phyllo API returns non-OK response | ✅ PASS | Logs error details, returns upstream status code + error details (lines 74–79) |
| Network/fetch failure | ✅ PASS | Caught in outer try/catch, returns 500 (lines 86–90) |

### Edge Case Review
| Concern | Status | Notes |
|---|---|---|
| New user with no profile yet (profile query returns null) | ✅ PASS | The guard at line 39 only blocks if `profile && profile.phyllo_user_id && profile.phyllo_user_id !== phyllo_user_id` — allows first-time token generation when profile has no `phyllo_user_id` yet |

### Minor Observations (non-blocking)

| Observation | Severity | Notes |
|---|---|---|
| `PHYLLO_ENV` is not listed in the PRD's environment variables section | ⚠️ PARTIAL | The PRD only specifies `PHYLLO_CLIENT_ID` and `PHYLLO_SECRET`. The implementation introduces a new `PHYLLO_ENV` variable for base URL switching. This is a sensible design decision that aligns with the PRD's open question about staging vs production, but it should be documented and added to `.env.local` / Vercel config. |
| No rate limiting on the endpoint | ⚠️ PARTIAL | Not explicitly required by the PRD, but the PRD does mention SDK tokens are "short-lived." No rate limiting could allow token generation abuse. Low severity for v1. |

---

## Overall Verdict

## ✅ READY TO MERGE

The implementation is solid, well-structured, and covers all PRD requirements for Step 4. Authentication, authorization, error handling, Phyllo product configuration, and environment switching are all properly implemented. The only minor note is to document the `PHYLLO_ENV` variable alongside the other env vars when updating `.env.local` and Vercel settings.