# PRD — Phyllo Social Connect

**Feature:** Automatic social media stats via Phyllo OAuth  
**Status:** Planned  
**Priority:** High — removes the biggest onboarding friction point

---

## Problem

Athletes have to manually calculate and enter their social media stats (follower count, engagement rate, avg views) during onboarding. This creates friction, leads to inaccurate data, and is a barrier to signup. Most athletes don't know how to calculate engagement rate and abandon the form.

---

## Solution

Integrate Phyllo's Connect SDK so athletes can authenticate their Instagram and TikTok accounts via OAuth. Phyllo pulls their stats automatically and populates the profile form fields. Athletes verify the data before saving.

---

## Platforms Supported (v1)

- Instagram
- TikTok

X (Twitter) deferred to a future version.

---

## Data Points to Pull

### Per Platform (Instagram + TikTok)
- Follower count
- Average views per post/video
- Engagement rate (likes + comments / followers)
- Total posts
- Username/handle — auto-fills their social link field

### Audience Demographics (requires `IDENTITY.AUDIENCE` product)
- Age breakdown (18–24, 25–34, 35+)
- Gender split
- Top audience locations (cities/countries)

### Phyllo Products Required
- `IDENTITY`
- `IDENTITY.AUDIENCE`
- `ENGAGEMENT`
- `ENGAGEMENT.AUDIENCE`

---

## User Stories

**As an athlete creating a profile:**
I want to connect my Instagram and TikTok accounts so my stats are pulled automatically and I don't have to calculate them manually.

**As an athlete editing my profile:**
I want to see that my accounts are connected, refresh my stats when my following grows, and disconnect a platform if I no longer want it linked.

**As an athlete whose Phyllo connection fails:**
I want a clear explanation of why it failed and the option to try again or enter my stats manually.

---

## UX Flow

### Onboarding (Create Profile)
1. Athlete lands on `/profile/create`
2. Top of ProfileForm shows "Connect your accounts" section with two buttons: Instagram and TikTok
3. Each platform has a "Skip for now" link below its button
4. Athlete clicks "Connect Instagram" → API creates Phyllo user + token → Phyllo Connect SDK modal opens
5. Athlete authenticates with Instagram in the Phyllo modal
6. Modal closes → stats auto-populate the relevant form fields below
7. Athlete reviews populated fields, can edit or delete any values they don't want
8. Athlete fills in remaining fields (bio, sport, school, etc.) and submits

### Edit Profile
1. Athlete goes to `/profile/[username]/edit`
2. "Connect your accounts" section shows connection state per platform:
   - **Not connected:** Connect button + "Skip for now"
   - **Connected:** Green checkmark + platform name + "Refresh Stats" button + "Disconnect" button
3. "Refresh Stats" re-runs the Phyllo pull and re-populates fields with latest data
4. "Disconnect" removes the Phyllo connection for that platform (does not clear the stats already saved)

---

## Error Handling

If Phyllo fails to pull stats, show an inline error message below the connect button:

> "We couldn't pull your stats. This can happen if:
> - Your account is set to private
> - The platform is temporarily down
>
> [Try Again] or enter your stats manually below."

Both "Try Again" and manual input are always available as fallbacks.

---

## Technical Requirements

### New API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/phyllo/create-user` | POST | Creates or retrieves a Phyllo user for the athlete |
| `/api/phyllo/create-token` | POST | Generates a short-lived SDK token for the frontend |
| `/api/phyllo/webhook` | POST | Receives data from Phyllo when stats are ready, writes to DB |
| `/api/phyllo/disconnect` | POST | Removes Phyllo connection for a platform |
| `/api/phyllo/stats` | GET | Returns per-platform stats for the current user from `profile_social_stats` — used to poll for stats after SDK connect |

