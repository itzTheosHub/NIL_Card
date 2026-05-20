# PRD: Brand Landing Page — Design Overhaul (v2)

## Overview

Phase 2 of the `/for-brands` page. Content sections from v1 are complete. This PRD covers three design improvements identified after v0.dev exploration:

1. **ForBrandsHeader** — new floating pill glassmorphism navbar, for-brands page only
2. **HeroAthleteStack** — stacked athlete cards replacing `NilCardPreview` in the hero right column
3. **Page-wide design tightening** — typography, spacing, section rhythm improvements throughout

Palette stays violet/blue (`from-violet-600 to-blue-500`). The goal is to dramatically improve visual quality so the page can be cold-sent to a real business owner.

---

## File Plan

| File | Action | Description |
|------|--------|-------------|
| `components/ForBrandsHeader.tsx` | **Create** | Floating pill glassmorphism nav, for-brands only |
| `components/HeroAthleteStack.tsx` | **Create** | Stacked athlete cards hero visual |
| `app/for-brands/page.tsx` | **Update** | Swap in new header + hero stack, tighten spacing |

---

## Component 1 — ForBrandsHeader

**File:** `components/ForBrandsHeader.tsx`

A floating pill navbar fixed to the top of the page. Replaces the `<div className="dark"><Header hideThemeToggle>` block currently in `app/for-brands/page.tsx`.

### Reference implementation
The v0.dev output at `homepage-redesign/landing-page-design/components/navbar.tsx` is the direct base. Use it almost verbatim with these changes:

**Keep from v0 exactly:**
- Outer wrapper: `fixed top-4 left-0 right-0 z-50 flex justify-center px-4`
- Pill: `flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-2 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.08),0_0_40px_rgba(59,130,246,0.05)]`
- Nav link style: `rounded-full px-4 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white`
- CTA style: `ml-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-1.5 text-sm font-medium text-white transition-all hover:from-violet-700 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]`
- Mobile: `hidden md:flex` on nav links div

**Change from v0:**
- Logo: replace the gradient circle + text with `<Image src="/logo-dark.png" alt="NIL Card" width={120} height={60} className="h-8 w-auto" />` (import `Image` from `next/image`, `Link` from `next/link`)
- Nav hrefs: `"/brands"` → `"/for-brands"`
- "For Brands" link gets `text-white font-medium` (active state), not `text-zinc-400`
- CTA href: `"/athletes"` → `"/"`
- No hamburger, no drawer, no theme toggle

### Page offset
Add `pt-20` to the outermost wrapper div in `app/for-brands/page.tsx`.

---

## Component 2 — HeroAthleteStack

**File:** `components/HeroAthleteStack.tsx`

Three overlapping athlete cards fanned slightly — the front card is fully visible, the two behind peek out at rotations. Replaces `<NilCardPreview />` in the hero right column.

### Reference implementation
The v0.dev output at `homepage-redesign/landing-page-design/components/athlete-card-stack.tsx` is the direct base. The card code inside it already uses our exact zinc/white/emerald classes. Use it with these changes:

**Keep from v0 exactly:**
- `AthleteData` interface and `athletes` array (same data, same Unsplash URLs)
- Card wrapper: `relative w-72 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center gap-4 shadow-2xl shadow-black/50`
- Avatar gradient ring: `w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 p-[2.5px]` with inner `bg-zinc-900 overflow-hidden` div wrapping `next/image` with `crossOrigin="anonymous"`
- Name: `text-lg font-bold text-white`
- Sport/school: `text-sm text-white/40`
- Stats row with `w-px h-8 bg-zinc-800` dividers, `text-base font-bold text-white` values, `text-xs text-white/40` labels
- Good match badge: `inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium px-3 py-1 rounded-full`
- Stack glow: `absolute inset-0 translate-x-8 translate-y-8 rounded-3xl bg-gradient-to-br from-violet-600/20 via-blue-500/10 to-transparent blur-3xl`
- Stack container: `relative w-[340px] h-[520px]`
- Card positioning (inline styles): back `top:80px left:40px rotate(6deg) scale(0.92) opacity:0.7 z-index:1`, middle `top:40px left:20px rotate(-6deg) scale(0.96) opacity:0.85 z-index:2`, front `top:0 left:0 rotate(0) z-index:3`

**Change from v0:**
- Remove shadcn `Button` import entirely — replace the front card's pitch button with a plain element: `<button className="w-full mt-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-xl py-2.5 hover:from-violet-700 hover:to-blue-600 transition-all">Pitch this athlete →</button>`
- Export as default: `export default function HeroAthleteStack()` (not named export)
- Add `"use client"` at top — needed for future animation
- Mobile: wrap the stack in `<div className="hidden sm:block">` so it doesn't overflow on small screens — on mobile the hero is single column anyway

### Fade-in animation on front card
Add `useState(false)` + `useEffect` to trigger after mount. Front card gets `transition-all duration-[600ms] ease-out` with `opacity-0 translate-x-4` → `opacity-100 translate-x-0` after 200ms delay.

---

## Page Updates — app/for-brands/page.tsx

### 1. Replace header block
Remove:
```tsx
<div className="dark">
  <Header hideThemeToggle>
    <Link href="/" ...>I'm an Athlete</Link>
  </Header>
</div>
```
Replace with:
```tsx
<ForBrandsHeader />
```
Add `import ForBrandsHeader from "@/components/ForBrandsHeader"` to imports.
Remove `import Header from "@/components/Header"` — no longer used on this page.

### 2. Replace hero right column
Remove:
```tsx
<div className="dark w-full max-w-sm">
  <NilCardPreview />
</div>
```
Replace with:
```tsx
<HeroAthleteStack />
```
Add `import HeroAthleteStack from "@/components/HeroAthleteStack"` to imports.
Remove `import NilCardPreview from "@/components/NilCardPreview"` — no longer used on this page.

### 3. Add top padding for fixed navbar
The outermost `<div className="flex min-h-screen flex-col bg-[#08090a] text-white">` — add `pt-16` or `pt-20` so page content does not sit underneath the fixed pill nav.

### 4. Typography and spacing tightening
- Hero section: increase vertical padding to `py-24 sm:py-32 lg:py-40`
- Section headings: ensure all use `text-3xl sm:text-4xl font-bold` (bump from `text-3xl`)
- Section subheadings: `text-white/40 mt-3 text-base max-w-xl mx-auto` — add `max-w-xl` cap where missing
- How It Works cards: add `hover:border-zinc-700 transition` for subtle hover state
- Social proof stats: center-align on mobile, left-align on desktop per existing spec

---

## Design Rules (unchanged from v1)

- Background: `#08090a` hardcoded — never follows system theme
- Accent: `from-violet-600 to-blue-500` only — no other gradients
- Muted text: `text-white/40` for subheadings, `text-white/30` for fine print
- Surfaces: `bg-zinc-900` cards, `bg-zinc-800` inputs, `border-zinc-800` borders
- Icons: lucide-react only
- No serif fonts

---

## Success Criteria

- Floating pill navbar visible at top of `/for-brands`, does not appear on other pages
- Pill has glass/blur effect, collapses to logo + CTA on mobile
- Three stacked athlete cards visible in hero right column
- Front card has pitch button and fade-in animation on load
- Back cards are rotated and slightly faded behind the front
- Page content does not overlap the fixed navbar
- Typography and section spacing feel noticeably tighter and more premium than v1
