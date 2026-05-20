# PRD: Brand Landing Page (`/for-brands`)

## Overview

A dedicated landing page for local businesses (brands/buyers) explaining the value of NIL partnerships and inviting them to get early access. This is a marketing page — no matching logic, no athlete browse, no account creation. The goal is to get businesses interested and have them reach out directly so we can manually curate the right athlete matches for them.

The page should feel premium, exclusive, and modern — closer to Linear or Vercel than a compliance tool. It is **always dark** (no light mode toggle applies here). The UI sells itself: a brand visiting the page sees real athlete stats and a pitch button before they read a single word of copy.

---

## Design Specification

### Color & Background
- **Background:** `#08090a` near-black — hardcoded, does not follow system dark/light mode
- **Hero atmospheric effect:** single subtle radial gradient centered behind the headline — violet tint at ~8% opacity (`radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)`). No loud glows or blobs.
- **Accent:** `from-violet-600 to-blue-500` gradient only — no neon, no orange, no green (except the semantic "Good match" badge which stays emerald)
- **Text:** white on dark surfaces, muted at `text-white/40` for subheadlines and labels
- **Surfaces:** `bg-zinc-900` cards/sections, `bg-zinc-800` inputs, `border-zinc-800` borders

### Typography
- **Hero headline:** `text-5xl sm:text-6xl lg:text-7xl font-bold` — two lines maximum
- **Headline style:** The key word ("athletes" or "trust") gets gradient text fill: `bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent`
- **Subheadline:** `text-base sm:text-lg text-white/40 max-w-md` — muted, beneath the headline
- **Section headings:** `text-3xl font-bold text-white`
- **No serif fonts** — use the existing system font stack

### Hero Layout
- **Split layout:** left column = headline + subheadline + email CTA, right column = athlete card mockup
- On mobile: stacked, card goes below
- Left column is left-aligned on desktop

### Hero CTA — Email Capture
- Single email input + "Get early access →" gradient pill button side by side
- Input has a **1px gradient border stroke**: `border border-violet-500/50` with focus ring `focus:ring-violet-500`
- Input background: `bg-zinc-900` 
- Button: full `bg-gradient-to-r from-violet-600 to-blue-500` pill, no outline variant
- No checkbox, no dropdown — just email + button. Minimal friction.
- On submit: POST to `/api/brand-inquiry` with just the email, show inline success message
- The detailed form lower on the page captures full info from serious leads

### Hero Right Side — Real NIL Card
Uses the existing `NilCardPreview` component (`components/NilCardPreview.tsx`) — not a custom mockup. The actual product UI is the visual. Wrapped in `<div className="dark">` to force dark variant styling against the always-dark page background.

### Animations
1. **Sport badges marquee:** A slow horizontal scrolling ticker beneath the hero. Uses CSS `@keyframes marquee` with `animation: marquee 30s linear infinite`. Four copies of the sports string for seamless loop.

---

## Page Structure

```
[ Header — dark, "I'm an Athlete" pill button, no theme toggle ]

[ Hero — dark #08090a, radial violet glow ]
  Left: headline (gradient word) + subheadline + email CTA input
  Right: NilCardPreview component (real product UI, dark mode)

[ Marquee — sport badges scrolling ticker ]

[ Social Proof Stats — 4 trust numbers in a row ]

[ How It Works — 3 steps, dark zinc-900 cards ]
  1. Tell us what you need
  2. We find your match
  3. Go live

[ Example Deal — hypothetical deal breakdown card ]

[ Pricing Tiers — Starter / Growth / Brand Partner, no dollar amounts ]

[ Why NIL vs Traditional Ads — two column comparison ]

[ Early Access Form — full detail form for serious leads ]
  Dark surface, gradient border glow on the form card
  Fields: business name, your name, email, business type, city, what you're looking for

[ Bottom CTA — athlete signup link ]
```

---

## Sections

### 1. Hero

**Headline (two lines):**
```
Find athletes your customers
already trust.
```
The word "athletes" uses gradient text fill.

**Subheadline:** "NIL Card connects local businesses with college athletes who already have your audience. Authentic reach. Local. Affordable."

