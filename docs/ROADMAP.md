# NIL Card — Roadmap

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 0 | Scaffold & CI | ✅ Done |
| 1 | Static UI | ✅ Done |
| 2 | Data Model & Validation | ✅ Done |
| 3 | Create Profile (POST) | ✅ Done |
| 4 | Fetch Profile (GET) | ✅ Done |
| 5 | Edit Profile (PATCH) | ✅ Done |
| 6 | Polish & Production | ✅ Done |
| 7 | Mobile & Polish | ✅ Done |
| 8 | Discoverability (`/athletes` directory) | 🟡 In Progress |
| 9 | Athlete Engagement Features | ⬜ Planned |
| 10 | Flippable Card + Featured Posts | 🟡 In Progress |
| 11 | Identity Verification | ⬜ Planned |
| 12 | Athlete Local Business Search | ⬜ Planned |
| 13 | Enhanced Athlete Stats (Media Kit) | ⬜ Planned |
| 14 | Stats Automation (Platform APIs) | ⬜ Planned |
| 15 | Brand Accounts + Marketplace | ⬜ Planned (after athlete side complete) |
| 16 | Landing Page Redesign | ⬜ Planned (after brand side) |

> **Priority:** Complete all athlete-side features (Phases 8–13) before building brand/marketplace features. Goal is to grow the athlete user base first.

---

## Phase 8 — Discoverability (`/athletes` directory)
Closes the biggest gap vs UGC Tank competitors. Without discovery, NIL Card is just a manually shared link.

**Todo:**
- [ ] New page: `app/athletes/page.tsx` — server component, fetches all profiles
- [ ] Grid of athlete cards: photo/initials, name, sport, school, division, total followers
- [ ] Each card links to `/profile/[username]`
- [ ] Client-side filters: sport, division
- [ ] Client-side search by name
- [ ] Add directory CTA to landing page hero pointing to `/athletes`
- [ ] DB: all data already exists in `profiles` table — no schema changes needed

## Phase 9 — Athlete Engagement Features

**Todo:**
1. **Availability toggle** — `is_available` column already in DB; add toggle to edit form + display badge on profile and directory cards
2. **Profile view counter** — add `view_count` int column to `profiles` table; increment on server component load; display on athlete's own profile only
3. **Contact request inbox** — store contact form submissions in a `contact_requests` table (profile_id, sender_email, subject, message, created_at); show count badge on edit profile button

## Phase 10 — Brand Accounts (Future)

**Schema to plan for:**
- `brands` table: id, email, company_name, website, created_at
- `opportunities` table: brand posts NIL deal briefs; athletes apply
- Brand dashboard: browse athletes, save favorites, post opportunities
- Match scoring: filter athletes by sport/division/follower range vs opportunity requirements
- Separate brand signup/login flow

---

## Phase 13 — Enhanced Athlete Stats (Media Kit)

Give athletes the stats that actually close deals with local businesses. Businesses think in impressions, demographics, and ROI — not raw follower counts.

**New fields to add (all manual input for now, automated in Phase 14):**
- `posts_per_month` — int, how often athlete posts
- `audience_city` — text, primary audience location (e.g. "Cincinnati, OH")
- `audience_age_range` — dropdown: "Mostly 18–24", "Mostly 25–34", "Mostly 35+"
- `follower_growth` — float, % growth last 30 days (manually entered)

**Computed field (no DB column needed):**
- `estimated_monthly_impressions` = `avg_views × posts_per_month` — calculated client-side on the card

**DB changes:**
- Add 4 columns to `profiles` table: `posts_per_month` (int4), `audience_city` (text), `audience_age_range` (text), `follower_growth` (float4)
- No new tables, no junction tables, no RLS changes needed

**Form changes (`components/ProfileForm.tsx`):**
- Add new "Audience Stats" section to the front-of-card form
- `posts_per_month` — number input
- `audience_city` — text input (e.g. "Cincinnati, OH")
- `audience_age_range` — dropdown (Mostly 18–24 / Mostly 25–34 / Mostly 35+)
- `follower_growth` — number input with % label

