# Claude Session Context

This file tracks project progress for continuity across Claude sessions.

---

## Current Phase: 7 — Mobile & Polish

**Status:** In Progress

### Completed
- [x] Landing page (header, hero, How It Works, footer)
- [x] Signup page (styled, Supabase auth, shadcn Input/Button)
- [x] Login page (styled, Supabase auth, shadcn Input/Button)
- [x] Static athlete profile page (app/athlete/demo/page.tsx)
- [x] Profile creation form (static, shadcn UI components)
- [x] Dark mode logo swap on all pages
- [x] UI consistency fixes (gradients, footer, unused state)
- [x] Supabase schema: profiles, social_links, content_tags, deliverables, profile_content_tags, profile_deliverables
- [x] Login routing: check profile exists → route to /profile/[id] or /profile/create
- [x] Create form POST: inserts into profiles, social_links, content_tags, deliverables + junction tables
- [x] Profile view page (`/profile/[id]`): server component, fetches all data from Supabase
- [x] Dynamic social links with platform-specific styling (Instagram/TikTok/X/fallback)
- [x] Dynamic content tags from profile_content_tags junction table
- [x] Dynamic deliverables with icon mapping from iconMap object
- [x] Default profile photo fallback (initials on gradient circle when no photo)
- [x] Clickable social links (constructs full URL from username per platform)
- [x] Fixed missing foreign keys on profile_deliverables and profile_content_tags tables
- [x] Added UPDATE RLS policies on content_tags and deliverables for upsert support
- [x] CI fix: Node 20, Supabase env secrets

- [x] Contact section: ContactSection client component with modal form (app/profile/[id]/ContactSection.tsx)
- [x] Email integration: API route (/api/contact/route.ts) using Resend to send emails to athletes
- [x] Contact form: sender email, subject, message fields with replyTo support
- [x] Success toast notification with green styling and bounce animation
- [x] Fixed TypeScript build errors: Supabase join types cast with `as any` for content_tags and deliverables
- [x] Added RESEND_API_KEY to Vercel environment variables
- [x] Vercel build passing

- [x] Shared ProfileForm component (components/ProfileForm.tsx) — extracted from create page, accepts props for initial data, onSubmit, labels
- [x] Refactored create page to use ProfileForm (app/profile/create/page.tsx)
- [x] EditProfileButton component (app/profile/[id]/EditProfileButton.tsx) — auth-gated, checks user ownership via getUser()
- [x] Edit profile page (app/profile/[id]/edit/page.tsx) — fetches existing data, transforms DB→form shape, UPDATE + delete/reinsert junction rows
- [x] Header with logo + EditProfileButton on profile view page
- [x] Footer on profile view page
- [x] Fixed deliverable iconMap keys to match form names (YouTube Video, Appearance, Ambassador)
- [x] Added DELETE RLS policies on social_links, profile_content_tags, profile_deliverables

- [x] Removed debug console.log statements from login, signup, create, edit, profile view, EditProfileButton
- [x] Profile photo upload — fully working on both create and edit pages
- [x] Extracted shared Header component (components/Header.tsx) with optional children prop
- [x] Replaced inline headers across all pages with `<Header />` component
- [x] Moved shared footer to layout.tsx, removed duplicate footers from all pages
- [x] Cleaned up unused imports (Link, Image) after header/footer extraction
- [x] Added responsive classes to landing page header buttons (sm: breakpoints, whitespace-nowrap)

### Remaining (Phase 6 → carried into Phase 7)
- ~~Responsive styling~~ → Phase 7
- ~~Dark mode system preference detection~~ → Phase 7 (`next-themes`)

### Profile Photo Upload — Status ✅ Complete
- **Supabase Storage:** `profile-images` bucket created (public), RLS policies set (INSERT/UPDATE for authenticated, SELECT for public)
- **next.config.ts:** Added `images.remotePatterns` for Supabase domain ✅
- **ProfileForm (components/ProfileForm.tsx):** ✅
- **Create page:** upload → getPublicUrl → save in INSERT ✅
- **Edit page:** fully working after three bugs fixed (see session log 2026-02-23)

### Future Ideas

