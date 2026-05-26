# Claude Session Context

See `docs/ROADMAP.md` for phase plan and future ideas.
See `docs/SESSION_LOG.md` for session history.

---

## Current Phase: Direct Social API Integration + Buyer Landing Page

**Status:** TikTok OAuth fully built and tested on production. Instagram OAuth not yet built.

**Phyllo:** Fully removed. Replaced with direct TikTok API (built). Instagram Graph API next.

**Domain:** `nil-card.com` (use this everywhere, not `nilcard.vercel.app`)

**Next up:**
1. Record TikTok demo video and submit for app review (unlock production scopes)
2. Build Instagram OAuth (Steps 3–4 of `docs/PRD-social-connect.md`)
3. Build verified badge on FlippableCard (Step 8 of PRD)
4. 3-stage onboarding flow — PRD at `docs/PRD-onboarding-flow.md`, not started
5. Marketplace (`/marketplace`) — built but basic, needs improvement

**Completed this session (2026-05-24/26):**
- Removed all Phyllo code (routes, hooks, libs, PhylloConnectSection component)
- Built TikTok OAuth with PKCE S256, AES-256-GCM token encryption, CSRF httpOnly cookie
- DB migration: token columns on `profiles`, `is_verified` + `last_synced_at` + `likes_count` on `profile_social_stats`
- Onboarding connect page (`/onboarding/connect`) — new users land here after signup
- Connected accounts settings page (`/settings/connected-accounts`) — token health display
- `ConnectedAccountsCard` component — connect/disconnect/refresh per platform, stats grid
- `/api/social/refresh` — re-fetches stats, auto-rotates expired tokens
- `/api/social/disconnect` — clears tokens, marks stats unverified
- Wired ConnectedAccountsCard into ProfileForm (edit mode only)
- "Connected Accounts" link in hamburger menu
- Fixed PKCE error (TikTok requires code_challenge + code_challenge_method=S256)
- Fixed sandbox stats fallback: retries with basic fields if user.info.stats blocked
- Fixed `/profile/create` redirecting existing users to their edit page
- Fixed Suspense boundary for useSearchParams on onboarding page
- TikTok tested end-to-end on production: connected=true, 63 followers showing

**TikTok sandbox notes:**
- `user.info.stats` (likes_count, video_count) blocked in sandbox — basic profile fields work
- Access tokens expire in ~24hrs in sandbox; refresh route auto-rotates on rejection
- `likes_count` stored in DB, shows in card — will be 0 until app approved for production

**Completed this session (2026-05-20, continued):**
- TikTok sandbox app configured: Login Kit added, scopes (user.info.basic, user.info.profile, user.info.stats, video.list), Web redirect URI set to `https://nil-card.com/api/auth/tiktok/callback`, description saved, Terms/Privacy URLs set
- Privacy page rewritten to dark theme with all 13 original Termly sections
- TikTok app submission doc saved at `docs/tiktok-app-submission.md`
- Uncle reviewed UI: loved it. GTM recommendation: biggest ROI is cold outreach to businesses/agencies (demand side first)

**Completed this session (2026-05-20):**
- Favicon: `app/icon.svg` — exact header card icon with glow filter, correct coordinates and aspect ratio
- Tab title: `NIL-Card` default, profile pages show `[Full Name] | NIL-Card` via `generateMetadata`
- Site meta description updated to cover both athletes and brands
- Open Graph + Twitter card metadata wired up in `layout.tsx` — image expected at `public/og-image.png` (1200×630px, not yet created)
- Profile page: `?ref=home` on See an Example link shows "← Back" button in header via `searchParams`
- ContactSection: full dark theme rewrite — `bg-zinc-900` modal, `inputClasses` inputs, X close button, sending state, emerald pill success toast, button text shortened to "Contact for Partnerships"
- Header/ForBrandsHeader: pill nav switched to `absolute left-1/2 -translate-x-1/2` for true centering; `whitespace-nowrap` added; mobile text shortened to "Athlete"/"Business" via `hidden sm:inline`; hamburger normalized to `p-2`; logo wrapped in `flex-1`, right side `flex-1 justify-end`
- ProfileActions: "Edit Profile" shortened to "Edit"
- For-brands apply form: budget dropdown (`$50–$100` through `$2,500+`) with subtext, deliverable pill tags (10 options), API route updated to include both in inquiry email
- GitHub remote updated to `https://github.com/itzTheosHub/NIL_Card.git`
- `/athlete/demo` page is orphaned (not linked anywhere) — candidate for deletion

**Completed this session (2026-05-19):**
- Profile page: ambient blobs, pill nav hidden (`hidePillNav`), click-anywhere-to-flip FlippableCard, outer card glow via `boxShadow`
- `ProfileActions` component: Edit Profile + Copy Link buttons in header, visible to profile owner only
- Header: fixed `{children}` rendering — prop was accepted but never rendered
- `ProfileForm` full dark rewrite: removed shadcn + Phyllo, dark inputs (`bg-zinc-800`), sport/grad year dropdowns (2026–2031), bio textarea (400 char), stats validation, platform auto-detect, cancel/save top bar, clickable step indicator
- ProfileForm fixes: caption field for featured posts, Awards/Highlights descriptions as textareas, X/Twitter in platform toggle, press article placeholder improved, division uses `inputClasses`, total followers height aligned, cancel link safe for new users, domain updated to `nil-card.com`

---

## Tech Stack

