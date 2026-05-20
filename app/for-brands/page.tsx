"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import ForBrandsHeader from "@/components/ForBrandsHeader"
import HeroAthleteCards from "@/components/HeroAthleteCards"
import UniversityLogoBar from "@/components/UniversityLogoBar"

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function ForBrandsPage() {


  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      {/* ========== HEADER ========== */}
      <ForBrandsHeader />

      {/* ========== HERO ========== */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Gradient blobs — top blobs at -top-20 so glow bleeds behind the fixed header */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-[#08090a] to-blue-950/20" />
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-10 right-0 w-[420px] h-[420px] bg-blue-500/15 rounded-full blur-[100px]" />
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

        {/* Headline + CTA */}
        <div className="relative mx-auto max-w-7xl flex flex-col items-center px-4 sm:px-6 pt-32 pb-0">
          <div className="text-center max-w-4xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Stop buying ads.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Start building fans.
              </span>
            </h1>
            <p className="mt-6 mx-auto max-w-2xl text-lg text-white/40 leading-relaxed">
              NIL Card connects your brand with college athletes who move culture in your city. Real influence. Real loyalty. Real results.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href="/for-brands/apply"
              className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-8 text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-[0_0_24px_rgba(124,58,237,0.4)] flex items-center"
            >
              Get early access →
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Accepting 50+ brands this season
            </div>
          </div>
        </div>

        {/* Athlete cards — full viewport width so the fan fills the space */}
        <div className="relative mt-16 w-full pb-16">
          <HeroAthleteCards />
        </div>
      </section>

      {/* ========== UNIVERSITY LOGO BAR ========== */}
      <UniversityLogoBar />


      {/* ========== HOW IT WORKS ========== */}
      <section className="relative bg-[#08090a] py-16 sm:py-24 lg:py-32 px-4 sm:px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-12 sm:mb-20">
            <span className="w-8 h-px bg-violet-400 inline-block" />
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">How it works</p>
          </div>

          <div className="flex flex-col gap-16 sm:gap-24 lg:gap-32">

            {/* Step 01 */}
            <div className="grid lg:grid-cols-[72px_1fr_1.3fr] gap-5 lg:gap-12 items-start lg:items-center">
              <span className="text-5xl lg:text-[96px] font-black leading-none select-none text-zinc-600">01</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="w-4 h-px bg-violet-400 inline-block" /> Brief
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Tell us what you need.</h3>
                <p className="text-white/40 leading-relaxed text-sm sm:text-base">Fill out a short form — your business type, sport preference, city, and what you&apos;re looking for. Takes 2 minutes.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-2xl">
                {/* macOS chrome */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <p className="text-xs text-white/30 uppercase tracking-widest mb-4">New Campaign</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-white/40 mb-1.5">Business Type</p>
                    <div className="rounded-lg bg-zinc-800 border border-violet-500/40 px-3 py-2.5 text-sm text-white flex items-center justify-between">
                      Gym &amp; Fitness <Check className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1.5">Sport Preference</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs px-3 py-1 rounded-full">Basketball</span>
                      <span className="bg-zinc-800 border border-zinc-700 text-white/40 text-xs px-3 py-1 rounded-full">Football</span>
                      <span className="bg-zinc-800 border border-zinc-700 text-white/40 text-xs px-3 py-1 rounded-full">Track</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1.5">Location</p>
                    <div className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-white/70">Cincinnati, OH</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="grid lg:grid-cols-[72px_1fr_1.3fr] gap-5 lg:gap-12 items-start lg:items-center">
              <span className="text-5xl lg:text-[96px] font-black leading-none select-none text-zinc-600">02</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="w-4 h-px bg-violet-400 inline-block" /> Match
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">We find your athletes.</h3>
                <p className="text-white/40 leading-relaxed text-sm sm:text-base">Our system scores every athlete in our network against your brief. Only the strongest fits get surfaced — no noise, no guesswork.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-2xl">
                {/* macOS chrome */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">NC</div>
                  <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/70 leading-relaxed">
                    Hi there! We found <span className="text-white font-semibold">3 athletes</span> that match your audience profile. Log in to review your matches.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="grid lg:grid-cols-[72px_1fr_1.3fr] gap-5 lg:gap-12 items-start lg:items-center">
              <span className="text-5xl lg:text-[96px] font-black leading-none select-none text-zinc-600">03</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="w-4 h-px bg-violet-400 inline-block" /> Review
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Review your matches.</h3>
                <p className="text-white/40 leading-relaxed text-sm sm:text-base">Each athlete has a verified profile — follower count, engagement rate, sport, and past deals. Hit Connect on the ones you want.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-2xl">
                {/* macOS chrome */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">Matches</p>
                  <span className="text-xs text-white/30">3 found</span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { initials: "MJ", name: "Marcus J.", sport: "Basketball · UC", match: 94 },
                    { initials: "AT", name: "Aaliyah T.", sport: "Soccer · OSU", match: 89 },
                  ].map((a) => (
                    <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{a.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.name}</p>
                        <p className="text-xs text-white/40 truncate">{a.sport}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex-shrink-0">{a.match}%</span>
                      <button className="text-xs font-medium text-white bg-violet-600 px-3 py-1.5 rounded-lg flex-shrink-0">Connect</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 04 */}
            <div className="grid lg:grid-cols-[72px_1fr_1.3fr] gap-5 lg:gap-12 items-start lg:items-center">
              <span className="text-5xl lg:text-[96px] font-black leading-none select-none text-zinc-600">04</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="w-4 h-px bg-violet-400 inline-block" /> Connect
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Message directly.</h3>
                <p className="text-white/40 leading-relaxed text-sm sm:text-base">Coordinate next steps in-platform. We make the intro and handle the paperwork — you run the deal.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-2xl">
                {/* macOS chrome */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">M</div>
                  <div>
                    <p className="text-sm font-medium text-white">Marcus J.</p>
                    <p className="text-xs text-emerald-400">● Online</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-end">
                    <div className="bg-violet-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] leading-relaxed">
                      Hi Marcus, we&apos;d love to partner with you for our gym opening!
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 text-white/70 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] leading-relaxed">
                      Excited to connect! Available this week for a quick call.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 05 — Coming Soon */}
            <div className="grid lg:grid-cols-[72px_1fr_1.3fr] gap-5 lg:gap-12 items-start lg:items-center opacity-50">
              <span className="text-5xl lg:text-[96px] font-black leading-none select-none text-zinc-600">05</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="w-4 h-px bg-violet-400 inline-block" /> Manage
                </p>
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Handle it all in-platform.</h3>
                  <span className="flex-shrink-0 text-xs font-semibold text-violet-300 border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 rounded-full">Coming soon</span>
                </div>
                <p className="text-white/40 leading-relaxed text-sm sm:text-base">Sign contracts, process payments, and track deliverables — all without leaving NIL Card. No lawyers, no wire transfers, no back-and-forth.</p>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 sm:p-5">
                {/* macOS chrome */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-8 rounded-lg bg-zinc-800/60 w-3/4" />
                  <div className="h-8 rounded-lg bg-zinc-800/60 w-full" />
                  <div className="h-8 rounded-lg bg-zinc-800/60 w-5/6" />
                  <div className="h-10 rounded-lg bg-violet-900/30 border border-violet-700/20 w-full mt-1" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== NIL vs TRADITIONAL ADS ========== */}
      <section className="relative bg-zinc-900 py-20 sm:py-28 px-4 sm:px-6 border-t border-zinc-800 overflow-hidden">
        {/* Ambient glow behind NIL side */}
        <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              NIL partnerships vs. traditional advertising
            </h2>
            <p className="mt-3 text-white/40 text-base max-w-xl mx-auto">
              See why local businesses are making the switch.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.25), 0 0 60px rgba(124,58,237,0.08)" }}>
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div className="flex items-center gap-3 px-6 py-5 bg-gradient-to-br from-violet-600/20 to-blue-600/10 border-b border-violet-500/20">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">NIL Partnership</p>
                  <p className="text-[10px] text-violet-400/70">The modern playbook</p>
                </div>
              </div>

              <div className="w-px bg-white/5" />

              <div className="flex items-center gap-3 px-6 py-5 bg-zinc-900/80 border-b border-white/5">
                <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-400/70" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-500">Traditional Ads</p>
                  <p className="text-[10px] text-zinc-600">Losing ground fast</p>
                </div>
              </div>
            </div>

            {/* Comparison rows */}
            {[
              {
                label: "Cost",
                nil: "A fraction of ad spend for 10K+ engaged local followers",
                trad: "Rising CPMs on Google, Meta & TikTok — paying more for less every year",
              },
              {
                label: "Trust",
                nil: "Fans trust athletes — sponsored content feels like a real recommendation",
                trad: "Audiences tune out banners and skip pre-rolls within seconds",
              },
              {
                label: "Targeting",
                nil: "Local athletes bring local audiences who can actually walk in your door",
                trad: "Broad demographics — no guarantee your audience is local or relevant",
              },
              {
                label: "Longevity",
                nil: "Athletes post organically long after the deal is signed",
                trad: "Stops working the moment you stop paying",
              },
            ].map(({ label, nil, trad }) => (
              <div key={label} className="grid grid-cols-[1fr_auto_1fr] border-b border-white/5 last:border-0">
                <div className="px-6 py-5 bg-violet-950/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/50 mb-1.5">{label}</p>
                  <p className="text-sm text-white/80 leading-relaxed">{nil}</p>
                </div>

                <div className="w-px bg-white/5" />

                <div className="px-6 py-5 bg-zinc-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">{label}</p>
                  <p className="text-sm text-white/25 leading-relaxed">{trad}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING TIERS ========== */}
      <section className="bg-[#08090a] py-20 sm:py-28 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Two ways to work with us</h2>
            <p className="mt-3 text-white/40 text-base max-w-xl mx-auto">
              Start with a managed match, or unlock the full marketplace and find athletes yourself.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {/* Managed */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 flex flex-col">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Tier 1</p>
                <h3 className="text-2xl font-bold text-white">Managed</h3>
                <p className="text-sm text-white/40 mt-2 leading-relaxed">
                  Tell us what you need. We hand-pick athletes that fit your audience and make the intro directly.
                </p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {[
                  "We match you to the right athlete",
                  "Curated by hand — no noise",
                  "Direct intro within 48 hours",
                  "Ongoing support for your first deal",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-xs text-white/30">Best for businesses new to NIL</p>
                <Link
                  href="/for-brands/apply"
                  className="mt-3 block text-center w-full rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-3 text-sm font-semibold text-white transition-all"
                >
                  Get started →
                </Link>
              </div>
            </div>

            {/* Marketplace — highlighted */}
            <div className="relative bg-zinc-900 border border-violet-500/40 rounded-2xl p-7 flex flex-col shadow-[0_0_40px_rgba(124,58,237,0.12)]">
              <div className="absolute -top-3 left-6">
                <span className="bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">Tier 2</p>
                <h3 className="text-2xl font-bold text-white">Marketplace</h3>
                <p className="text-sm text-white/40 mt-2 leading-relaxed">
                  Browse the full NIL Card roster yourself. Filter by sport, university, follower count, and more — then reach out directly.
                </p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {[
                  "Full access to athlete marketplace",
                  "Filter by sport, school, location & stats",
                  "Message athletes directly in-platform",
                  "Everything in Managed, plus self-serve",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-zinc-800/60">
                <p className="text-xs text-white/30">Best for brands running multiple campaigns</p>
                <Link
                  href="/for-brands/apply"
                  className="mt-3 block text-center w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 py-3 text-sm font-semibold text-white transition-all"
                >
                  Join the waitlist →
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-white/40 mt-8">
            Not sure which fits? Fill out the form below and we&apos;ll recommend the right tier.
          </p>
        </div>
      </section>


      {/* ========== BOTTOM CTA ========== */}
      <section className="relative overflow-hidden border-t border-zinc-800 py-28 px-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#08090a] to-blue-950/30" />
        {/* Glow blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[300px] h-[200px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Ready to make your first NIL deal?
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            We&apos;ll match you with the right athlete and handle all the nitty gritty — you just show up and grow.
          </p>
          <Link
            href="/for-brands/apply"
            className="inline-block mt-10 px-10 py-4 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-all text-base hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]"
          >
            Find My Athlete →
          </Link>
        </div>
      </section>
    </div>
  )
}