- **Shared SocialIcon Component:** Extract Instagram, TikTok, and X SVG logos into `components/SocialIcon.tsx` — accepts a `platform` prop and returns the correct SVG. Currently the SVGs are copy-pasted in the profile view page and will be needed in `EstReachTab` and other components. Do this during a polish pass.

- **AI Match Score + Estimated Reach (Marketplace Modal):** Replace current "coming soon" pills with two side-by-side cards inside the modal front face.
  - **Match Score (left):** Large percentage + color-coded label (Strong / Good / Low match). Score breakdown below with 4 factors shown as progress bars: Interest overlap, Audience age match, Engagement rate, Local relevance. Each factor scored 0–100%. Modeled after how Grin and CreatorIQ break down brand-side matching, flipped for the athlete's perspective.
  - **Estimated Reach (right):** "~2,000 people per post" headline based on athlete's avg views. Breakdown by platform (Instagram, TikTok, X) shown as labeled bars. "Your audience vs their customer" section showing age demographic overlap (18–24, 25–34, 35+). Bottom pill: "X% audience overlap with [Business Name]".
  - Both cards use dark card style with subtle borders. Score drives a color: green (Strong), yellow (Good), red (Low).
  - **Why not a gauge:** Gauges require reading a needle → mapping to a scale → interpreting. Number + label + bar does all three in one glance. Gauges also look dated (peaked ~2015).
  - **Why per-platform reach breakdown:** Brands care about which platform. A gym cares about Instagram/TikTok, not Twitter. Makes platform weighting scannable instantly.
  - **Why audience overlap is the killer feature:** "72% of your audience is 18–24, which matches Kingdom Fitness's customer base" is the sentence that closes a deal.
  - Screenshot reference saved at: `/dev/nil_card_cbv/matchAndReachFeature.png`
  - **Data needed:** athlete profile stats (already in DB), audience demographics (not yet collected — needs new fields on profiles table), business category (from Google Places `primaryTypeDisplayName`), athlete location vs business location for local relevance scoring.
  - **Scoring formula:** compare athlete's interest tags + audience age data against business category + Google Places data already fetched.
  - **Priority:** Defer until after Phase 8. Build stub UI first, wire up real scoring logic later.


