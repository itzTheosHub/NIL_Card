# Validation: Step 9 — Build GET /api/phyllo/stats route



# QA Validation — Step 9: Build `GET /api/phyllo/stats` Route

## PRD Requirement Analysis

### 1. Route Definition: `GET /api/phyllo/stats`
> "Returns per-platform stats for the current user from `profile_social_stats` — used to poll for stats after SDK connect"

**`app/api/phyllo/stats/route.ts`**

- ✅ PASS — Route is `GET` method at `/api/phyllo/stats`
- ✅ PASS — Queries `profile_social_stats` table for per-platform stats
- ✅ PASS — Returns stats for the current authenticated user

### 2. Authentication: "for the current auth user"
> "queries `profile_social_stats` for the current auth user"

- ✅ PASS — Uses `supabase.auth.getUser()` to authenticate; returns 401 if no user (lines 8–14 of `route.ts`)

### 3. Per-Platform Stats Structure
> PRD specifies per-platform: follower count, average views, engagement rate, total posts

- ✅ PASS — Selects `followers, avg_views, engagement_rate, total_posts, connected` from `profile_social_stats`
- ✅ PASS — Response is structured per-platform (`instagram` and `tiktok` keys)
- ✅ PASS — Each platform object includes `followers`, `avgViews`, `engagementRate`, `totalPosts`
- ✅ PASS — Includes `hasStats` boolean flag, enabling the frontend to know when stats have landed (critical for the polling use case in Step 10)

### 4. Audience Demographics
> PRD DB columns: `audience_age_18_24`, `audience_age_25_34`, `audience_age_35_plus`, `audience_gender_male`, `audience_gender_female`, `audience_top_city`, `audience_top_country`

- ✅ PASS — All 7 audience columns are fetched from the `profiles` table and returned in the `audience` object

### 5. Platforms Supported: Instagram + TikTok only (v1)
- ✅ PASS — Only `instagram` and `tiktok` are filtered from `statsRows` (lines 39–40)
- ✅ PASS — X (Twitter) is not included, consistent with "Out of Scope"

### 6. Used by frontend to poll for stats after SDK connect
> Step 9 description: "used by the frontend to poll for stats after the SDK connect callback fires"

- ✅ PASS — `lib/phyllo-stats.ts` provides `fetchPhylloStats()` utility for single fetch
- ✅ PASS — `pollForPlatformStats()` implements polling with configurable `intervalMs` (default 2000ms) and `maxRetries` (default 5) — exactly matching Step 10's spec of "poll every 2s up to 5 retries"
- ✅ PASS — `pollForPlatformStats` checks `hasStats` per platform to determine if stats have arrived
- ✅ PASS — Returns full stats response on success or `null` on timeout

### 7. Type Safety
- ✅ PASS — `PhylloPlatformStats`, `PhylloAudienceStats`, and `PhylloStatsResponse` types are well-defined in `lib/phyllo-stats.ts`, providing a clean contract for frontend consumption

---

## Minor Observations (non-blocking)

### ⚠️ PARTIAL — Error handling for `profile_social_stats` query
The route destructures `{ data: statsRows }` from the `profile_social_stats` query (line 36) but does **not** check for an error response, unlike the `profiles` query which properly checks `profileError`. If the `profile_social_stats` query fails, `statsRows` would be `null` and the code would still proceed (the `?.find()` calls handle this gracefully returning `null`), so it won't crash — but a DB error would be silently swallowed. This is a minor robustness concern, not a PRD violation.

### ⚠️ PARTIAL — Polling starts immediately on first attempt
`pollForPlatformStats` skips the wait on `attempt === 0` and fetches immediately. This is reasonable behavior (try once right away, then wait between retries), but the PRD says "poll every 2s up to 5 retries" which could be interpreted as 5 attempts with waits. In practice this means you get up to 5 attempts over ~8 seconds instead of ~10 seconds — functionally equivalent and arguably better UX.

---

## Overall Verdict

**✅ READY TO MERGE**

The implementation fully satisfies Step 9's requirements. The `GET /api/phyllo/stats` route correctly authenticates the user, queries `profile_social_stats` for per-platform data, includes audience demographics from the `profiles` table, and structures the response to support the polling use case described in Step 10. The helper library (`lib/phyllo-stats.ts`) pre-builds the polling logic with the exact parameters specified in the PRD (2s interval, 5 retries). The minor observations above are non-blocking quality improvements.