**CTA:** Email input + "Get early access →" button. On submit: POST to `/api/brand-inquiry` with `{ email }`. Success: replace with "You're on the list. We'll be in touch within 24 hours."

**Scarcity line:** Below the email input, in small muted text: "Accepting 10 businesses this month." — `text-xs text-white/30 mt-2`

**Right side:** Athlete card mockup — see Design Specification above.

---

### 2. Sport Badges Marquee

Full-width dark strip (`bg-zinc-900/50 border-y border-zinc-800`) immediately below the hero.

Scrolling text: `Basketball · Football · Track & Field · Soccer · Swimming · Tennis · Lacrosse · Volleyball · Baseball · Softball · Wrestling · Golf ·` — repeating, slow scroll left.

Text style: `text-sm text-white/30 font-medium uppercase tracking-widest`

---

### 3. How It Works (3 steps)

Same 3-step structure as v1. Dark `bg-zinc-900 border border-zinc-800 rounded-2xl` cards.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Tell us what you need | Fill out a short form — sport, city, audience size, vibe. Takes 2 minutes. |
| 2 | We find your match | We hand-pick athletes from our network whose audience matches your customers. |
| 3 | Go live | Connect directly, agree on deliverables, and start seeing results. |

---

### 4. Social Proof Stats

A full-width strip of 4 trust numbers immediately after the marquee. Feels like the credibility row seen on Stripe and Linear — big number, small muted label.

**Layout:** `bg-zinc-900/50 border-y border-zinc-800 py-10`, 4 columns on desktop, 2×2 grid on mobile.

**Stats (placeholder — update as platform grows):**

| Stat | Label |
|------|-------|
| 200+ | Athletes registered |
| 15 | Sports covered |
| 8 | Universities |
| Hand-picked | Every match |

**Styling per stat:**
- Number: `text-3xl sm:text-4xl font-bold text-white`
- Label: `text-sm text-white/40 mt-1`
- Dividers between stats on desktop: `w-px h-10 bg-zinc-800` (hidden on mobile)
- Centered layout, no icons

---

### 5. Example Deal

A section that makes NIL sponsorships concrete — one hypothetical deal shown as a structured breakdown card. Tone: "Here's exactly what you'd be paying for."

**Heading:** "What a typical deal looks like"
**Subheading:** "Every partnership is different, but here's a real example of what local businesses are running."

**Card layout** (`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8`):

Left side — Athlete summary:
- Initials avatar with gradient ring: "MJ", sport "D1 Basketball · University of Cincinnati", followers "18K"
- Emerald "Good match" badge

Right side — Deal terms list:
- **Business:** Local gym, Cincinnati OH
- **Deliverables:** 2 Instagram posts · 4 Instagram stories · 1 TikTok video (per month)
- **Agreement:** 3-month partnership
- **Intro:** Direct connection within 48 hours of match

Bottom of card: muted disclaimer text — `text-xs text-white/30 mt-6` — "Deliverables and terms vary by athlete and business. Every deal is negotiated directly."

**Styling:**
- Card sits inside a `max-w-3xl mx-auto` container
- On desktop: `grid sm:grid-cols-2 gap-8` — athlete left, deal terms right
- On mobile: stacked, athlete above deal terms
- Divider between columns: `hidden sm:block w-px bg-zinc-800`
- Deal term rows use a small violet dot: `w-1.5 h-1.5 rounded-full bg-violet-500` before each line

---

### 6. Pricing Tiers

Three tiers showing what level of partnership a business can run. No dollar amounts — deliverables only. Framing is "choose your level of commitment," not a SaaS pricing table.

**Heading:** "Pick your level of commitment"
**Subheading:** "All pricing is set directly between you and the athlete. We make the intro and handle the match — you negotiate the rest."

**Tier cards** (`grid sm:grid-cols-3 gap-4`):

| Tier | Badge label | Included | Term |
|------|-------------|----------|------|
| Starter | — | 1 athlete · 2 posts + 2 stories/mo · 1 platform | 1–3 months |
| Growth | Most Popular | 2 athletes · weekly content · Instagram + TikTok | 3–6 months |
| Brand Partner | — | 4+ athletes · all platforms · event appearances | 6+ months |