- **Profile View Redesign (Business Card Style):** Current profile view is a long scrolling page — could get very long on mobile once back-of-card content (featured posts, awards, highlights, press articles) is added. Consider redesigning to a compact business card layout: fixed-height card that fits the screen, front/back flip animation (CSS 3D transform), front = photo + name + stats + social links, back = featured posts + awards + press. Keeps mobile experience tight and avoids scroll fatigue. Priority: after back-of-card data is wired up and displayed.
- **AI Outreach Assistant:** When athletes view their own profile, provide AI-generated suggestions for DMs and messages when reaching out to brands or sharing their profile link (tone, structure, personalization tips)
- **Local Business Marketplace:** Search engine / directory for local brands, companies, and restaurants — athletes can discover nearby businesses to pitch partnerships to, and businesses can browse athlete profiles
- **Platform API Integration (Stats Automation):** Connect to Instagram and TikTok APIs via OAuth to auto-calculate engagement rate (likes + comments / followers × 100) and avg views per post. Currently both fields are entered manually by athletes. Requires platform API approval and OAuth flows — significant complexity, defer to Phase 10+.
- **Landing Page Redesign:** Current homepage is minimal. Redesign with a more detailed, polished layout — better hero section, social proof, feature highlights, two-pathway CTAs (For Athletes / For Brands). User will provide new layout direction when ready.
- **User Type Selection (Athlete vs Brand):** On signup, ask "Are you an athlete or a brand/sponsor?" to route users into different onboarding flows. Athletes go to profile creation, brands go to a brand dashboard. This is the foundation for the dual-sided marketplace in Phase 10. Requires a `user_type` field on the auth user or a separate routing table, and separate signup flows/dashboards per type.
- **Flippable Profile Card:** Profile card animates like a traditional business card flip (CSS 3D transform). Front side = current profile view (photo, name, stats, social links). Back side = deeper stats, featured/recent posts (linked from Instagram/TikTok), press articles or media mentions. Athlete manually links featured posts and articles. Platform API integration could automate recent posts in the future.
- **Featured Posts & Media Links:** Athletes can add links to their best-performing posts or press articles on the back of their profile card. Requires a new `featured_posts` table (profile_id, url, platform, caption, created_at) and a new section in the edit form.
- **Dual-Sided Marketplace (Athlete + Brand):** Defer until after Phase 9. Athletes browse and pitch to brands; brands post opportunities and browse athletes. Requires full brand accounts, opportunities table, and user type routing. (Already captured in Phase 10 plan.)
- **Identity Verification:** Verify athletes and brands are who they claim to be. Options: university email verification (athlete signs up with .edu email), social media account linking (OAuth proves ownership of Instagram/TikTok handle), brand domain email verification. Adds trust signals to profiles — verified badge currently shown but not earned.
- **Athlete-Side Local Business Search Engine:** Athletes can search for local businesses, restaurants, and brands near them by location. App surfaces match insights — e.g. "Your audience is 60% in Nashville — here are 10 Nashville-based brands that sponsor athletes." Includes AI-generated outreach suggestions for how to contact each brand. Requires location data on profiles and a business directory data source (Google Places API or manual curation).
- **Stats Automation:** Replace manual engagement rate and avg views inputs with platform API pulls. Already documented under Platform API Integration above — consolidating here as a priority for post-Phase 10.
- **Google OAuth for Brands:** When brand accounts are built (Phase 14), add Google OAuth sign-in for brands — businesses are more likely to use a Google/work account than create a new email/password. Athletes likely use regular email signup (or .edu verification), so Google OAuth may not be necessary on the athlete side.
- **Marketplace Load More:** Google Places returns max 20 results per request with a `nextPageToken` for pagination. Add a "Load More" button to `/marketplace` that fetches the next page and appends results to the grid.
- **AI-Powered Marketplace Search:** Use athlete profile data (sport, school, follower count, content tags, engagement rate) to generate a personalized business search via Claude API. Instead of manually selecting a business type, the AI analyzes the athlete's profile and suggests the most relevant local businesses to pitch to, with tailored outreach messages for each.
- **Marketplace UI Polish:** Several improvements to make the marketplace stand out: (1) Hero search bar — bold full-width banner with gradient background and centered search inputs like Airbnb/Yelp. (2) Loading skeleton cards — animated shimmer placeholders in the grid while search is in progress. (3) Result count — show "20 results for Restaurants in Nashville" above the grid after search. (4) Empty website state — show muted "No website listed" instead of hiding the button entirely. (5) Gradient overlay on photos — subtle dark gradient at bottom of card photos so content reads cleanly over the image.

### Form ↔ DB alignment notes
- Form `school` → DB `university`
- Form social `username` → DB `url`
- `email` — pull from auth session, not form
- `graduation_year` — form sends string, DB expects int4
- Missing from form: `profile_photo_url`, `year_in_school`, `is_available`

---

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
| 13 | Stats Automation (Platform APIs) | ⬜ Planned |
| 14 | Brand Accounts + Marketplace | ⬜ Planned (after athlete side complete) |
| 15 | Landing Page Redesign | ⬜ Planned (after brand side) |

> **Priority:** Complete all athlete-side features (Phases 8–13) before building brand/marketplace features. Goal is to grow the athlete user base first.

### Phase 6 Notes
- Verify domain with Resend and replace `onboarding@resend.dev` with custom sender
- ~~Add `RESEND_API_KEY` to Vercel environment variables~~ ✅ Done
- ~~Extract shared footer into `layout.tsx`~~ ✅ Done
- ~~Extract shared header into `components/Header.tsx`~~ ✅ Done
- Add `username`/`slug` column to profiles for cleaner URLs (e.g., `/profile/theo-colosimo` instead of UUID)
- ~~Profile photo upload via Supabase Storage~~ ✅ Done
- ~~Remove debug `console.log` statements~~ ✅ Done

### Phase 7 — Mobile & Polish
NIL Card profiles are shared via DM — primary viewing is on mobile. Most impactful fix for real-world usage.

**Todo:**
- [ ] Install `next-themes`, wrap app in `ThemeProvider` in `app/layout.tsx`
- [ ] Add dark mode toggle to `components/Header.tsx`
- [ ] Mobile audit + responsive fixes: `app/profile/[id]/page.tsx` (stat grid, social links, deliverables, contact button)
- [ ] Mobile fixes: `app/page.tsx` (hero section, How It Works grid, CTA buttons)
- [ ] Mobile fixes: `components/ProfileForm.tsx` (input fields, tag pills, deliverable buttons)

