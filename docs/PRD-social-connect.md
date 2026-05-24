# PRD: Social Stats Connect — Instagram & TikTok

## Overview

Replace Phyllo with direct Meta (Instagram Graph API) + TikTok API for auto-pulling athlete social stats. Stats shown on the NIL Card get a "Verified" badge when they come from a connected account, distinguishing them from self-reported manual entry. Brands see verified numbers = more trust, more inquiries.

Athletes connect during onboarding (Stage 2) or at any time from their profile edit page or settings.

**Status:** Waiting on Meta/TikTok developer account approval through Core Technical Solutions, LLC.

---

## Goals

- Verified stats → higher brand trust → more inquiries
- Remove Phyllo dependency (cost, reliability, account type restrictions)
- One-time connect → stats stay in sync automatically
- Manual entry stays available as a fallback for athletes who don't want to connect

---

## Touchpoints

| Where | Route | Who hits it |
|-------|-------|-------------|
| Onboarding Stage 2 | `/onboarding/connect` | New athletes, right after name/username setup |
| Profile edit — Connected Accounts card | `/profile/[username]/edit` | Any athlete, existing or new, from their edit form |
| Settings page | `/settings/connected-accounts` | Athletes managing tokens, re-syncing, or switching accounts |

---

## What We Pull Per Platform

### Instagram (Graph API)
Requires **Creator or Business account** — personal accounts are not supported by the API.

| Field | API Permission |
|-------|---------------|
| Username | `instagram_basic` |
| Follower count | `instagram_basic` |
| Profile photo | `instagram_basic` |
| Media count | `instagram_basic` |
| Engagement rate | `instagram_manage_insights` |
| Avg views per reel | `instagram_manage_insights` |

Permissions needed: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`

### TikTok (Login Kit)
Requires a public account.

| Field | Scope |
|-------|-------|
| Username | `user.info.basic` |
| Follower count | `user.info.stats` |
| Following count | `user.info.stats` |
| Likes count | `user.info.stats` |
| Video count | `user.info.stats` |
| Avg views (per-video from list) | `video.list` |

Scopes: `user.info.basic`, `user.info.profile`, `user.info.stats`, `video.list`

---

## Verified Badge Design

When stats on the public NIL Card are API-pulled, they get a small verified indicator:

- **Badge:** emerald pill with a checkmark icon — `✓ Verified` — shown next to follower counts and engagement rate
- **Self-reported label:** gray `· Self-reported` text shown when stats are manually entered
- **No label:** shown if the field is empty (athlete never entered anything)
- Badge is on the public-facing card only (`FlippableCard.tsx`) — the edit form does not show it

---

## Stage 2 Onboarding — `/onboarding/connect`

### Layout

```
Step 2 of 3

Connect your social accounts
Pull your real stats automatically. Brands trust verified numbers.

┌─────────────────────────────────────────────────────────┐
│ ⚠ Instagram requires a Creator or Business account.     │
│ Personal accounts won't work. Switching is free and     │
│ takes 30 seconds: Settings → Account → Switch to        │
│ Professional Account. You can switch back anytime.      │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│  📸 Connect Instagram │   │  🎵 Connect TikTok    │
└──────────────────────┘   └──────────────────────┘

[Skip for now]                           [Continue →]
```

### After one platform connects

```
✅ Instagram — @theo_athlete
   42.3K followers · 8.2% engagement · last synced just now

┌──────────────────────┐
│  🎵 Connect TikTok   │
└──────────────────────┘

[Skip for now]                           [Continue →]
```

### Behavior

- Platforms are independent — connect one, both, or neither
- On successful OAuth: immediately pull stats, show confirmation inline
- "Skip for now" → proceeds to Stage 3 with no stats connected
- "Continue" → always available (doesn't require connecting either platform)
- Stats pulled here auto-populate Stage 3 fields and mark them as verified

---

## Connected Accounts Card (Profile Edit)

Located at the top of the edit form, above all content sections.

**Per platform (connected state):**
```
📸 Instagram               ✅ Connected
@theo_athlete — 42.3K followers
Last synced: 2 hours ago     [Refresh Stats]  [Disconnect]
```

**Per platform (not connected state):**
```
🎵 TikTok                  — Not connected
                                        [Connect TikTok]
