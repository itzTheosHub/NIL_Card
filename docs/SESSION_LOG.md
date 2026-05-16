# Session Log

---

**2026-05-16**
- Decided to replace Phyllo with direct Meta (Instagram Graph API) + TikTok API — using Core Technical Solutions, LLC (uncle's LLC) for developer accounts. Waiting on approval.
- Created branch `feature/direct-social-api` off master to build new integration while keeping Phyllo intact
- Built `scripts/agents/playwright.ts` — Playwright agent that takes a bug description + target file, generates a test via Claude, runs it, and suggests a fix. Run with `npm run playwright`
- Added `playwright.config.ts` — targets `localhost:3000`, auto-starts dev server, runs chromium only
- Added `"playwright"` script to `package.json`
- Added `test-results/` and `playwright-report/` to `.gitignore`
- Fixed back button bug on `/login` — added `ArrowLeft` button calling `router.back()` (`app/login/page.tsx`)
- Fixed back button on `/signup` — same pattern (`app/signup/page.tsx`)
- Playwright e2e test written and passing: `e2e/back-button-on-login-doesnt-work.spec.ts`
- Priorities from investor (uncle): buyer landing page, direct social API, Playwright for all bugs, AWS+Terraform later

---

**2026-05-02 / 2026-05-03**
- Debugged and fixed full Phyllo social connect pipeline end-to-end
- Fixed `stats/route.ts`: was querying wrong table/columns — now reads from `profile_social_stats`, returns flat format matching `PhylloStatsResponse`
- Fixed `create-user/route.ts`: `.single()` → `.maybeSingle()` for new users with no profile row; added recovery when Phyllo returns `user_exists_with_external_id`
- Fixed `disconnect/route.ts`: now handles 403 `account_disconnected` as "already disconnected"; fixed DB update to use `profile_social_stats` instead of `profiles`; `.single()` → `.maybeSingle()`
- Fixed `webhook/route.ts`: wrong event names (`ENGAGEMENT.ADDED` → `CONTENTS.ADDED`, `AUDIENCE.ADDED` → `PROFILES_AUDIENCE.ADDED`); added `ACCOUNTS.DISCONNECTED` handler; `.single()` → `.maybeSingle()`; now calls `handleProfileData` + `handleEngagementData` immediately on `ACCOUNTS.CONNECTED` instead of waiting for separate events
- Fixed `lib/phyllo-api.ts`: profiles endpoint was `/social/profiles` → corrected to `/profiles`
- Moved `username` from `profiles.instagram_handle/tiktok_handle` to `profile_social_stats.username` column (cleaner schema)
- Added `username text` column to `profile_social_stats` in Supabase
- Confirmed full flow working: connect → webhook → `profile_social_stats` upsert → polling → UI shows Connected with followers + username
- Known limitation: `avg_views` and `engagement_rate` null for accounts with no posts in last 90 days (Phyllo 90-day content window)
- Instagram requires Meta Business Account for engagement data (surfaced by Phyllo SDK during OAuth)
- Wrote `docs/PRD-onboarding-flow.md` — 3-stage onboarding: basics → social connect → profile details

---

**2026-04-16**
- Fixed `create-user/route.ts`: updated import from `@/lib/supabase` (browser client) → `@/lib/supabase-server`, added `await` to `createClient()` call
- Confirmed `lib/supabase-server.ts` was already created by implement agent (uses `createServerClient` from `@supabase/ssr`, reads cookies via `next/headers`)
- Removed `work_platform_ids` hallucination from `create-user/route.ts` (re-introduced by implement agent re-run)
- Fixed PII leak: changed `name: user.email` → `name: \`user-${user.id}\`` in create-user Phyllo payload
- Added `PHYLLO_ENV=staging` to `.env.local`
- Increased implement agent `max_tokens` from 4096 → 8096 (was truncating output for large steps)
- Added constraints section to `step-5-plan.md` to guide implement agent: keep `lib/phyllo.ts` server-only, skip polling, note new env var
- Step 5 implemented: `lib/phyllo-client.ts`, `hooks/usePhylloConnect.ts`, `components/PhylloConnectSection.tsx`
- **Next up:** `npm install phyllo-connect`, add `NEXT_PUBLIC_PHYLLO_ENVIRONMENT=staging` to `.env.local`, run `npm run validate 5`, then manually integrate `PhylloConnectSection` into `ProfileForm.tsx`

---

**2026-04-13**
- Built 4 AI agents for spec-driven feature development: `scripts/agents/spec-to-code.ts`, `implement.ts`, `validate.ts`, `feature-status.ts`
- Added `spec-to-code`, `implement`, `validate`, `feature-status` scripts to `package.json`
- Created `docs/PRD-phyllo-connect.md` — full product requirements for Phyllo social connect feature
- Created `supabase/phyllo-migration.sql` — DB migration for `profile_social_stats` table and new `profiles` columns
- Ran migration in Supabase — `profile_social_stats` table created, audience columns added to `profiles`
- Added `PHYLLO_CLIENT_ID`, `PHYLLO_SECRET`, `PHYLLO_BASE_URL` to `.env.local` (sandbox mode)
- Ran `spec-to-code 3` → `implement 3` → `validate 3` for `/api/phyllo/create-user` route
- Created `lib/phyllo.ts` — shared Phyllo auth header + base URL helper
- Created `app/api/phyllo/create-user/route.ts` — idempotent, auth-gated, saves phyllo_user_id to profiles
- Fixed agent hallucination: removed `work_platform_ids` from create-user payload (not in Phyllo API spec)
- Confirmed: `products` array goes in SDK token call (step 4), not create-user call
- **Next up:** `npm run spec-to-code 4` — create-token route

---

**2026-04-08**
- Built AI review agents: `scripts/review.ts`, `scripts/mobile-check.ts`, `scripts/run-all.ts`
- Installed `@anthropic-ai/sdk`, `dotenv`, `tsx` dev dependencies
- Added `review`, `mobile-check`, `check-all` scripts to `package.json`
- Agents use Claude API to review changed files for null safety, broken JSX, TypeScript errors, mobile responsiveness
- Fixed: API routes (`/api/`) excluded from mobile check (not UI files)
- Fixed: fallback to last commit when no uncommitted changes

**2026-04-02**
- Marketplace UI polish — click anywhere on modal card to flip, `stopPropagation` on all buttons
- Added Pitch → button to grid cards, gradient style, opens modal directly to back face
- Replaced hours section in modal with tab bar (Match Score / Est. Reach / Audience)
- Built tab bar using pill/segmented control style (`bg-zinc-100 rounded-xl p-1`)
- Built `components/marketplace/MatchScoreTab.tsx` — score bar, 4 breakdown rows, "Sample data" disclaimer
- Built `components/marketplace/EstReachTab.tsx` — total reach + audience overlap tiles, per-platform bars
- Pinned Visit Website / View on Maps buttons to bottom of modal front face (flex column layout)
- Decided to replace Audience tab with Contact Info tab (audience demographics not feasible for MVP)
- Fixed Vercel build error: merged `app/privacy/privacy.tsx` content directly into `app/privacy/page.tsx`
- **Known issue:** Visit Website and Pitch buttons on grid cards slightly off-center — needs alignment fix

**2026-04-01**
- Privacy policy page — created `app/privacy/privacy.tsx` with HTML from Termly generator
- Fixed JSX errors: rewrote component to store raw HTML as template literal, rendered via `dangerouslySetInnerHTML`
- Fixed UTF-8 encoding artifact (`Â` character) — stripped non-breaking space bytes (`0xC2 0xA0`) from file content
- Created `app/privacy/page.tsx` to register `/privacy` as a valid Next.js App Router route
- Stubbed `components/BusinessCard.tsx` (empty, for future use)

**2026-03-30**
- Homepage redesign — major overhaul of `app/page.tsx` and new `components/NilCardPreview.tsx`
- Added auth-aware behavior to homepage: when logged in, header hides Sign In/Get Started, hero CTA changes to "View My Card"
- Two-column hero layout: `grid md:grid-cols-2 gap-12 items-center`
- Social proof section: 4 colored avatar circles with initials
- Built `components/NilCardPreview.tsx` — static front-of-card preview with hardcoded demo data
- Marketplace teaser section added to homepage with `SAMPLE_BUSINESSES` array
- Mobile CTA button fixes: `flex-row` with `flex-1`, `scale-90 md:scale-100` on NilCardPreview
- `app/signup/page.tsx` — replaced success state with routing after signup
- Header nav drawer (`components/Header.tsx`): hamburger menu with auth-conditional links
- Google Places marketplace (`app/marketplace/page.tsx`): auth-gated, proxies Google Places Text Search API
- `app/api/places/route.ts`: API proxy with `GOOGLE_PLACES_API_KEY`, constructs `photoUrl`
- `.gitignore`: added `.claude/` to prevent session memory from being committed

**2026-02-26**
- Profile view page UI redesign — circular profile card design
- Removed gradient cover band, consolidated 3 cards into one unified card
- Added fading gradient lines next to section headings
- Moved `BadgeCheck` icon to bottom-right of profile photo
- Added flip button (RotateCcw icon) to top-right of card

**2026-02-25**
- Phase 10 (Flippable Card + Featured Posts) — started
- Created 4 new Supabase tables: `featured_posts`, `awards`, `highlights`, `press_articles` — all with RLS policies
- Added 4 new types to ProfileForm: FeaturedPost, Award, Highlight, PressArticle
- Built back of card UI sections in ProfileForm with slide animation (`fadeSlideIn`/`fadeSlideOut`)
- Back of card is optional — athlete can skip and submit without filling it in
- Updated create + edit pages to INSERT/DELETE+reinsert all 4 new tables

**2026-02-23 (continued)**
- Competitive analysis: NIL Card CBV vs UGC Tank
- Completed Phase 7: next-themes, dark mode toggle, mobile fixes across all pages

**2026-02-23**
- Fixed profile photo upload on edit page — three bugs: missing Storage UPDATE policy, stale closure on profileId, profiles UPDATE RLS policy set to wrong command (SELECT instead of UPDATE)

**2026-02-22 (continued)**
- Profile photo upload feature complete
- Created `profile-images` Supabase Storage bucket (public) with RLS policies
- Built photo upload UI in ProfileForm with circular preview, hover overlay, conditional text

**2026-02-22**
- Phase 6: Polish & Production
- Extracted shared Header component (`components/Header.tsx`) with optional children prop
- Moved shared footer to `app/layout.tsx`
- Cleaned up all debug console.log statements

**2026-02-20**
- Phase 5: Edit Profile (PATCH) complete
- Extracted shared ProfileForm component
- Built EditProfileButton (auth-gated, checks user ownership)
- Built edit page with DB→form shape transform and delete+reinsert pattern

**2026-02-18**
- Built ContactSection client component with modal form
- Built `/api/contact/route.ts` using Resend for email delivery
- Fixed TypeScript build errors with `as any` cast for Supabase join types

**2025-02-09**
- Built profile view page (server component, fetches all data from Supabase)
- Fixed missing FKs on junction tables, schema cache refresh
- Migrated signup/login to shadcn Input/Button components
- Login routing: queries profiles table → routes to /profile/[id] or /profile/create
- Create form POST: full Supabase integration with junction tables

**2025-01-31**
- Completed athlete demo profile page (`app/athlete/demo/page.tsx`)
- Added glassmorphism, hover animations, pill tag effects

**2025-01-21**
- Completed landing page (How It Works + Footer)
- Created signup page with Supabase auth integration
- Set up Supabase client (`lib/supabase.ts`)

**2025-01-16**
- Started landing page — header, hero section, gradient buttons

**2025-01-15**
- Project scaffolded with create-next-app
- Deployed to Vercel successfully