**Key files:** `app/page.tsx`, `app/profile/[id]/page.tsx`, `components/ProfileForm.tsx`, `app/layout.tsx`, `components/Header.tsx`

### Phase 8 — Discoverability (`/athletes` directory)
Closes the biggest gap vs UGC Tank competitors. Without discovery, NIL Card is just a manually shared link.

**Todo:**
- [ ] New page: `app/athletes/page.tsx` — server component, fetches all profiles
- [ ] Grid of athlete cards: photo/initials, name, sport, school, division, total followers
- [ ] Each card links to `/profile/[username]`
- [ ] Client-side filters: sport, division
- [ ] Client-side search by name
- [ ] Add directory CTA to landing page hero pointing to `/athletes`
- [ ] DB: all data already exists in `profiles` table — no schema changes needed

### Phase 9 — Athlete Engagement Features
Give athletes more value beyond just sharing a link.

**Todo:**
1. **Availability toggle** — `is_available` column already in DB; add toggle to edit form + display badge on profile and directory cards
2. **Profile view counter** — add `view_count` int column to `profiles` table; increment on server component load; display on athlete's own profile only
3. **Contact request inbox** — store contact form submissions in a `contact_requests` table (profile_id, sender_email, subject, message, created_at); show count badge on edit profile button

### Phase 10 — Brand Accounts (Future)
Dual-sided marketplace like UGC Tank. Plan for it now, build later.

**Schema to plan for:**
- `brands` table: id, email, company_name, website, created_at
- `opportunities` table: brand posts NIL deal briefs; athletes apply
- Brand dashboard: browse athletes, save favorites, post opportunities
- Match scoring: filter athletes by sport/division/follower range vs opportunity requirements
- Separate brand signup/login flow

---

## Decisions & Notes

- **Branch:** Using `master` (not `main`) - may reconcile later
- **Tech:** Next.js 16, Tailwind CSS v4, Supabase, Vercel, TypeScript, Resend (email)
- **Gradients:** Using purple → blue (`from-violet-600 to-blue-500`) consistently
- **Icons:** Using lucide-react for all icons
- **Dark mode:** Full support with `dark:` variants throughout

---

## Session Log

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
- **Next up:** Build `AudienceTab` → replaced by Contact Info tab, then commit, then Phase 8

**2026-04-01**
- Privacy policy page — created `app/privacy/privacy.tsx` with HTML from Termly generator
- Fixed JSX errors: rewrote component to store raw HTML as template literal, rendered via `dangerouslySetInnerHTML` to avoid converting hundreds of `class=`/`style="..."` attributes
- Fixed UTF-8 encoding artifact (`Â` character) — stripped non-breaking space bytes (`0xC2 0xA0`) from file content
- Created `app/privacy/page.tsx` to register `/privacy` as a valid Next.js App Router route
- Stubbed `components/BusinessCard.tsx` (empty, for future use)
- **Next up:** Bottom CTA banner on homepage, then Phase 8 (`/athletes` directory)

**2026-03-30**
- Homepage redesign — major overhaul of `app/page.tsx` and new `components/NilCardPreview.tsx`
- Added auth-aware behavior to homepage: when logged in, header hides Sign In/Get Started (renders `null`), hero CTA changes to "View My Card" linking to `/profile/${profile?.username}`
- Explained Supabase session token flow: `supabase.auth.getUser()` reads stored token from localStorage/cookies on page load — no API call needed, just reads local session
- Two-column hero layout: `grid md:grid-cols-2 gap-12 items-center` — left column (headline + CTAs + social proof), right column (NilCardPreview)
- Social proof section: 4 colored avatar circles with initials (TC, JM, AS, KR) using `style={{ backgroundColor: [...][i] }}` + "Join athletes already on NIL Card" text
- Built `components/NilCardPreview.tsx` — static front-of-card preview:
  - Real photo: `/athleteDemoPhoto.jpg` with `BadgeCheck` overlay
  - Hardcoded data: Jordan Smith, Basketball, Division I, University of Cincinnati '27
  - Stats grid (purple/pink/blue icon boxes): Total Reach (20.0K), Engagement (5.4%), Avg Reach (8.0K)
  - Three social rows with real SVG logos: Instagram (gradient), TikTok (black bg), X (black bg)
  - Flip button at `absolute top-4 right-4` with glassmorphism style + `group-hover:rotate-180` animation
  - Teaser at bottom: "Flip to see awards, press & featured content"