- **Framework:** Next.js 16, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (auth, DB, storage)
- **Email:** Resend (`onboarding@resend.dev` — needs custom domain)
- **Deploy:** Vercel
- **Branch:** `feature/direct-social-api` (active), `master` (stable)
- **GitHub remote:** `https://github.com/itzTheosHub/NIL_Card.git` (renamed from NIL_Card_CBV)

---

## Key Patterns

- **Gradient:** `from-violet-600 to-blue-500` (purple → blue) — used consistently
- **Icons:** lucide-react only
- **Dark mode:** Full support with `dark:` variants throughout
- **Supabase bucket:** `profile-images` (NOT `profile-photos`)
- **Profile URLs:** `/profile/[username]` (slug-based, not UUID)
- **Junction table updates:** delete + reinsert pattern (not upsert)
- **Form → DB field mapping:** `school` → `university`, social `username` → `url`, `graduation_year` string → int4

---

## Known Issues & Tools Built

| Issue | Root Cause | Solution | File |
|-------|-----------|----------|------|
| TikTok/Instagram "Copy Link" generates short URLs that can't be parsed for embed ID | Short URLs redirect to full URLs but parser needs `/video/` or `/p/` in path | Built `/api/resolve-url` — server-side `fetch` with `redirect: "follow"`; called `onBlur` of featured post URL input | `app/api/resolve-url/route.ts`, `components/ProfileForm.tsx` |
| Athlete names not showing on desktop HeroAthleteCards | `background-clip: padding-box` technique on parent div caused text rendering failure inside 3D compositing context (`preserve-3d`) | Replaced with `bg-zinc-900` + `boxShadow: "inset 0 0 0 1.5px rgba(139,92,246,0.5)"` for the gradient border — do NOT use background-clip inside preserve-3d containers | `components/HeroAthleteCards.tsx` |
| New user profile crashes with `Cannot read properties of null (reading 'toString')` | `total_followers`, `avg_views`, `engagement_rate` nullable in DB but typed as `number` | Added `num == null` guard to `formatNumber`/`formatEngagement` in `FlippableCard.tsx`, returning `"—"` | `app/profile/[username]/FlippableCard.tsx` |
| Password reset "Auth session missing" error | Recovery token lives in URL hash — Supabase needs to detect it before `updateUser` works | Added `supabase.auth.onAuthStateChange` listener for `PASSWORD_RECOVERY` event in `useEffect` | `app/reset-password/page.tsx` |
| Double eye icon in Chrome on password fields | Chrome injects native password reveal icon on top of custom one | Added `[&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden` to Input className | `app/login/page.tsx`, `app/reset-password/page.tsx` |
| Header pill nav crowding / off-center on mobile | Logo SVG is 165px wide — overlaps with absolutely centered pill on small screens | Logo uses `w-[110px] md:w-[165px] h-auto` CSS on SVG (viewBox scales everything proportionally). Pill uses `mx-auto` on mobile (in flex flow, centers in remaining space) and `md:absolute md:left-1/2 md:-translate-x-1/2` on desktop. Pill links: `px-2 md:px-4 text-xs md:text-sm` | `components/Header.tsx`, `components/ForBrandsHeader.tsx` |
| Pill nav pills switching sides when navigating between pages | `ForBrandsHeader` had Business on left, Athlete on right — opposite of `Header`. Fixed by making both headers use `usePathname` for active state with Athlete always left, Business always right | Both headers now render Athlete first (left), Business second (right). Active pill determined by `pathname === "/"` vs `pathname.startsWith("/for-brands")` | `components/Header.tsx`, `components/ForBrandsHeader.tsx` |
| Profile page ambient blobs invisible | `-z-10` on the `fixed` blob container renders behind opaque `bg-[#08090a]` body background | Remove `-z-10` entirely — use `pointer-events-none fixed inset-0 overflow-hidden` with no z-index, matching login/signup pattern | `app/profile/[username]/page.tsx` |
| Header `children` prop silently dropped | Header accepted `children` but the JSX never rendered it | Added `{children}` to the right-side div before the hamburger button | `components/Header.tsx` |
| Stats layout shift on social link follower hint | Hint text appearing/disappearing changed row height; `items-end` caused bottom-alignment drift | Always-rendered `<p className="text-xs mt-1 h-4">` reserves space; changed flex row to `items-start` | `components/ProfileForm.tsx` |
| Pill nav overlapping logo on mobile / text wrapping | `mx-auto` doesn't truly center when logo and hamburger have different widths; pill too wide for mobile | Switched to `absolute left-1/2 -translate-x-1/2` on all screen sizes; added `whitespace-nowrap`; pill text shortened to "Athlete"/"Business" on mobile (`hidden sm:inline` hides "I'm an "/"I'm a ") | `components/Header.tsx`, `components/ForBrandsHeader.tsx` |
| Hamburger larger on homepage than for-brands page | `Header.tsx` used `py-2 px-3` vs `ForBrandsHeader.tsx` `p-2` | Changed Header.tsx hamburger to `p-2` to match | `components/Header.tsx` |

---

## AI Review Agents (`scripts/`)

- `npm run review` — code review: null safety, broken JSX, TypeScript errors, React patterns
- `npm run mobile-check` — Tailwind mobile responsiveness audit
- `npm run check-all` — runs all agents sequentially
- `npm run playwright "<bug description>" <target-file>` — generates Playwright test, runs it, suggests fix
- API routes (`/api/`) are excluded from mobile check (no UI to review)
- Agents fall back to last commit when no uncommitted changes exist
- Playwright tests live in `e2e/`, config at `playwright.config.ts`