```

Behavior:
- "Refresh Stats" — calls `/api/social/refresh` for that platform, updates stats inline
- "Disconnect" — revokes token, clears `is_verified`, stats revert to manual (editable)
- "Connect" — starts OAuth flow, returns back to edit page after callback

---

## Settings Page — `/settings/connected-accounts`

Dedicated page. Same connected accounts card, plus:

- **Token expiry warning:** "Your Instagram token expires in 12 days. Refresh to extend." (shown when < 14 days remaining)
- **Last sync timestamp** and manual Refresh button
- **Disconnect and reconnect** with a different account
- Accessible from profile edit and (eventually) a nav/settings link

---

## OAuth Flows

### Instagram
1. Athlete clicks "Connect Instagram"
2. `GET /api/auth/instagram` — builds Meta OAuth URL, redirects athlete
3. Athlete logs in + approves permissions on Meta
4. Meta redirects to `GET /api/auth/instagram/callback?code=...`
5. Exchange code → short-lived token → exchange for long-lived token (60-day)
6. Store token in Supabase `profiles` row (encrypted)
7. Immediately call Graph API to pull stats
8. Write stats to `profile_social_stats` with `is_verified = true`, `last_synced_at = now()`
9. Redirect back to wherever the athlete came from (onboarding or edit page)

### TikTok
1. Athlete clicks "Connect TikTok"
2. `GET /api/auth/tiktok` — builds TikTok OAuth URL, redirects athlete
3. Athlete logs in + approves scopes on TikTok
4. TikTok redirects to `GET /api/auth/tiktok/callback?code=...`
5. Exchange code → access token (24hr) + refresh token (365 days)
6. Store both tokens in Supabase `profiles` row
7. Immediately call TikTok API to pull stats
8. Write stats to `profile_social_stats` with `is_verified = true`, `last_synced_at = now()`
9. Redirect back

---

## Token Management

### Instagram (60-day long-lived token)
- Store `instagram_token_expires_at` in Supabase
- On every stats refresh: if token expires within 7 days, call Meta's token refresh endpoint first
- If token is expired (> 60 days without refresh): show "Reconnect Instagram" in the card — cannot refresh, must re-auth
- Show expiry warning in settings when < 14 days remaining

### TikTok (access token = 24hr, refresh token = 365 days)
- Before every stats pull: check if access token is expired
- If expired: use refresh token to get a new access token, update in Supabase
- If refresh token is also expired (> 365 days inactive): show "Reconnect TikTok" prompt

---

## DB Schema Changes

### `profiles` table — new columns
```sql
instagram_access_token    text             -- encrypted at rest
instagram_user_id         text
instagram_token_expires_at timestamptz
tiktok_access_token       text             -- encrypted at rest
tiktok_refresh_token      text             -- encrypted at rest
tiktok_user_id            text             -- open_id from TikTok
tiktok_token_expires_at   timestamptz
tiktok_refresh_expires_at timestamptz
```

### `profile_social_stats` table — new columns
```sql
is_verified    boolean      default false  -- true = API-pulled, false = manual entry
last_synced_at timestamptz                 -- null if never synced
```

---

## New API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/instagram` | GET | Initiates Instagram OAuth redirect |
| `/api/auth/instagram/callback` | GET | Handles callback, stores token, pulls initial stats |
| `/api/auth/tiktok` | GET | Initiates TikTok OAuth redirect |
| `/api/auth/tiktok/callback` | GET | Handles callback, stores tokens, pulls initial stats |
| `/api/social/refresh` | POST | Re-pulls stats for a given platform (`{ platform: 'instagram' \| 'tiktok' }`) |
| `/api/social/disconnect` | POST | Revokes token, clears stats verified flag (`{ platform: 'instagram' \| 'tiktok' }`) |

---

## New Pages & Components

| File | Route | Description |
|------|-------|-------------|
| `app/onboarding/connect/page.tsx` | `/onboarding/connect` | Stage 2 of onboarding flow |
| `app/settings/connected-accounts/page.tsx` | `/settings/connected-accounts` | Token management + refresh |
| `components/ConnectedAccountsCard.tsx` | — | Reusable card used in edit form + settings page |

---

## Implementation Order