- Marketplace teaser section added to homepage: `SAMPLE_BUSINESSES` array (4 hardcoded businesses), business card grid with emoji placeholder, rating + review count, "Pitch →" and "Browse all businesses" buttons routing to `/signup`
- Mobile CTA button fixes: changed from stacked full-width to `flex-row` with `flex-1` — buttons sit side-by-side evenly on mobile, `scale-90 md:scale-100` on NilCardPreview for mobile breathing room
- `app/signup/page.tsx` — replaced success state with routing: after signup, checks if profile exists → routes to `/profile/${username}` or `/profile/create`
- Header nav drawer (`components/Header.tsx`): hamburger menu opens side drawer with Home, Marketplace, My Profile links; Sign Out / Sign In / Get Started conditional on auth state
- Google Places marketplace (`app/marketplace/page.tsx`): auth-gated, business type selector + location input, proxies Google Places Text Search API via `/api/places/route.ts`, business card grid with photo, rating, website button
- `app/api/places/route.ts`: API proxy reads `GOOGLE_PLACES_API_KEY` from env, constructs `photoUrl` from Places photo name
- `next.config.ts`: added `places.googleapis.com` to `images.remotePatterns`
- `.gitignore`: added `.claude/` to prevent session memory from being committed
- Fixed multiple bugs during session: wrong href using literal string instead of template literal, logic inversion on auth ternary, missing JSX fragment wrapper, `<div></div>` instead of `null`, invalid `md:scale-80` class → `md:scale-100`, SAMPLE_BUSINESSES typos, marketplace grid structure, `business.rating` shown twice instead of `business.reviews`
- **Next up:** Add bottom CTA banner to homepage ("Ready to land your first deal?"), then Phase 8 (`/athletes` directory)

**2026-02-26**
- Profile view page UI redesign — moving toward circular profile card design (inspired by Figma mockups)
- Reviewed Figma concepts: bleed photo design vs circular photo design — chose circular as more practical for real athlete photos
- Removed gradient cover band (`h-32`) from profile view page, replaced `-mt-16` overlap with `pt-8`
- Consolidated 3 separate cards (profile, about, deliverables) into one unified card with section dividers
- Removed `border-t` dividers between sections — replaced with padding-only spacing (cleaner)
- Added fading gradient lines (`from-purple-500/60 via-purple-400/40 to-transparent`) next to section headings (Social Channels, About, Partnership Deliverables)
- Standardized section heading styles: `text-base font-semibold text-zinc-700 dark:text-zinc-300`
- Changed info lines under athlete name to faint violet (dark) / zinc-600 (light) with centered fading lines on both sides using `max-w-[40px] flex-1`
- Moved `BadgeCheck` verified icon from next to name → bottom-right of profile photo (overlaid), replacing green availability dot
- Athlete name bumped to `text-3xl font-bold tracking-wide`
- Experimented with Bebas Neue and DM Mono fonts — reverted, keeping Geist
- Added flip button (RotateCcw icon) to top-right of card: `absolute top-4 right-4`, glassmorphism style, `group-hover:rotate-180` animation on icon
- Fixed typo in transition class: `transition-transfrom` → `transition-transform`
- **Remaining for this session / next steps:**
  - Fix typo `transition-transfrom duration-400` → `transition-transform duration-300` on RotateCcw icon (line 73)
  - Build `FlippableCard.tsx` as a `"use client"` component
  - Move card JSX into FlippableCard, add `isFlipped` useState
  - Implement CSS 3D flip: `[perspective:1000px]` wrapper, `[transform-style:preserve-3d]` inner, `[backface-visibility:hidden]` on both faces
  - Back face: display awards, highlights, featured posts, press articles (data already fetched in page.tsx)
  - Pass all profile data as props from page.tsx to FlippableCard

