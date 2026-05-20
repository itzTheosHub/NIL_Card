# PRD: Multi-Stage Onboarding Flow

## Overview

Replace the single-page profile creation form with a 3-stage onboarding flow. Phyllo social connect comes before manual stats entry so that pulled data can pre-populate fields. Existing users are routed through the flow to ensure profile completeness.

---

## Stages

### Stage 1 — Basic Info (`/onboarding/basics`)
Collected at the point of account creation (after email/password signup).

**Fields:**
- Full name
- Username (slug — must be unique, used for `/profile/[username]`)

**On submit:**
- Insert a partial `profiles` row with `id`, `email`, `full_name`, `username`
- Redirect to Stage 2

---

### Stage 2 — Social Connect (`/onboarding/connect`)
Phyllo connect UI. Users can skip this stage entirely.

**Content:**
- Instagram and TikTok connect buttons (existing `PhylloConnectSection`)
- Per-platform requirement notices shown **before** the connect button is tapped:
  - **TikTok:** account must be public and have posts within the last 90 days for engagement stats to populate
  - **Instagram:** requires a Meta Business Account linked to a verified Meta account. This is enforced by Meta and Phyllo's SDK — the requirement will appear during the OAuth flow if not met. Athletes should switch to a Business/Creator account in Instagram settings before connecting.
- If stats are pulled, show them inline as confirmation
- "Skip for now" button → proceeds to Stage 3
- "Continue" button (after connecting at least one) → proceeds to Stage 3

**On connect:**
- Phyllo user created, SDK token issued, OAuth flow opens
- On success: followers, username, engagement stats upserted to `profile_social_stats`
- `phyllo_user_id` saved to `profiles`

---

### Stage 3 — Profile Details (`/onboarding/profile`)
Remaining profile fields. Phyllo-pulled stats are pre-populated where available and editable.

**Fields:**
- Sport
- School / University
- Graduation year
- Division
- Bio
- Profile photo
- Engagement rate (pre-populated from Phyllo or manual entry)
- Avg views (pre-populated from Phyllo or manual entry)
- Social links (with follower counts)
- Content focus tags
- Deliverables
- Featured posts
- Awards
- Highlights
- Press articles

**Behavior:**
- If Phyllo pulled followers/engagement, pre-populate those fields and mark them as "Verified"
- If no Phyllo data (skipped or no recent content), fields are blank and editable
- On submit: update the partial `profiles` row with all remaining fields, insert related table rows
- Redirect to `/profile/[username]`

---

## Routing Logic

### New users
```
/signup → /onboarding/basics → /onboarding/connect → /onboarding/profile → /profile/[username]
```

### Existing users (incomplete profiles)
On login, check profile completeness:
- No `profiles` row → `/onboarding/basics`
- Has row but missing required fields (sport, university, etc.) → `/onboarding/profile`
- Profile complete → `/profile/[username]`

Existing users skip Stage 2 (they can connect socials from `/profile/[username]/edit`).

### Skip behavior
- Stage 2 can be skipped → goes directly to Stage 3
- Stage 3 cannot be skipped (required to create usable profile)

---

## DB Changes

| Change | Reason |
|--------|--------|
| `profiles.full_name` and `profiles.username` must be insertable without other required fields | Stage 1 creates a partial row |
| Add `onboarding_complete boolean default false` to `profiles` | Track whether user has finished Stage 3 |
| Existing NOT NULL constraints on `profiles` columns need review | Partial insert at Stage 1 must not violate constraints |

---

## New Pages / Components

| File | Description |
|------|-------------|
| `app/onboarding/basics/page.tsx` | Stage 1 — name + username form |
| `app/onboarding/connect/page.tsx` | Stage 2 — Phyllo connect with skip option |
| `app/onboarding/profile/page.tsx` | Stage 3 — full profile form (reuses `ProfileForm`) |
| `middleware.ts` (update) | Redirect incomplete profiles to correct onboarding stage |

---

## Edge Cases

- **Username already taken:** validate uniqueness on Stage 1 before insert
- **User refreshes mid-flow:** check `profiles` row state on load and resume at correct stage
- **User connects Phyllo then skips to Stage 3:** stats should pre-populate from `profile_social_stats`
- **Engagement data null (no recent content):** show fields as blank and editable, no error
- **Existing users with complete profiles:** bypass all onboarding stages on login
