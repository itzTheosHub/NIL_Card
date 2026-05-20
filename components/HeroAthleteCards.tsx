"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Trophy, Users, TrendingUp, Eye, Play, BadgeCheck, GraduationCap } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Data types                                                         */
/* ------------------------------------------------------------------ */
interface SocialLink {
  platform: "instagram" | "tiktok"
  handle: string
  followers: string
}

interface AthleteData {
  name: string
  sport: string
  division: string
  university: string
  image: string
  imagePosition?: string
  followers: string
  engagement: string
  avgViews: string
  socials: SocialLink[]
  aiMatchScore: number
  matchReasons: string[]
  demographics: { label: string; value: string }[]
  videos: { title: string; views: string }[]
  awards: string[]
}

/* ------------------------------------------------------------------ */
/*  Athlete data                                                       */
/* ------------------------------------------------------------------ */
const athletes: AthleteData[] = [
  {
    name: "Jordan Ellis",
    sport: "Basketball",
    division: "D1",
    university: "Cincinnati",
    image: "/homepage-cards-photos/uc_athlete.png",
    followers: "24.5K",
    engagement: "8.2%",
    avgViews: "45K",
    socials: [
      { platform: "instagram", handle: "jordanellis", followers: "18.2K" },
      { platform: "tiktok",    handle: "jordanellis", followers: "6.3K"  },
    ],
    aiMatchScore: 94,
    matchReasons: ["Local audience match", "High engagement rate", "Fitness content creator"],
    demographics: [
      { label: "Age",    value: "18–24" },
      { label: "Local",  value: "78%"   },
      { label: "Male",   value: "62%"   },
      { label: "Active", value: "91%"   },
    ],
    videos: [
      { title: "Game Day Prep",     views: "45K" },
      { title: "Training Routine",  views: "32K" },
    ],
    awards: ["Conference First Team", "Student-Athlete Honor Roll"],
  },
  {
    name: "Maya Thompson",
    sport: "Soccer",
    division: "Big Ten",
    university: "Ohio State",
    image: "/homepage-cards-photos/osu_athlete.png",
    imagePosition: "center 15%",
    followers: "18.2K",
    engagement: "9.1%",
    avgViews: "38K",
    socials: [
      { platform: "instagram", handle: "mayathompson",  followers: "14.1K" },
      { platform: "tiktok",    handle: "mayathompson_", followers: "4.1K"  },
    ],
    aiMatchScore: 91,
    matchReasons: ["Strong female audience", "Lifestyle content", "Brand-safe profile"],
    demographics: [
      { label: "Age",    value: "18–25" },
      { label: "Local",  value: "65%"   },
      { label: "Female", value: "74%"   },
      { label: "Active", value: "88%"   },
    ],
    videos: [
      { title: "Match Highlights", views: "28K" },
      { title: "Day in My Life",   views: "51K" },
    ],
    awards: ["All-Conference Selection", "Academic All-American"],
  },
  {
    name: "Chris Okafor",
    sport: "Football",
    division: "SEC",
    university: "Kentucky",
    image: "/homepage-cards-photos/kentucky_athlete.png",
    followers: "31.8K",
    engagement: "7.4%",
    avgViews: "62K",
    socials: [
      { platform: "instagram", handle: "chrisokafor",  followers: "24.5K" },
      { platform: "tiktok",    handle: "okafor_chris", followers: "7.3K"  },
    ],
    aiMatchScore: 88,
    matchReasons: ["Massive local reach", "Sports nutrition interest", "Event-ready"],
    demographics: [
      { label: "Age",    value: "18–30" },
      { label: "Local",  value: "82%"   },
      { label: "Male",   value: "71%"   },
      { label: "Active", value: "85%"   },
    ],
    videos: [
      { title: "Weight Room Session", views: "62K" },
      { title: "Gameday Vlog",        views: "41K" },
    ],
    awards: ["SEC Honorable Mention", "Team Captain"],
  },
  {
    name: "Ava Martinez",
    sport: "Volleyball",
    division: "ACC",
    university: "U of L",
    image: "/homepage-cards-photos/Louisville_athlete.png",
    imagePosition: "center 8%",
    followers: "15.6K",
    engagement: "10.3%",
    avgViews: "29K",
    socials: [
      { platform: "instagram", handle: "avamartinez",    followers: "11.4K" },
      { platform: "tiktok",    handle: "avamartinez_vb", followers: "4.2K"  },
    ],
    aiMatchScore: 86,
    matchReasons: ["Highest engagement", "Wellness niche", "Photo-ready content"],
    demographics: [
      { label: "Age",    value: "18–24" },
      { label: "Local",  value: "71%"   },
      { label: "Female", value: "68%"   },
      { label: "Active", value: "93%"   },
    ],
    videos: [
      { title: "Tournament Recap", views: "19K" },
      { title: "Morning Routine",  views: "37K" },
    ],
    awards: ["Conference Freshman of the Year", "Dean's List"],
  },
]