**2026-02-25**
- Phase 10 (Flippable Card + Featured Posts) — started, working on ProfileForm back of card
- Created 4 new Supabase tables: `featured_posts`, `awards`, `highlights`, `press_articles` — all with RLS policies
- Added 4 new types to ProfileForm: FeaturedPost, Award, Highlight, PressArticle
- Added state variables for all 4 back of card sections
- Built back of card UI sections in ProfileForm: Featured Posts, Awards, Highlights, Press Articles
- Added "Customize back of card" / skip flow with two-button layout
- Added `fadeSlideIn` (X direction) and `fadeSlideOut` animations to `globals.css`
- Main form card slides out left, back of card sections slide in from right on click
- `isTransitioning` state drives the exit animation, `setTimeout(400ms)` triggers the swap
- Back of card is optional — athlete can skip and submit without filling it in
- Wired up `onSubmit` payload to include featuredPosts, awards, highlights, pressArticles ✅
- Updated create page to INSERT into all 4 new tables ✅
- Updated edit page to DELETE + reinsert into all 4 new tables ✅
- Edit page fetches existing back-of-card data in useEffect, passes as initial props to ProfileForm ✅
- ProfileForm accepts and initializes state from 4 new initial props ✅
- **Remaining for this phase:**
  - Build back of card UI on profile view page (`app/profile/[username]/page.tsx`) — fetch + display featured posts, awards, highlights, press articles

**2026-02-23 (continued)**
- Conducted competitive analysis: NIL Card CBV vs UGC Tank (creator marketplace)
- Identified biggest gap: no discovery — brands can't find athletes; must know URL directly
- Defined Phase 7–10 roadmap (priority order):
  - Phase 7: Mobile responsiveness + `next-themes` dark mode detection
  - Phase 8: `/athletes` directory page with grid + filters + search
  - Phase 9: Availability toggle, profile view counter, contact request inbox
  - Phase 10: Brand accounts, opportunities table, dual-sided marketplace
- Completed Phase 7:
  - Installed `next-themes`, wrapped app in ThemeProvider with system detection
  - Added sun/moon toggle to Header, grouped right with children
  - Added suppressHydrationWarning to html element
  - Updated app metadata (title + description)
  - Cleaned up EditProfileButton styling to match homepage buttons
  - ProfileForm mobile fixes: social links row stacks on mobile, stats grid, school/sport grids
  - Profile view page: bio line flex-wrap
  - Landing page: CTA buttons stack on mobile, hero padding reduced, header logo responsive
- Added future ideas: Platform API stats automation, landing page redesign, user type selection (athlete vs brand)
- Signing off — next session starts Phase 8 (`/athletes` directory)

**2026-02-23**
- Debugged and fixed profile photo upload on edit page — three separate bugs:
  1. **Storage UPDATE policy missing** — `profile-images` bucket had INSERT but no UPDATE policy; upsert on existing file returned 400. Fixed by adding UPDATE policy for authenticated users with same folder-ownership condition
  2. **Stale `profileId` closure** — profiles `.update()` used `profileId` state variable which was `""` due to stale closure; replaced with `user?.id` fetched fresh inside `handleEdit` (same pattern already used for junction table inserts)
  3. **Profiles table UPDATE RLS policy set to wrong command** — policy named "Users can update own profile" was configured as SELECT instead of UPDATE, so all app-level updates silently returned 0 rows with no error. Fixed by creating correct UPDATE policy: `auth.uid() = id` for authenticated role
- Removed debug console.log statements from edit page
- Learned: Supabase dashboard bypasses RLS (service role key) so manual edits work even when app-level updates fail; Supabase UPDATE with 0 rows matched returns `error: null` — silent failure; Storage upsert requires separate UPDATE policy in addition to INSERT; stale closures in React state vs fresh values from async calls

**2026-02-22 (continued)**
- Profile photo upload feature — mostly complete
- Created `profile-images` Supabase Storage bucket (public) with RLS policies
- Added `images.remotePatterns` to next.config.ts for Supabase domain
- Built photo upload UI in ProfileForm:
  - Hidden file input + useRef to trigger it
  - Circular preview with gradient ring (bg-gradient-to-r p-0.5 wrapper)
  - Hover overlay with Camera icon (absolute, group-hover:opacity-100)
  - Conditional rendering: profilePhotoFile → formData.profilePhotoUrl → Camera icon
  - "Upload Photo" / "Change Photo" conditional text