Steps below map directly to `npm run spec-to-code docs/PRD-social-connect.md <N>`.

**Step 1 — DB migration**
Add columns to `profiles`: `instagram_access_token`, `instagram_user_id`, `instagram_token_expires_at`, `tiktok_access_token`, `tiktok_refresh_token`, `tiktok_user_id`, `tiktok_token_expires_at`, `tiktok_refresh_expires_at`
Add columns to `profile_social_stats`: `is_verified boolean default false`, `last_synced_at timestamptz`
Output: `supabase/social-connect-migration.sql`

**Step 2 — TikTok OAuth routes**
`app/api/auth/tiktok/route.ts` — GET: build TikTok OAuth URL using env vars, redirect athlete to TikTok login
`app/api/auth/tiktok/callback/route.ts` — GET: receive `code`, exchange for access + refresh tokens, store in `profiles`, pull stats from TikTok API, write to `profile_social_stats` with `is_verified = true`, redirect back to `/onboarding/connect` or `/profile/[username]/edit`
Env vars needed: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
Pattern reference: `lib/supabase-server.ts`, `app/api/brand-inquiry/route.ts`

**Step 3 — Instagram OAuth routes**
`app/api/auth/instagram/route.ts` — GET: build Meta OAuth URL, redirect athlete
`app/api/auth/instagram/callback/route.ts` — GET: receive `code`, exchange for short-lived token, exchange for long-lived token (60 day), store in `profiles`, pull stats, write to `profile_social_stats` with `is_verified = true`, redirect back
Env vars needed: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`

**Step 4 — Social management routes**
`app/api/social/refresh/route.ts` — POST `{ platform: 'instagram' | 'tiktok' }`: re-pull stats using stored token, update `profile_social_stats`
`app/api/social/disconnect/route.ts` — POST `{ platform: 'instagram' | 'tiktok' }`: clear token columns, set `is_verified = false`

**Step 5 — ConnectedAccountsCard component**
`components/ConnectedAccountsCard.tsx` — shows connection status per platform, Refresh + Disconnect buttons, Connect button for unconnected platforms. Used in both edit form and settings page.

**Step 6 — Onboarding connect page**
`app/onboarding/connect/page.tsx` — Stage 2 of onboarding. Instagram Creator/Business warning, two connect buttons, post-connect stat confirmation, Skip + Continue.

**Step 7 — Settings connected accounts page**
`app/settings/connected-accounts/page.tsx` — full token management: last synced, token expiry warning, reconnect prompts.

**Step 8 — Verified badge on FlippableCard**
Update `app/profile/[username]/FlippableCard.tsx` — emerald "Verified" badge next to API-pulled stats, gray "Self-reported" label for manual entry.

**Step 9 — Wire ConnectedAccountsCard into profile edit**
Update `components/ProfileForm.tsx` — add ConnectedAccountsCard at top of edit form.

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Personal Instagram account (not Creator/Business) | `instagram_manage_insights` returns 403 → show inline error: "Insights require a Creator or Business account. Switch in IG Settings → Account → Switch to Professional Account." |
| No posts in last 90 days | `engagement_rate` + `avg_views` return null → show those fields blank, not as error. Follower count still populated. |
| Token expired > 60 days (Instagram) | Show "Reconnect Instagram" — cannot refresh, must re-auth |
| Stats pull fails (API error) | Keep existing stats, show "Last sync failed — Retry?" |
| Athlete disconnects | Clear token columns, set `is_verified = false`, stats revert to editable manual fields |
| Athlete connects different account than previously stored | Update username + all stats, overwrite previous `user_id` |
| Instagram: no linked Facebook Page | OAuth may fail or `pages_show_list` returns empty → surface error with instructions to link a Facebook Page in Instagram settings |

---

## Open Questions

- **Token encryption:** store raw in Supabase (RLS protected) or encrypt at the app layer? → recommend app-layer encryption with a server-side secret for defense in depth
- **Cron refresh:** do we auto-refresh Instagram tokens on a schedule (e.g. every 30 days via Vercel cron) or only on-demand? → on-demand for now, cron later
- **TikTok sandbox:** sandbox mode allows testing with an approved sandbox user — need to add own TikTok account as sandbox target before demo video recording