/* ------------------------------------------------------------------ */
/*  Card positions                                                     */
/* ------------------------------------------------------------------ */
const cardPositions = [
  { x: -360, y: 40, rotate: -8,  scale: 0.9,  zIndex: 1 },
  { x: -120, y: 15, rotate: -3,  scale: 0.95, zIndex: 2 },
  { x:  120, y: 15, rotate:  3,  scale: 0.95, zIndex: 2 },
  { x:  360, y: 40, rotate:  8,  scale: 0.9,  zIndex: 1 },
]

const mobileCardPositions = [
  { x: -140, y: 20, rotate: -10, scale: 0.9, zIndex: 1 },
  { x:    0, y:  0, rotate:   0, scale: 1,   zIndex: 3 },
  { x:  140, y: 20, rotate:  10, scale: 0.9, zIndex: 1 },
]

/* ------------------------------------------------------------------ */
/*  Social icon helpers                                                */
/* ------------------------------------------------------------------ */
function InstagramIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Card Front — mirrors FlippableCard front                          */
/* ------------------------------------------------------------------ */
function AthleteCardFront({ athlete, mobile = false }: { athlete: AthleteData; mobile?: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl flex flex-col p-3 overflow-hidden bg-zinc-900"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        boxShadow: "inset 0 0 0 1.5px rgba(139,92,246,0.5)",
      }}
    >
      {/* Profile photo */}
      <div className="flex justify-center pt-1 pb-2">
        <div className="relative">
          <div className={`${mobile ? "w-14 h-14" : "w-20 h-20"} rounded-full overflow-hidden border-2 border-zinc-800 ring-2 ring-violet-500/30`}>
            <Image
              src={athlete.image}
              alt={athlete.name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
              style={{ objectPosition: athlete.imagePosition ?? "top" }}
            />
          </div>
          <BadgeCheck className={`absolute bottom-0 right-0 ${mobile ? "w-4 h-4" : "w-5 h-5"} text-violet-500 bg-zinc-900 rounded-full`} />
        </div>
      </div>

      {/* Name */}
      <p className={`${mobile ? "text-sm" : "text-lg"} font-bold tracking-wide text-white text-center leading-tight`}>{athlete.name}</p>

      {/* Sport divider */}
      <div className="flex items-center gap-2.5 justify-center mt-1">
        <div className="flex-shrink-0 w-[28px] h-px bg-gradient-to-l from-violet-400/30 to-transparent" />
        <span className="text-[10px] text-violet-400/70 whitespace-nowrap">{athlete.sport} • {athlete.division}</span>
        <div className="flex-shrink-0 w-[28px] h-px bg-gradient-to-r from-violet-400/30 to-transparent" />
      </div>

      {/* University divider */}
      <div className="flex items-center gap-2.5 justify-center mt-0.5 mb-2.5">
        <div className="flex-shrink-0 w-[28px] h-px bg-gradient-to-l from-violet-400/30 to-transparent" />
        <span className="text-[10px] text-violet-400/70 flex items-center gap-1 whitespace-nowrap">
          <GraduationCap className="w-3 h-3" />
          {athlete.university}
        </span>
        <div className="flex-shrink-0 w-[28px] h-px bg-gradient-to-r from-violet-400/30 to-transparent" />
      </div>

      {/* 3-stat grid */}
      <div className={`grid grid-cols-3 ${mobile ? "gap-1" : "gap-1.5"} mb-2.5`}>
        <div className="flex flex-col items-center bg-purple-900/30 rounded-lg py-1.5">
          <Users className={`${mobile ? "w-3 h-3" : "w-4 h-4"} text-purple-400 mb-0.5`} />
          <p className={`${mobile ? "text-[10px]" : "text-xs"} font-bold text-white leading-none`}>{athlete.followers}</p>
          <p className={`${mobile ? "text-[8px]" : "text-[10px]"} text-zinc-500 mt-0.5`}>Reach</p>
        </div>
        <div className="flex flex-col items-center bg-pink-900/30 rounded-lg py-1.5">
          <TrendingUp className={`${mobile ? "w-3 h-3" : "w-4 h-4"} text-pink-400 mb-0.5`} />
          <p className={`${mobile ? "text-[10px]" : "text-xs"} font-bold text-white leading-none`}>{athlete.engagement}</p>
          <p className={`${mobile ? "text-[8px]" : "text-[10px]"} text-zinc-500 mt-0.5`}>{mobile ? "Eng." : "Eng Rate"}</p>
        </div>
        <div className="flex flex-col items-center bg-blue-900/30 rounded-lg py-1.5">
          <Eye className={`${mobile ? "w-3 h-3" : "w-4 h-4"} text-blue-400 mb-0.5`} />
          <p className={`${mobile ? "text-[10px]" : "text-xs"} font-bold text-white leading-none`}>{athlete.avgViews}</p>
          <p className={`${mobile ? "text-[8px]" : "text-[10px]"} text-zinc-500 mt-0.5`}>Views</p>
        </div>
      </div>

      {/* Social channels */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
          {mobile ? "Socials" : "Social Channels"}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-violet-500/40 to-transparent" />
      </div>
      <div className="flex flex-col gap-1.5">
        {athlete.socials.map((s) => (
          <div
            key={s.platform}
            className={`flex items-center ${mobile ? "gap-1.5 px-2 py-1" : "gap-2 px-2.5 py-1.5"} rounded-lg border ${
              s.platform === "instagram"
                ? "bg-gradient-to-r from-purple-900/30 to-pink-900/20 border-purple-800/30"
                : "bg-zinc-800/50 border-zinc-700/40"
            }`}
          >
            <div className={`${mobile ? "w-4 h-4" : "w-6 h-6"} rounded-lg flex items-center justify-center flex-shrink-0 ${
              s.platform === "instagram"
                ? "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
                : "bg-black"
            }`}>
              {s.platform === "instagram" ? <InstagramIcon /> : <TikTokIcon />}
            </div>
            <span className={`${mobile ? "text-[9px]" : "text-xs"} font-medium text-white flex-1 truncate`}>
              {s.platform === "instagram" ? "Instagram" : "TikTok"}
            </span>
            {mobile ? (
              <span className="text-[9px] font-semibold text-white flex-shrink-0">{s.followers}</span>
            ) : (
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] font-semibold text-white leading-none">{s.followers}</p>
                <p className="text-[9px] text-zinc-500 mt-0.5">followers</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-1.5 flex flex-col items-center gap-1">
        <div className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
          <span className={`${mobile ? "text-[8px]" : "text-[9px]"} font-bold text-violet-400`}>{athlete.aiMatchScore}% AI Match</span>
        </div>
        <p className={`${mobile ? "text-[7px]" : "text-[8px]"} text-white/20 text-center`}>Tap to flip →</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Card Back                                                          */
/* ------------------------------------------------------------------ */
function AthleteCardBack({ athlete, mobile = false }: { athlete: AthleteData; mobile?: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(59,130,246,0.7), rgba(139,92,246,0.9))" }} />
      <div className="absolute inset-[1.5px] rounded-xl bg-zinc-900 p-3 flex flex-col overflow-hidden">

        {/* AI Match Score */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-white">AI Match Score</span>
            <span className="text-xs font-bold text-violet-400">{athlete.aiMatchScore}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
              style={{ width: `${athlete.aiMatchScore}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {athlete.matchReasons.map((r) => (
              <span key={r} className="text-[9px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div className="mb-2">
          <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Demographics</p>
          <div className="grid grid-cols-2 gap-1">
            {athlete.demographics.map((d) => (
              <div key={d.label} className="bg-zinc-800/50 rounded-md px-2 py-1">
                <p className="text-[9px] text-white/30">{d.label}</p>
                <p className="text-[10px] font-semibold text-white">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sample content */}
        <div className="mb-2">
          <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sample Content</p>
          {athlete.videos.map((v) => (
            <div key={v.title} className="flex items-center gap-1.5 mb-1 bg-zinc-800/30 rounded-md px-2 py-1">
              <Play className="w-2.5 h-2.5 text-violet-400 flex-shrink-0" />
              <span className="text-[10px] text-white/60 truncate flex-1">{v.title}</span>
              <span className="text-[9px] text-white/30 flex-shrink-0">
                <Eye className="w-2.5 h-2.5 inline mr-0.5" />{v.views}
              </span>
            </div>
          ))}
        </div>

        {/* Awards — hidden on mobile to fit card height */}
        {!mobile && (
          <div className="mb-2">
            <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Awards</p>
            {athlete.awards.map((a) => (
              <div key={a} className="flex items-center gap-1.5 mb-0.5">
                <Trophy className="w-2.5 h-2.5 text-yellow-500 flex-shrink-0" />
                <span className="text-[9px] text-white/50">{a}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <button className="w-full h-7 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[10px] font-medium rounded-lg hover:from-violet-700 hover:to-blue-600 transition-all flex items-center justify-center gap-1">
            Pitch this athlete <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Single flippable card                                              */
/* ------------------------------------------------------------------ */
function AthleteCard({ athlete, index, mobile = false }: { athlete: AthleteData; index: number; mobile?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const pos = mobile ? mobileCardPositions[index] : cardPositions[index]
  const sizeClass = mobile ? "w-36 h-[360px]" : "w-56 h-[403px]"

  return (
    <div
      className={`absolute ${sizeClass} cursor-pointer`}
      style={{
        perspective: "1000px",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translateX(${pos.x}px) translateY(${pos.y}px) rotate(${pos.rotate}deg) scale(${pos.scale})`,
        zIndex: isFlipped ? 10 : pos.zIndex,
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <AthleteCardFront athlete={athlete} mobile={mobile} />
        <AthleteCardBack athlete={athlete} mobile={mobile} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Default export                                                     */
/* ------------------------------------------------------------------ */
export default function HeroAthleteCards() {
  return (
    <>
      {/* Mobile: 3-card deck spread */}
      <div className="relative w-full h-[420px] lg:hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[160px] bg-gradient-to-r from-violet-600/10 via-blue-500/15 to-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        {athletes.slice(0, 3).map((athlete, index) => (
          <AthleteCard key={`m-${athlete.name}`} athlete={athlete} index={index} mobile />
        ))}
      </div>

      {/* Desktop: 4-card fan spread */}
      <div className="hidden lg:block relative w-full h-[468px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[200px] bg-gradient-to-r from-violet-600/10 via-blue-500/15 to-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        {athletes.map((athlete, index) => (
          <AthleteCard key={athlete.name} athlete={athlete} index={index} />
        ))}
      </div>
    </>
  )
}