- Create page: upload to Storage → getPublicUrl → save in INSERT — working ✅
- Learned: useRef for hidden file inputs, URL.createObjectURL for previews, Supabase Storage upload/getPublicUrl, group hover with Tailwind, bucket names must match exactly in code

**2026-02-22**
- Phase 6: Polish & Production — started
- Removed all debug console.log statements (login, signup, create, edit, profile view, EditProfileButton)
- Extracted shared Header component (components/Header.tsx):
  - Accepts optional children prop for page-specific buttons (Sign in/Get Started on landing, EditProfileButton on profile)
  - Logo with dark mode swap, links to home
- Replaced inline headers across all 6 pages with `<Header />` component
- Moved shared footer to app/layout.tsx, removed duplicate footers from all pages
- Cleaned up unused imports (Link, Image) after extraction
- Added responsive classes to landing page (sm: breakpoints, whitespace-nowrap on hero buttons)
- Learned: React children prop for component composition, layout.tsx for shared UI across all routes

**2026-02-20**
- Phase 5: Edit Profile (PATCH) — complete
- Extracted shared ProfileForm component (components/ProfileForm.tsx):
  - Props: initialFormData, initialSocialLinks, initialTags, initialDeliverables, onSubmit, submitLabel, loadingLabel, pageTitle, pageSubtitle
  - All form state initializes from props with ?? fallback defaults
  - handleSubmit wraps onSubmit in try/catch for error display
- Refactored create page to use ProfileForm, handleCreate receives payload
- Built EditProfileButton (app/profile/[id]/EditProfileButton.tsx):
  - useEffect checks auth ownership via supabase.auth.getUser()
  - Renders Link to edit page only if user.id === profileId
- Built edit page (app/profile/[id]/edit/page.tsx):
  - useEffect: auth check + fetch profile/social_links/tags/deliverables from Supabase
  - Transform DB→form shape (university→school, url→username, int→string, null→"")
  - handleEdit: UPDATE profiles, DELETE+reinsert social_links/junction rows
  - Loading spinner with Sparkles icon while fetching
- Added header (logo + EditProfileButton) and footer to profile view page
- Fixed deliverable iconMap keys: YouTube Video, Appearance, Ambassador
- Learned: useParams() for URL path segments, useState with undefined for loading distinction, async functions inside useEffect, .update().eq() for Supabase updates, delete+reinsert pattern for junction tables, throw vs new Error

**2026-02-18**
- Built ContactSection client component (app/profile/[id]/ContactSection.tsx):
  - Typed props (ContactProps: email, name) passed from server component
  - useState hooks for isOpen, subject, message, senderEmail, showSuccess
  - Modal with backdrop, stopPropagation to prevent close on card click
  - Form: sender email input, subject input, message textarea
  - handleSend: async fetch to /api/contact POST route with JSON body
  - Success toast: fixed top-center, green styling, CircleCheck icon, animate-bounce, auto-dismiss with setTimeout
- Built API route (app/api/contact/route.ts):
  - Resend integration for sending emails
  - from: onboarding@resend.dev (test sender), replyTo: visitor's email
  - try/catch error handling, NextResponse.json responses
- Replaced static button in page.tsx with <ContactSection /> component
- Fixed TypeScript build errors: Supabase join types (content_tags, deliverables) typed as arrays but return single objects at runtime — used `as any` cast to fix
- Added RESEND_API_KEY to Vercel env vars, confirmed build passes
- Learned: React props vs state, TypeScript type definitions, mailto: limitations, email API services (Resend), fetch with POST/JSON, conditional rendering patterns, toast notifications, event propagation (stopPropagation), camelCase in SDK APIs (replyTo not reply_to), `as any` type assertion for Supabase join type mismatches

**2025-02-09 (continued)**
- Built profile view page (app/profile/[id]/page.tsx):
  - Server component (no "use client"), async function with await params
  - Fetches profiles, social_links, profile_content_tags (with join), profile_deliverables (with join)
  - Platform-specific social link styling using if/else in .map() with curly braces
  - Deliverable icon mapping using iconMap object with keyof typeof cast
  - Default profile photo: initials fallback using .split(" ").map().join("")
  - Clickable social links: constructs full URLs from username (instagram.com/, tiktok.com/@, x.com/)
