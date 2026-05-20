# PRD: Brand Landing Page — v3 Design Overhaul

## Overview

Phase 3 of the `/for-brands` page. Builds on v2 (floating pill nav, stacked card hero). This PRD introduces five new components and a full hero redesign based on v0 iterations in `design-refs/for-brands-v3/`.

**Key changes:**
1. **Hero redesign** — centered layout, animated gradient background with floating blobs, grid pattern overlay. `AthleteCardRow` replaces `HeroAthleteStack` and sits below the CTA form.
2. **HeroAthleteCards** — 4 flippable athlete cards in a fan spread. Front: profile stats. Back: AI match score, demographics, sample content, awards.
3. **UniversityLogoBar** — horizontally scrolling university chips with gradient fade edges.
4. **InteractiveDemo** — business type picker + simulated AI matching, shows matched athletes with % scores.
5. **LiveFeed** — cycling list of "businesses just joined" with live ping indicator.
6. **HowItWorks redesign** — connector lines between steps, gradient icon rings, step number labels.

---

## File Plan

| File | Action | Description |
|------|--------|-------------|
| `app/globals.css` | **Update** | Add keyframes + CSS utilities for card flip and scroll animation |
| `components/HeroAthleteCards.tsx` | **Create** | 4-card flippable fan layout — replaces HeroAthleteStack |
| `components/UniversityLogoBar.tsx` | **Create** | Scrolling university chips with fade edges |
| `components/InteractiveDemo.tsx` | **Create** | Business type selector + AI match simulation |
| `components/LiveFeed.tsx` | **Create** | Cycling live signup feed |
| `app/for-brands/page.tsx` | **Update** | New hero layout, swap all components, add new sections |

---

## Design Rules (unchanged)

- Background: `#08090a` hardcoded — never follows system theme
- Accent: `from-violet-600 to-blue-500` only
- Muted text: `text-white/40` for subheadings, `text-white/30` for fine print
- Surfaces: `bg-zinc-900` cards, `bg-zinc-800` inputs, `border-zinc-800` borders
- Icons: lucide-react only
- No shadcn/ui — replace any `Button`/`Input` imports with plain Tailwind elements
- Replace shadcn CSS vars: `text-foreground` → `text-white`, `text-muted-foreground` → `text-white/40`, `bg-card` → `bg-zinc-900`, `border-border` → `border-zinc-800`

---

## Step 1 — globals.css: CSS Utilities and Keyframes

**File:** `app/globals.css`

Add the following to the existing file. Do not remove any existing content.

### Keyframes needed

```css
/* University logo bar scroll */
@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* Hero background blobs */
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 10px) scale(0.97); }
}
```

### Tailwind v4 utilities (add via `@utility`)

```css
@utility animate-scroll {
  animation: scroll 25s linear infinite;
}

@utility animate-blob {
  animation: blob 8s ease-in-out infinite;
}

@utility animate-blob-delay-2 {
  animation: blob 8s ease-in-out infinite 2s;
}

@utility animate-blob-delay-3 {
  animation: blob 8s ease-in-out infinite 4s;
}

/* 3D card flip utilities */
@utility perspective-1000 {
  perspective: 1000px;
}

@utility transform-style-3d {
  transform-style: preserve-3d;
}

@utility backface-hidden {
  backface-visibility: hidden;
}
```

---

## Step 2 — HeroAthleteCards.tsx

**File:** `components/HeroAthleteCards.tsx`

**Reference:** `design-refs/for-brands-v3/landing-page-design (1)/components/athlete-card-stack.tsx`

Use the v3 reference almost verbatim with these changes:

### Keep from v3 exactly:
- `AthleteData` interface (including `aiMatchScore`, `matchReasons`, `videos`, `awards`, `demographics`)
- `athletes` array — all 4 athletes with Unsplash URLs
- `cardPositions` array: `[{ x: -180, y: 40, rotate: -8, scale: 0.9, zIndex: 1 }, { x: -60, y: 15, rotate: -3, scale: 0.95, zIndex: 2 }, { x: 60, y: 15, rotate: 3, scale: 0.95, zIndex: 2 }, { x: 180, y: 40, rotate: 8, scale: 0.9, zIndex: 1 }]`
- `AthleteCardFront` — all classes exactly, card content structure
- `AthleteCardBack` — AI match score bar, demographics grid, video thumbnails, awards list
- `AthleteCard` — `useState(isFlipped)`, click to flip, `perspective-1000`, `transform-style-3d`, `w-56 h-72`
- `AthleteCardRow` — `relative w-full h-[340px]`, glow behind stack, cards positioned via inline styles
- Stack glow: `absolute w-[500px] h-[200px] bg-gradient-to-r from-violet-600/10 via-blue-500/15 to-violet-600/10 rounded-full blur-3xl`
- `isCenter` logic: `index === 1 || index === 2` for center cards

### Change from v3:
- Remove `import { Button } from "@/components/ui/button"` — replace pitch button with:
  ```tsx
  <button className="w-full mt-1 h-8 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-medium rounded-lg hover:from-violet-700 hover:to-blue-600 transition-all flex items-center justify-center gap-1">
    Pitch this athlete <ArrowRight className="w-3 h-3" />
  </button>
  ```
  Import `ArrowRight` from `lucide-react`.
- Add `"use client"` at top
- Export as `export default function HeroAthleteCards()` wrapping `AthleteCardRow` in a `<div className="w-full overflow-x-auto pb-4">`
- Add `crossOrigin="anonymous"` to all `next/image` instances (already in v3, just confirm)

---

## Step 3 — UniversityLogoBar.tsx

**File:** `components/UniversityLogoBar.tsx`

**Reference:** `design-refs/for-brands-v3/landing-page-design (1)/components/university-logos.tsx`

### Keep from v3 exactly:
- `universities` array — all 8 schools (UC, OSU, UK, UL, IU, XU, MU, UD) with full names
- Scroll container structure: outer `relative overflow-hidden`, left/right gradient overlays, inner `flex animate-scroll gap-12`
- Double the array (`[...universities, ...universities]`) for seamless loop
- Chip style: `flex-shrink-0 flex items-center justify-center h-12 px-6 rounded-lg border border-zinc-800/50 bg-zinc-900/30`
- Abbr text: `text-lg font-bold text-zinc-400 tracking-wide`
- Full name text: `ml-2 text-sm text-zinc-600 hidden sm:inline`
- Gradient fade: left `absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#08090a] to-transparent z-10`, right same with `bg-gradient-to-l`

### Change from v3:
- Background: `bg-[#08090a]` (our bg, not `#09090b`)
- Label: `text-center text-sm font-medium uppercase tracking-wider text-white/30 mb-8`
- Add hover-to-pause: wrap scroll div in a parent with `group` class, add `group-hover:[animation-play-state:paused]` to the scrolling div
- Export as `export default function UniversityLogoBar()`
- Add `"use client"` at top

---

## Step 4 — InteractiveDemo.tsx

**File:** `components/InteractiveDemo.tsx`

**Reference:** `design-refs/for-brands-v3/landing-page-design (1)/components/interactive-demo.tsx`

### Keep from v3 exactly:
- `businessTypes` array (4 types with emoji icons)
- `matchedAthletes` object keyed by business type (gym, restaurant, retail, auto)
- State: `selectedBusiness`, `isMatching`, `showResults`
- `handleSelect` and `handleMatch` logic (1500ms timeout for loading state)
- Business type button grid: `grid grid-cols-2 gap-3 sm:grid-cols-4`
- Active button style: `border-violet-500 bg-violet-500/10`
- Inactive button style: `border-zinc-800 bg-zinc-900/50 hover:border-zinc-700`
- Results list: athlete row with gradient avatar, name, reason, match %, follower count
- Empty state: `MapPin` icon with placeholder text
- Section background glow: `absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl`

