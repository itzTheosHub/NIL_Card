"use client"
import Link from "next/link"
import Header from "@/components/Header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { ArrowRight, Star, UserPlus, Link2, Share2, Sparkles, Check, X } from "lucide-react"
import NilCardPreview from "@/components/NilCardPreview"
import UniversityLogoBar from "@/components/UniversityLogoBar"

const SAMPLE_BUSINESSES = [
  {
    name: "Surge Supplements",
    type: "Supplement Store",
    address: "20000 Short Vine, Cincinnati, OH",
    rating: 4.7,
    reviews: 400,
    emoji: "💊"
  },
  {
    name: "Iron & Oak Gym",
    type: "Gym & Fitness",
    address: "25 Calhoun Street, Cincinnati, OH",
    rating: 3.9,
    reviews: 3000,
    emoji: "🏋️"
  },
  {
    name: "Campus Cuts Barbershop",
    type: "Salon & Barbershop",
    address: "8998 Vine Street, Cincinnati, OH",
    rating: 4.2,
    reviews: 2894,
    emoji: "✂️"
  },
  {
    name: "Clutch Sportswear",
    type: "Retail & Clothing",
    address: "2395 MLK Street, Cincinnati, OH",
    rating: 3.6,
    reviews: 1987,
    emoji: "👟"
  }
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", session.user.id).single()
        setUser(session.user)
        if (profile) setProfile(profile)
        else setProfile(null)
      } else {
        setUser(null)
        setProfile(null)
      }
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      <Header />

      {/* Hero */}
      <main className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Left violet blob — behind headline */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        {/* Right blue blob — behind card */}
        <div className="pointer-events-none absolute top-10 right-0 w-[420px] h-[420px] rounded-full bg-blue-500/15 blur-[100px]" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text + CTAs */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
              Stop DMing brands with nothing to show.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Send a link that does the talking.
              </span>
            </h1>
            <p className="mt-4 text-lg text-white/40 max-w-md">
              Local businesses in your city are looking for athletes to partner with. NIL Card gives you everything you need in one link.
            </p>

            {/* Scarcity pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              First 500 athletes free · <span className="text-emerald-300">327 spots left</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user ? (
                <Link
                  href={profile?.username ? `/profile/${profile.username}` : "/profile/create"}
                  className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-8 py-3 text-base font-medium text-white whitespace-nowrap text-center transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                >
                  View My Card
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="flex-1 text-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-6 py-3 text-base font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  >
                    Create my free card
                  </Link>
                  <Link
                    href="/profile/theo-colosimo?ref=home"
                    className="flex-1 text-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 text-base font-medium text-white transition-all"
                  >
                    See an Example →
                  </Link>
                </>
              )}
            </div>

            {/* Feature checklist */}
            <div className="mt-8 flex flex-col gap-3">
              {[
                { icon: Check, text: "Verified social stats, pulled automatically" },
                { icon: Link2, text: "One shareable link for every brand pitch" },
                { icon: Sparkles, text: "Discovered by local businesses near you" },
                { icon: ArrowRight, text: "Built-in marketplace to browse & pitch brands" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-sm text-white/50">{text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center mt-4 gap-3">
              <div className="flex">
                {["TC", "JM", "AS", "KR"].map((initials, i) => (
                  <div
                    key={initials}
                    className="w-7 h-7 rounded-full border-2 border-[#08090a] flex items-center justify-center text-white text-[10px] font-bold -ml-1.5 first:ml-0"
                    style={{
                      backgroundColor: ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"][i],
                      zIndex: 4 - i,
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40">
                <span className="font-semibold text-white">Join athletes</span>{" "}already on NIL Card
              </p>
            </div>
          </div>

          {/* Right: card preview */}
          <div className="relative flex justify-center md:justify-end scale-90 md:scale-100">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-600/25 blur-[80px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-500/20 blur-[60px]" />
            </div>
            <NilCardPreview />
          </div>
        </div>
      </main>

      <UniversityLogoBar />

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-white">How It Works</h2>
          <p className="mt-2 text-center text-white/40">Get your NIL Card up and running in minutes</p>

          <div className="mt-12 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden lg:block absolute top-9 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px">
              <div className="w-full h-full bg-gradient-to-r from-violet-500/40 via-blue-500/40 to-violet-500/40" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(139,92,246,0.4) 0px, rgba(139,92,246,0.4) 6px, transparent 6px, transparent 14px)" }} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "1", icon: UserPlus,  title: "Build your pitch",   desc: "Add your sport, stats, social handles, and a photo. Takes less than 5 minutes." },
                { step: "2", icon: Link2,     title: "Get your link",      desc: "Your card lives at nilcard.app/profile/your-name — one link that shows everything." },
                { step: "3", icon: Share2,    title: "Share with brands",  desc: "DM it, email it, drop it in your bio. Brands see your reach and how to work with you." },
                { step: "4", icon: Sparkles,  title: "Get discovered",     desc: "Brands browsing the marketplace find you. The best deals sometimes come to you.", highlight: true },
              ].map(({ step, icon: Icon, title, desc, highlight }) => (
                <div
                  key={step}
                  className={`relative bg-zinc-900 rounded-2xl p-6 flex flex-col gap-3 ${highlight ? "shadow-[0_0_30px_rgba(124,58,237,0.15)]" : ""}`}
                  style={{ boxShadow: highlight ? "inset 0 0 0 1px rgba(139,92,246,0.5)" : "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                >
                  {/* Step number */}
                  <span className="absolute top-4 right-4 text-xs font-bold text-white/20">{step}</span>
                  {/* Icon */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${highlight ? "from-violet-600 to-blue-500 shadow-[0_0_16px_rgba(124,58,237,0.4)]" : "from-violet-600/80 to-blue-500/80"}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mt-1">{title}</h3>
                  <p className="text-sm text-white/40">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NIL vs Traditional */}
      <section className="relative py-20 px-4 border-t border-white/5 overflow-hidden">
        {/* Ambient glow behind NIL side */}
        <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">NIL vs. traditional advertising</h2>
            <p className="mt-2 text-white/40">See why local businesses are making the switch.</p>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.25), 0 0 60px rgba(124,58,237,0.08)" }}>
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_1fr]">
              {/* NIL header */}
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

              {/* Traditional header */}
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
                nil: "Fraction of ad spend for 10K+ engaged local followers",
                trad: "Rising CPMs — paying more for less reach every year",
              },
              {
                label: "Trust",
                nil: "Fans trust athletes — feels like a genuine recommendation",
                trad: "Audiences tune out banners and skip pre-rolls instantly",
              },
              {
                label: "Targeting",
                nil: "Local athletes bring local audiences who can walk in",
                trad: "Broad demographics — no guarantee of local relevance",
              },
              {
                label: "Longevity",
                nil: "Athletes post organically long after the deal is signed",
                trad: "Stops working the moment you stop paying",
              },
            ].map(({ label, nil, trad }) => (
              <div key={label} className="grid grid-cols-[1fr_auto_1fr] border-b border-white/5 last:border-0">
                {/* NIL side */}
                <div className="px-6 py-5 bg-violet-950/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/50 mb-1.5">{label}</p>
                  <p className="text-sm text-white/80 leading-relaxed">{nil}</p>
                </div>

                <div className="w-px bg-white/5" />

                {/* Traditional side */}
                <div className="px-6 py-5 bg-zinc-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">{label}</p>
                  <p className="text-sm text-white/25 leading-relaxed">{trad}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace teaser */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5 bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-emerald-500/20">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Brand marketplace
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Find local brands to pitch</h2>
              <p className="text-white/40 text-base max-w-md">
                Browse businesses near you, see which ones match your interests, and send a personalized pitch in seconds.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 border border-violet-500/30 px-5 py-2.5 rounded-xl hover:bg-violet-500/10 transition-colors whitespace-nowrap self-start md:self-auto"
            >
              Browse all businesses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SAMPLE_BUSINESSES.map((business) => (
              <div
                key={business.name}
                className="bg-[#08090a] rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_0_0_1px_rgba(139,92,246,0.4)] transition-all"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
              >
                <div className="h-28 bg-zinc-800/60 flex items-center justify-center text-4xl">
                  {business.emoji}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="font-semibold text-white text-sm leading-tight">{business.name}</p>
                  <span className="self-start bg-violet-500/10 text-violet-400 text-[11px] font-medium px-2 py-0.5 rounded-md border border-violet-500/20">
                    {business.type}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-zinc-300">{business.rating}</span>
                    <span>({business.reviews})</span>
                  </div>
                  <p className="text-xs text-zinc-600 truncate">{business.address}</p>
                </div>
                <div className="px-4 pb-4">
                  <Link
                    href="/signup"
                    className="block w-full text-center text-xs font-semibold bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white rounded-lg py-2 transition-all"
                  >
                    Pitch →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-28 px-4 border-t border-white/5 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[300px] rounded-full bg-violet-600/20 blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[400px] h-[200px] rounded-full bg-blue-500/15 blur-[80px]" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Free to get started
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Ready to land your
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              first deal?
            </span>
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-md mx-auto">
            Create your free NIL Card in minutes and start pitching brands with confidence.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-8 px-10 py-4 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold text-base transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]"
          >
            Create my free card →
          </Link>
          <p className="mt-4 text-xs text-white/20">No credit card required. Takes less than 5 minutes.</p>
        </div>
      </section>
    </div>
  )
}
