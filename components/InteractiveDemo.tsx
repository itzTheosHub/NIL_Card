"use client"

import { useState } from "react"
import Image from "next/image"
import { Sparkles, MapPin, Users, TrendingUp } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Business types                                                     */
/* ------------------------------------------------------------------ */
const businessTypes = [
  { id: "gym", label: "Gym & Fitness", emoji: "🏋️" },
  { id: "restaurant", label: "Restaurant", emoji: "🍕" },
  { id: "retail", label: "Retail & Clothing", emoji: "👕" },
  { id: "auto", label: "Auto & Services", emoji: "🚗" },
]

/* ------------------------------------------------------------------ */
/*  Matched athletes per business type                                 */
/* ------------------------------------------------------------------ */
const matchedAthletes: Record<
  string,
  { name: string; sport: string; match: number; reason: string; followers: string; image: string }[]
> = {
  gym: [
    {
      name: "Jordan Ellis",
      sport: "Basketball",
      match: 94,
      reason: "Fitness content creator with local gym-goer audience",
      followers: "24.5K",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Chris Okafor",
      sport: "Football",
      match: 88,
      reason: "Posts weight training content, nutrition-focused audience",
      followers: "31.8K",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Ava Martinez",
      sport: "Volleyball",
      match: 82,
      reason: "Wellness and active lifestyle niche, high engagement",
      followers: "15.6K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ],
  restaurant: [
    {
      name: "Maya Thompson",
      sport: "Soccer",
      match: 91,
      reason: "Lifestyle & food content, strong female foodie audience",
      followers: "18.2K",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Jordan Ellis",
      sport: "Basketball",
      match: 85,
      reason: "Frequently features local restaurants in stories",
      followers: "24.5K",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Ava Martinez",
      sport: "Volleyball",
      match: 79,
      reason: "Day-in-my-life content with dining highlights",
      followers: "15.6K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ],
  retail: [
    {
      name: "Maya Thompson",
      sport: "Soccer",
      match: 93,
      reason: "Fashion-forward content, strong shopping audience",
      followers: "18.2K",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Ava Martinez",
      sport: "Volleyball",
      match: 87,
      reason: "Outfit-of-the-day posts with high save rates",
      followers: "15.6K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Jordan Ellis",
      sport: "Basketball",
      match: 76,
      reason: "Streetwear and sneaker culture content",
      followers: "24.5K",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face",
    },
  ],
  auto: [
    {
      name: "Chris Okafor",
      sport: "Football",
      match: 90,
      reason: "Car enthusiast content, male-dominated audience",
      followers: "31.8K",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Jordan Ellis",
      sport: "Basketball",
      match: 83,
      reason: "Lifestyle vlogs featuring rides and road trips",
      followers: "24.5K",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Maya Thompson",
      sport: "Soccer",
      match: 71,
      reason: "Broad local reach with crossover appeal",
      followers: "18.2K",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
  ],
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function InteractiveDemo() {
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  function handleSelect(id: string) {
    setSelectedBusiness(id)
    setShowResults(false)
  }

  function handleMatch() {
    if (!selectedBusiness) return
    setIsMatching(true)
    setShowResults(false)
    setTimeout(() => {
      setIsMatching(false)
      setShowResults(true)
    }, 1500)
  }

  const results = selectedBusiness ? matchedAthletes[selectedBusiness] ?? [] : []

  return (
    <section className="relative bg-[#08090a] py-20 sm:py-28 px-4 sm:px-6 border-t border-zinc-800">
      {/* Background glow */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-400 mb-3">
            Try it out
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            See who we&apos;d match you with
          </h2>
          <p className="mt-3 text-white/40 text-base max-w-xl mx-auto">
            Pick your business type and watch our AI find the perfect athlete partners.
          </p>
        </div>

        {/* Demo container */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8">
          {/* Business type selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-white/60 mb-3">
              What type of business are you?
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all ${
                    selectedBusiness === type.id
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900/50 text-white/60 hover:border-zinc-700 hover:text-white/80"
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Match button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleMatch}
              disabled={!selectedBusiness || isMatching}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium hover:from-violet-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isMatching ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Finding matches...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Find My Athletes
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {showResults && results.length > 0 ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-4">
                Top matches for your business
              </p>
              {results.map((athlete) => (
                <div
                  key={`${athlete.name}-${athlete.match}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700"
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20">
                    <Image
                      src={athlete.image}
                      alt={athlete.name}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {athlete.name}
                      </p>
                      <span className="text-xs text-white/30">·</span>
                      <span className="text-xs text-white/40">{athlete.sport}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{athlete.reason}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-white/30">
                        <Users className="w-3 h-3" />
                        {athlete.followers}
                      </span>
                    </div>
                  </div>

                  {/* Match percentage */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-zinc-800"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="url(#matchGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(athlete.match / 100) * 125.6} 125.6`}
                        />
                        <defs>
                          <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {athlete.match}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !showResults && !isMatching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-sm text-white/30">
                Select your business type and hit &ldquo;Find My Athletes&rdquo; to see matches
              </p>
            </div>
          ) : null}

          {/* Loading state */}
          {isMatching && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center mb-4 animate-pulse">
                <Sparkles className="w-7 h-7 text-violet-400" />
              </div>
              <p className="text-sm text-white/40">Analyzing athlete profiles...</p>
              <div className="mt-4 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