### Change from v3:
- Remove `import { Button } from "@/components/ui/button"`
- Replace match button with:
  ```tsx
  <button
    onClick={handleMatch}
    disabled={!selectedBusiness || isMatching}
    className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium hover:from-violet-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
  >
    {isMatching ? <><Sparkles className="h-4 w-4 animate-spin" />Finding matches...</> : <><Sparkles className="h-4 w-4" />Find My Athletes</>}
  </button>
  ```
- Replace all `text-foreground` → `text-white`, `text-muted-foreground` → `text-white/40`, `bg-zinc-900/50` stays
- Section header label: `text-sm font-medium uppercase tracking-wider text-blue-400 mb-3`
- Section heading: `text-3xl sm:text-4xl font-bold text-white`
- Demo container: `rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8`
- Export as `export default function InteractiveDemo()`
- Add `"use client"` at top

---

## Step 5 — LiveFeed.tsx

**File:** `components/LiveFeed.tsx`

**Reference:** `design-refs/for-brands-v3/landing-page-design (1)/components/live-feed.tsx`

### Keep from v3 exactly:
- `signupData` array — all 10 entries with business name, location, time
- State: `visibleItems`, `currentIndex`
- `useEffect` — init with first 3, cycle every 4000ms, prepend new item, keep 3 visible
- Fade-in for newest item: `animate-in fade-in slide-in-from-top-2` on `index === 0`
- Opacity fade: `style={{ opacity: 1 - index * 0.2 }}`
- Live ping: `animate-ping` outer + static inner in `bg-emerald-500`
- Layout: `flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8`

### Change from v3:
- Replace all `text-foreground` → `text-white`, `text-muted-foreground` → `text-white/40`
- Section background: `bg-[#08090a]` not `#09090b`
- Feed item background: `border-zinc-800/50 bg-zinc-900/30` (already correct in v3)
- Avatar ring: `bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20` (already correct)
- Export as `export default function LiveFeed()`
- Add `"use client"` at top

---

## Step 6 — app/for-brands/page.tsx

**File:** `app/for-brands/page.tsx`

**Action:** Full update. Preserve all existing sections (social proof stats, example deal, pricing, NIL vs traditional ads, early access form, bottom CTA). The changes are to the hero and the addition of new sections.

### 1. Add imports
```tsx
import HeroAthleteCards from "@/components/HeroAthleteCards"
import UniversityLogoBar from "@/components/UniversityLogoBar"
import InteractiveDemo from "@/components/InteractiveDemo"
import LiveFeed from "@/components/LiveFeed"
```
Remove: `import HeroAthleteStack from "@/components/HeroAthleteStack"`

### 2. Redesign hero section

Replace the current hero entirely:

```tsx
<section className="relative min-h-screen w-full overflow-hidden">
  {/* Animated gradient blobs */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-[#08090a] to-blue-950/20" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-blob" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-blob-delay-2" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl animate-blob-delay-3" />
  </div>

  {/* Grid pattern overlay */}
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.02]"
    style={{
      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      backgroundSize: "64px 64px",
    }}
  />

  <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12">
    {/* Centered headline */}
    <div className="text-center max-w-4xl">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
        Find athletes your customers already{" "}
        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          trust.
        </span>
      </h1>
      <p className="mt-6 mx-auto max-w-2xl text-lg text-white/40 leading-relaxed">
        NIL Card connects local businesses with college athletes who already have your audience. Authentic reach. Local. Affordable.
      </p>
    </div>

    {/* Email CTA — centered */}
    {heroStatus === "success" ? (
      <div className="mt-10 flex items-center gap-2 text-emerald-400 text-sm font-medium">
        <Check className="w-4 h-4" />
        You&apos;re on the list. We&apos;ll be in touch within 24 hours.
      </div>
    ) : (
      <form onSubmit={handleHeroSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="email"
          required
          placeholder="you@business.com"
          value={heroEmail}
          onChange={(e) => setHeroEmail(e.target.value)}
          className="h-12 w-full sm:w-72 rounded-full bg-zinc-900 border border-violet-500/50 px-5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
        <button
          type="submit"
          disabled={heroStatus === "loading"}
          className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-6 text-sm font-semibold text-white whitespace-nowrap transition-all disabled:opacity-60"
        >
          {heroStatus === "loading" ? "Sending..." : "Get early access →"}
        </button>
      </form>
    )}
    {heroStatus === "error" && <p className="mt-2 text-xs text-red-400">Something went wrong. Please try again.</p>}
    {heroStatus !== "success" && <p className="text-xs text-white/30 mt-3">Accepting 10 businesses this month.</p>}

    {/* Athlete cards row — below CTA */}
    <div className="mt-16 w-full">
      <HeroAthleteCards />
    </div>
  </div>
</section>
```