- Fixed Supabase issues:
  - Missing FK on profile_deliverables (deliverable_id → deliverables.id) — added via ALTER TABLE
  - Missing FK on profile_content_tags (tag_id → content_tags.id) — added via ALTER TABLE
  - Schema cache refresh: NOTIFY pgrst, 'reload schema'
  - Added UPDATE policies on content_tags and deliverables for upsert support
  - Fixed "university" column spelling in profiles table
- Added debug console.log statements to create form handleSubmit (to remove in Phase 6)
- Learned: TypeScript keyof typeof, as keyword for type casting, target="_blank" + rel="noopener noreferrer", PostgREST schema cache, FK relationships for Supabase joins

**2025-02-09**
- Migrated signup/login to shadcn Input/Button components
- Added dark mode logo swap to signup, login, and create form headers
- Fixed UI inconsistencies (button gradient opacity, footer on create form, unused email state)
- Login routing: after auth, queries profiles table → routes to /profile/[id] or /profile/create
- Create form POST: full Supabase integration
  - Inserts into profiles (mapped form fields to DB columns)
  - Inserts social_links via .map() array transform
  - Upserts content_tags (onConflict: "name") → inserts profile_content_tags junction rows
  - Upserts deliverables → inserts profile_deliverables junction rows
  - Error handling with return on each step, redirect on success
- Learned: destructuring with renaming, optional chaining (?.), .map() for array transforms, junction tables, useState vs API responses
- Updated CLAUDE.md: Phase 3 complete, Phase 4 in progress

**2025-01-31**
- Completed athlete demo profile page (app/athlete/demo/page.tsx):
  - Header with light/dark mode logo swap (logo.png + logo-dark.png)
  - Profile photo with purple glow ring + pulsing green availability dot
  - Name with BadgeCheck verified icon
  - University line with GraduationCap icon
  - Bio line using flex layout (Junior • Men's Basketball • Division I)
  - 3-column stats grid with dark mode support
  - Social channels section (Instagram, TikTok, X) with platform styling
  - About section with bio paragraph
  - Content focus pill tags using .map() loop pattern
  - Partnership deliverables list with icons
  - Elevated CTA button with gradient + shadow glow + hover effects
  - Footer tagline
- Added modern UI effects:
  - Glassmorphism on all cards (bg-white/80 backdrop-blur-sm)
  - Hover lift animations (hover:-translate-y-1 hover:shadow-xl)
  - Pill tag hover effects (scale + color shift)
  - Smooth transitions (transition-all duration-300)
- Fixed deployment issues:
  - Added lucide-react to package.json dependencies
  - Cleared Next.js cache (.next folder) for logo updates
- Learned: React .map() pattern, Tailwind v4 gradient syntax, glassmorphism, git workflow
- Merged feat/login-page to master and deployed to Vercel

**2025-01-21**
- Completed landing page: added How It Works section and Footer
- Created signup page (app/signup/page.tsx):
  - Supabase auth integration (signUp flow)
  - Styled to match landing page (card layout, gradient button, dark mode)
  - Form validation (required fields, error handling)
  - Loading state on submit button
  - Success message when signup completes
  - Clickable logo linking to home
  - Error clears when user starts typing
- Set up Supabase: created lib/supabase.ts client, configured .env.local
- Committed and pushed to GitHub (master branch)

**2025-01-16**
- Started landing page (app/page.tsx)
- Built header: logo, Sign in link, Get Started button
- Built hero section: headline, subtext, two CTA buttons (Create Your Card, See Example)
- Color scheme: light background, gradient buttons (violet to blue)
- Still to do: How It Works section, Footer, responsive testing

**2025-01-15**
- Project scaffolded with create-next-app
- Restructured to flat directory (moved nested nil-card-cbv/ to root)
- Merged .gitignore files
- AI_CONTRACT.md and README.md preserved
- Created ci.yml for GitHub Actions (not triggering yet - needs debug)
- Deployed to Vercel successfully
- Verified local dev server works (npm run dev)

