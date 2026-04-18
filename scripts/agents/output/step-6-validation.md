# Validation: Step 6 — Build /api/phyllo/webhook route



# Validation: Step 6 — Build `/api/phyllo/webhook` route

## PRD Requirements Checklist

### Route Definition
| Requirement | Status | Notes |
|---|---|---|
| Route: `/api/phyllo/webhook` | ✅ PASS | File at `app/api/phyllo/webhook/route.ts` matches Next.js App Router conventions |
| Method: `POST` | ✅ PASS | Exports `POST` async function |
| Purpose: Receives data from Phyllo when stats are ready, writes to DB | ✅ PASS | Handles multiple event types and writes to DB |

### Webhook Authentication (Open Question in PRD)
| Requirement | Status | Notes |
|---|---|---|
| Verify Phyllo webhook signature to prevent spoofing | ⚠️ PARTIAL | Implementation checks a shared secret via `x-phyllo-secret` or `x-webhook-secret` headers (lines ~18-25), but this is **optional** — if `PHYLLO_WEBHOOK_SECRET` is not set, the webhook is completely unauthenticated. The PRD flags this as an open question, but the implementation should at minimum log a warning when running without a secret, or default to requiring it. Additionally, Phyllo's actual webhook signature mechanism may use HMAC rather than a plain secret comparison — this should be verified against Phyllo docs. |

### Event Handling
| Requirement | Status | Notes |
|---|---|---|
| Handle `ACCOUNTS.CONNECTED` | ✅ PASS | `ACCOUNT_EVENTS` includes this; `handleAccountConnected` marks connected state and stores account ID |
| Handle `PROFILES.ADDED` / `PROFILES.UPDATED` | ✅ PASS | `PROFILE_EVENTS` handled; pulls follower count, total posts, username |
| Handle `ENGAGEMENT.ADDED` / `ENGAGEMENT.UPDATED` | ✅ PASS | `ENGAGEMENT_EVENTS` handled; pulls avg views, total posts, computes engagement rate |
| Handle `AUDIENCE.ADDED` / `AUDIENCE.UPDATED` | ✅ PASS | `AUDIENCE_EVENTS` handled; writes audience demographics |

### Data Points Written to DB

#### Per Platform Stats
| Data Point | Status | Notes |
|---|---|---|
| Follower count | ✅ PASS | Written as `followers` in `handleProfileData` |
| Average views per post/video | ✅ PASS | Written as `avg_views` in `handleEngagementData` |
| Engagement rate (likes + comments / followers) | ✅ PASS | Computed as `(avgLikes + avgComments) / followers * 100` in `handleEngagementData` |
| Total posts | ✅ PASS | Written in both `handleProfileData` and `handleEngagementData` |
| Username/handle — auto-fills social link field | ✅ PASS | Written to `instagram_handle` / `tiktok_handle` on profiles table in `handleProfileData` |

#### Audience Demographics
| Data Point | Status | Notes |
|---|---|---|
| `audience_age_18_24` | ✅ PASS | Written in `handleAudienceData` |
| `audience_age_25_34` | ✅ PASS | Written in `handleAudienceData` |
| `audience_age_35_plus` | ✅ PASS | Written in `handleAudienceData` |
| `audience_gender_male` | ✅ PASS | Written in `handleAudienceData` |
| `audience_gender_female` | ✅ PASS | Written in `handleAudienceData` |
| `audience_top_city` | ✅ PASS | Written in `handleAudienceData` |
| `audience_top_country` | ✅ PASS | Written in `handleAudienceData` |

### Platforms Supported
| Requirement | Status | Notes |
|---|---|---|
| Instagram | ✅ PASS | In `SUPPORTED_PLATFORMS` array |
| TikTok | ✅ PASS | In `SUPPORTED_PLATFORMS` array |
| X (Twitter) excluded (out of scope) | ✅ PASS | Not in `SUPPORTED_PLATFORMS`; unsupported platforms are explicitly skipped with logging |

### DB Schema Alignment
| Requirement | Status | Notes |
|---|---|---|
| PRD specifies columns on `profiles` table | ⚠️ PARTIAL | **Significant deviation**: The PRD specifies per-platform stats as columns directly on the `profiles` table (e.g., `instagram_followers`, `tiktok_followers`, `instagram_connected`, `tiktok_connected`). The implementation instead writes per-platform stats to a **separate** `profile_social_stats` table with a `(profile_id, platform)` composite key. This is arguably a better design (normalized, extensible), but it **does not match the PRD schema**. The audience demographics and handle columns are written to `profiles` as specified. The `phyllo_user_id` column is read from `profiles` as expected. |
| `instagram_connected` / `tiktok_connected` on profiles | ❌ FAIL | PRD specifies `instagram_connected` and `tiktok_connected` as boolean columns on `profiles`. The implementation stores `connected` on a separate `profile_social_stats` table. Other parts of the system (e.g., the frontend ProfileForm, the disconnect route) will expect these columns on `profiles` per the PRD. |
| `instagram_followers` / `tiktok_followers` on profiles | ❌ FAIL | Same issue — PRD specifies these on `profiles` but implementation writes to `profile_social_stats` |
| `instagram_avg_views` / `tiktok_avg_views` on profiles | ❌ FAIL | Same deviation |
| `instagram_engagement_rate` / `tiktok_engagement_rate` on profiles | ❌ FAIL | Same deviation |
| `instagram_total_posts` / `tiktok_total_posts` on profiles | ❌ FAIL | Same deviation |

### Error Handling
| Requirement | Status | Notes |
|---|---|---|
| Returns 200 even on processing errors to prevent retries | ✅ PASS | Catch block at line ~93 logs error but still returns `{ received: true }` |
| Invalid JSON returns 400 | ✅ PASS | Lines ~33-35 |
| Missing identifiers handled gracefully | ✅ PASS | Returns `{ received: true }` when no account_id/user_id |
| Profile not found handled gracefully | ✅ PASS | Returns `{ received: true }` when no matching profile |

### Engagement Rate Calculation
| Requirement | Status | Notes |
|---|---|---|
| Formula: (likes + comments) / followers | ✅ PASS | Uses `_avgLikes + _avgComments` divided by `followers`, multiplied by 100 for percentage. Matches PRD formula. |
| Handles missing follower data | ✅ PASS | Checks `followers && followers > 0` before dividing |

### External Dependencies
| Requirement | Status | Notes |
|---|---|---|
| Uses `createAdminClient` (Supabase admin) | ✅ PASS | Appropriate for server-side webhook processing |
| Uses Phyllo API helpers | ✅ PASS | Imports `fetchPhylloAccount`, `fetchPhylloProfiles`, `fetchPhylloEngagement`, `fetchPhylloAudience` from `@/lib/phyllo-api` |

---

## Key Issues

### 1. Schema Mismatch (Critical)
The implementation uses a `profile_social_stats` table instead of the PRD-specified columns on the `profiles` table. This affects:
- All per-platform stats (followers, avg_views, engagement_rate, total_posts, connected flags)
- The `instagram_connected` / `tiktok_connected` booleans the frontend will rely on
- Downstream steps (7, 8) that will need to query this data

Either the PRD schema needs to be formally amended, or the implementation needs to write to the `profiles` table columns as specified.

### 2. Webhook Secret Verification (Minor)
The secret check is optional. In production this should be required or at minimum warn loudly in logs that it's running unauthenticated.

### 3. `ACCOUNTS.