### 3. Add UniversityLogoBar after hero, before marquee
```tsx
<UniversityLogoBar />
```

### 4. Replace How It Works section

Replace the existing inline How It Works section with this updated design (keep `STEPS` data but update the render):

```tsx
<section className="relative bg-[#08090a] py-20 sm:py-28 px-4 sm:px-6">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
  <div className="relative max-w-4xl mx-auto">
    <div className="text-center mb-16">
      <p className="text-sm font-medium uppercase tracking-wider text-violet-400 mb-3">How it works</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-white">
        From search to sponsorship in{" "}
        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">minutes</span>
      </h2>
    </div>
    <div className="grid gap-8 sm:grid-cols-3">
      {STEPS.map((step, index) => (
        <div key={step.num} className="group relative">
          {index < STEPS.length - 1 && (
            <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          )}
          <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:bg-zinc-900/50">
            <span className="absolute -top-3 left-6 text-xs font-mono text-violet-400 bg-[#08090a] px-2">0{step.num}</span>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 group-hover:from-violet-600/30 group-hover:to-blue-600/30 transition-all">
              <step.icon className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-white/40">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

Also update the `STEPS` data in the component:
```tsx
const STEPS = [
  { num: 1, icon: ClipboardList, title: "Tell us what you need", desc: "Fill out a short form — sport, city, audience size, vibe. Takes 2 minutes." },
  { num: 2, icon: Users, title: "We find your match", desc: "We hand-pick athletes from our network whose audience matches your customers." },
  { num: 3, icon: Rocket, title: "Go live", desc: "Connect directly, agree on deliverables, and start seeing results." },
]
```

### 5. Add InteractiveDemo before Example Deal section
```tsx
<InteractiveDemo />
```

### 6. Add LiveFeed before Early Access form section
```tsx
<LiveFeed />
```

### 7. Page section order (final)
1. `<ForBrandsHeader />`
2. Hero (centered, animated bg, HeroAthleteCards below CTA)
3. `<UniversityLogoBar />`
4. `<SportMarquee />`
5. Social Proof Stats
6. How It Works (redesigned)
7. `<InteractiveDemo />`
8. Example Deal
9. Pricing Tiers
10. NIL vs Traditional Ads
11. `<LiveFeed />`
12. Early Access Form (`id="early-access"`)
13. Bottom CTA
14. Footer (in layout)

---

## CSS Animation Note

`animate-in`, `fade-in`, `slide-in-from-top-2`, `slide-in-from-bottom-4` used in `LiveFeed` and `InteractiveDemo` are from `tw-animate-css` which is already imported in `globals.css` via `@import "tw-animate-css"`. No additional setup needed.

---

## Success Criteria

- Hero headline is centered with animated gradient blobs and grid overlay visible
- 4 athlete cards fan out below the CTA form, clickable to flip and reveal back details
- University logo bar scrolls continuously, pauses on hover, fades at edges
- Interactive demo lets user pick business type, shows matching animation, reveals athletes
- Live feed cycles every 4 seconds with new business entries
- How It Works has connector lines and step number labels
- All sections render correctly at mobile breakpoints
- No shadcn imports anywhere in new components