### New DB Columns (profiles table)
| Column | Type | Description |
|--------|------|-------------|
| `phyllo_user_id` | text | Phyllo's user ID for this athlete |
| `instagram_connected` | bool | Whether Instagram is connected via Phyllo |
| `tiktok_connected` | bool | Whether TikTok is connected via Phyllo |
| `instagram_followers` | int4 | Pulled from Phyllo |
| `tiktok_followers` | int4 | Pulled from Phyllo |
| `instagram_avg_views` | float4 | Pulled from Phyllo |
| `tiktok_avg_views` | float4 | Pulled from Phyllo |
| `instagram_engagement_rate` | float4 | Pulled from Phyllo |
| `tiktok_engagement_rate` | float4 | Pulled from Phyllo |
| `instagram_total_posts` | int4 | Pulled from Phyllo |
| `tiktok_total_posts` | int4 | Pulled from Phyllo |
| `audience_age_18_24` | float4 | % of audience aged 18–24 |
| `audience_age_25_34` | float4 | % of audience aged 25–34 |
| `audience_age_35_plus` | float4 | % of audience aged 35+ |
| `audience_gender_male` | float4 | % male audience |
| `audience_gender_female` | float4 | % female audience |
| `audience_top_city` | text | Top audience city (e.g. "Cincinnati, OH") |
| `audience_top_country` | text | Top audience country |

### Environment Variables Needed
```
PHYLLO_CLIENT_ID=
PHYLLO_SECRET=
```

### Frontend Changes (ProfileForm.tsx)
- Add "Connect your accounts" section at the top of the form
- Two platform buttons (Instagram, TikTok) with "Skip for now" link each
- Connected state: green checkmark + "Refresh Stats" + "Disconnect"
- On successful connect: auto-populate `total_followers`, `avg_views`, `engagement_rate` fields
- On error: show inline error message with reasons + Try Again button

### Phyllo SDK
- Install Phyllo Connect SDK (check docs for npm package name)
- Load SDK on button click with the token from `/api/phyllo/create-token`
- Handle `onExit`, `onAccountConnected`, `onAccountDisconnected` SDK callbacks

---

## Out of Scope (v1)

- X (Twitter) integration
- Auto-updating stats on a schedule (athlete manually refreshes)
- Profile photo pulled from Instagram/TikTok (kept separate)
- Pulling individual post data or content
- Showing connected account username on the public profile card

---

## Open Questions

- Does Phyllo allow connecting private Instagram/TikTok accounts? (Verify in Phyllo docs — if not, add to error message)
- Which Phyllo environment to use for staging vs production (staging: `api.staging.getphyllo.com`, production: `api.getphyllo.com`)
- Webhook authentication — verify Phyllo webhook signature to prevent spoofing

---

## Build Order

1. ✅ Add DB columns to `profiles` table (Supabase migration)
2. ✅ Add env vars to `.env.local` and Vercel
3. ✅ Build `/api/phyllo/create-user` route
4. ✅ Build `/api/phyllo/create-token` route
5. ✅ Install Phyllo SDK, add connect buttons to ProfileForm
6. ✅ Build `/api/phyllo/webhook` route
7. ✅ Build `/api/phyllo/disconnect` route
8. ✅ Wire up connected state UI (checkmark, refresh, disconnect)
9. ✅ Build `GET /api/phyllo/stats` route — queries `profile_social_stats` for the current auth user, returns per-platform stats; used by the frontend to poll for stats after the SDK connect callback fires
10. ✅ Add polling loop in `usePhylloConnect.ts` `onAccountConnected` — after marking state as connected, poll `/api/phyllo/stats` every 2s up to 5 retries until the platform's stats appear, then call `options.onStatsReceived`
11. Fix `create-user` route for new users — change `.single()` to `.maybeSingle()` so route doesn't 404 when no profile row exists yet; still create Phyllo user, skip DB update if profile is null
12. Thread `phylloUserId` through form submit on create page — add `onPhylloUserIdReady` callback to `usePhylloConnect` and `PhylloConnectSection`; capture in `ProfileForm` state; include `phyllo_user_id` in the Supabase INSERT payload on profile creation
13. Test end-to-end on staging with a fresh account