**Card display (`app/profile/[username]/FlippableCard.tsx`):**
- Add a "Media Kit Stats" section to the front card below existing stats grid
- Show: Estimated Monthly Impressions, Audience Location, Audience Age, Growth Rate
- Estimated impressions calculated as `avg_views × posts_per_month` (show as "~X impressions/month")
- Color-coded growth badge: green if positive, red if negative

**Edit/create pages:**
- Pass new fields through existing payload pattern
- UPDATE `profiles` with new columns on save

**Edge cases:**
- All 4 fields optional — don't show Media Kit section on card if none are filled in
- `follower_growth` can be negative — handle negative display gracefully
- `estimated_monthly_impressions` only shows if both `avg_views` and `posts_per_month` are set

---

## Future Ideas (Backlog)

- **Stat Calculator (Profile Form)** — break engagement rate and avg views inputs into sub-fields that calculate automatically. Engagement rate: athlete enters total likes + comments + post count → app computes rate. Avg views: athlete enters views from last N posts → app averages them. Shows result live as they type. Removes friction and improves data quality — athletes currently don't know how to calculate these.

- **Seed Test Users** — script that creates synthetic profiles via Supabase admin API covering edge cases (null stats, full back-of-card, missing social links). Run before every release to catch regressions.

- **Spec Agent** — `scripts/spec.ts` takes a feature description as CLI arg, reads codebase context, outputs a structured spec (DB changes, API routes, components, edge cases) before any code is written.

- **Build Check Agent** — `scripts/build-check.ts` runs `npm run build`, sends failures to Claude for plain-English explanation of what broke and where to fix it.

- **Playwright E2E Testing** — spin up real browser at different viewport sizes, capture screenshots, send to Claude vision API to describe what looks broken.

- **Shared SocialIcon Component** — extract Instagram, TikTok, X SVG logos into `components/SocialIcon.tsx` with a `platform` prop. Currently copy-pasted in profile view and marketplace components.

- **AI Match Score + Estimated Reach (Marketplace Modal)** — replace "coming soon" pills with real scoring. Match Score: interest overlap, audience age match, engagement rate, local relevance. Estimated Reach: avg views breakdown by platform + audience overlap pill. Defer until after Phase 8; build stub UI first.

- **AI Outreach Assistant** — when athletes view their own profile, provide AI-generated DM/message suggestions for reaching out to brands (tone, structure, personalization tips).

- **Platform Stats Automation (Phyllo → Meta API)** — use Phyllo (phyllo.io) as the first integration layer for Instagram + TikTok stats (followers, views, engagement, posts). Phyllo handles OAuth and data normalization across platforms — just call their API. Once traction justifies it, migrate to Meta's Graph API directly and swap out Phyllo calls without touching the frontend. Phyllo is purpose-built for NIL/creator economy apps.

- **Landing Page Redesign** — better hero section, social proof, feature highlights, two-pathway CTAs (For Athletes / For Brands). User will provide layout direction when ready.

- **User Type Selection (Athlete vs Brand)** — on signup, ask "Are you an athlete or a brand?" to route into different onboarding flows. Requires `user_type` field and separate dashboards.

- **Identity Verification** — university email (.edu), social media OAuth, or brand domain email. Adds trust signals — verified badge currently shown but not earned.

- **Marketplace Load More** — Google Places returns max 20 results with `nextPageToken`. Add "Load More" button that fetches next page and appends to grid.

- **AI-Powered Marketplace Search** — use athlete profile data to generate personalized business suggestions via Claude API instead of manual type/location input.

- **Marketplace UI Polish** — hero search bar, loading skeleton cards, result count, empty website state, gradient overlay on photos.

- **Google OAuth for Brands** — when brand accounts are built (Phase 14), add Google OAuth sign-in.
