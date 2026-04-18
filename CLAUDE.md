# Claude Session Context

See `docs/ROADMAP.md` for phase plan and future ideas.
See `docs/SESSION_LOG.md` for session history.

---

## Current Phase: 8 — Discoverability (`/athletes` directory)

**Status:** In Progress

**Next up:** `npm install phyllo-connect`, add `NEXT_PUBLIC_PHYLLO_ENVIRONMENT=staging` to `.env.local`, run `npm run validate 5`, then integrate `PhylloConnectSection` into `ProfileForm.tsx`.

---

## Tech Stack

- **Framework:** Next.js 16, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (auth, DB, storage)
- **Email:** Resend (`onboarding@resend.dev` — needs custom domain)
- **Deploy:** Vercel
- **Branch:** `master`

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
| New user profile crashes with `Cannot read properties of null (reading 'toString')` | `total_followers`, `avg_views`, `engagement_rate` nullable in DB but typed as `number` | Added `num == null` guard to `formatNumber`/`formatEngagement` in `FlippableCard.tsx`, returning `"—"` | `app/profile/[username]/FlippableCard.tsx` |
| Password reset "Auth session missing" error | Recovery token lives in URL hash — Supabase needs to detect it before `updateUser` works | Added `supabase.auth.onAuthStateChange` listener for `PASSWORD_RECOVERY` event in `useEffect` | `app/reset-password/page.tsx` |
| Double eye icon in Chrome on password fields | Chrome injects native password reveal icon on top of custom one | Added `[&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden` to Input className | `app/login/page.tsx`, `app/reset-password/page.tsx` |

---

## AI Review Agents (`scripts/`)

- `npm run review` — code review: null safety, broken JSX, TypeScript errors, React patterns
- `npm run mobile-check` — Tailwind mobile responsiveness audit
- `npm run check-all` — runs all agents sequentially
- API routes (`/api/`) are excluded from mobile check (no UI to review)
- Agents fall back to last commit when no uncommitted changes exist