**Card styling:**
- Default card: `bg-zinc-900 border border-zinc-800 rounded-2xl p-6`
- Growth (middle) card: `bg-zinc-900 border border-violet-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(124,58,237,0.10)]`
- "Most Popular" badge on Growth card: `bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-medium px-3 py-1 rounded-full`
- Tier name: `text-lg font-bold text-white`
- "Included" items: small list with violet dot prefix per item, `text-sm text-white/60`
- Term line: `text-xs text-white/30 mt-4`

Bottom of section, centered: "Not sure which fits? Just fill out the form below — we'll recommend the right fit for your business." in `text-sm text-white/40`.

---

### 7. Why NIL vs Traditional Ads

Same two-column comparison as v1 and homepage. Dark card surfaces. No changes to copy.

---

### 8. Early Access Form — Full Detail

**Heading:** "Tell us what you're looking for"
**Subheading:** "We'll hand-pick athletes that match your business and make the introduction. We're selective — every match is curated by hand."

The form card has a subtle gradient border glow: `border border-violet-500/20 shadow-[0_0_40px_rgba(124,58,237,0.08)]`

**Fields:**

| Field | Type | Required |
|-------|------|----------|
| Business name | text | yes |
| Your name | text | yes |
| Email | email | yes |
| Business type | dropdown | yes |
| City | text | yes |
| What are you looking for? | textarea | no |

**Business type options:** Restaurant, Gym & Fitness, Retail & Clothing, Supplement Store, Salon & Barbershop, Sports & Recreation, Other

**On submit:**
- POST to `/api/brand-inquiry` with all fields
- Resend email to `theo.colosimo@gmail.com`
- Subject: `New Brand Inquiry — [Business Name]`
- Success: replace form with checkmark + "We'll be in touch within 24 hours."
- Error: inline error, form preserved

---

## API Route

**File:** `app/api/brand-inquiry/route.ts` — already built in Step 1. No changes needed.

Handles both payloads:
- Hero email-only submit: `{ email }` — sends simplified email notification
- Full form submit: `{ businessName, contactName, email, businessType, city, lookingFor }` — sends full formatted email

Update route to handle both cases: if `businessName` is missing, treat as hero email capture and send a shorter notification email.

---

## Files

| File | Status | Description |
|------|--------|-------------|
| `app/for-brands/page.tsx` | **Active** — add new sections | Social proof, deal example, pricing tiers |
| `app/api/brand-inquiry/route.ts` | Done | Handles both email-only and full form payloads |
| `components/Header.tsx` | Done | `hideThemeToggle` prop added, "For Brands" in drawer nav |
| `components/NilCardPreview.tsx` | Done | Used in hero right column |

---

## Design Guidelines Summary

- Page is **always dark** — `bg-[#08090a]`, ignore system dark/light preference
- Accent: `from-violet-600 to-blue-500` only
- Icons: lucide-react only  
- Mobile: stacked single column, card below hero text, marquee still scrolls
- Tone: premium, exclusive, selective — "we curate every match by hand"
- No stock illustrations — the athlete card IS the visual

---

## Edge Cases

- Hero email submit with no email — HTML `required` handles it
- Full form missing required fields — HTML `required` + server-side 400
- Resend failure — generic error, form data preserved
- Logged-in athlete visits — page fully accessible, bottom CTA links to their profile

---

## Success Criteria

- Page live at `/for-brands`
- Radial glow visible in hero but subtle (not "gamer")
- Marquee scrolls smoothly and loops seamlessly
- NilCardPreview renders in dark mode in hero right column
- Email capture in hero works end-to-end
- Full form below works end-to-end
- Scarcity line "Accepting 10 businesses this month." visible below hero CTA
- Social proof strip shows 4 stats in a row (2×2 on mobile)
- Example deal card renders with athlete summary on left, deal terms on right
- Pricing tiers render as 3 cards; Growth card has violet border + glow
- Page looks good enough to cold-send to a real business owner
