"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface AthleteData {
  name: string
  sport: string
  university: string
  followers: string
  engagement: string
  avgViews: string
  imageUrl: string
}

const athletes: AthleteData[] = [
  {
    name: "Marcus Johnson",
    sport: "D1 Basketball",
    university: "University of Cincinnati",
    followers: "18.4K",
    engagement: "5.4%",
    avgViews: "~3,800",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=80&h=80&fit=crop",
  },
  {
    name: "Aaliyah Torres",
    sport: "D1 Soccer",
    university: "Ohio State University",
    followers: "12.1K",
    engagement: "7.2%",
    avgViews: "~2,400",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=80&h=80&fit=crop",
  },
  {
    name: "Tyler Brooks",
    sport: "D1 Track & Field",
    university: "University of Kentucky",
    followers: "9.8K",
    engagement: "6.8%",
    avgViews: "~1,900",
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=80&h=80&fit=crop",
  },
]

function AthleteCard({
  athlete,
  isFront = false,
  className = "",
  style = {},
  visible = true,
}: {
  athlete: AthleteData
  isFront?: boolean
  className?: string
  style?: React.CSSProperties
  visible?: boolean
}) {
  return (
    <div
      className={`relative w-72 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center gap-4 shadow-2xl shadow-black/50 ${
        isFront
          ? `transition-all duration-[600ms] ease-out ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            }`
          : ""
      } ${className}`}
      style={style}
    >
      {/* Avatar with gradient ring */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 p-[2.5px]">
        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
          <Image
            src={athlete.imageUrl}
            alt={athlete.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            crossOrigin="anonymous"
          />
        </div>
      </div>

      {/* Name + sport + school */}
      <div className="text-center">
        <p className="text-lg font-bold text-white">{athlete.name}</p>
        <p className="text-sm text-white/40">{athlete.sport} · Division I</p>
        <p className="text-sm text-white/40">{athlete.university}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-center">
        <div>
          <p className="text-base font-bold text-white">{athlete.followers}</p>
          <p className="text-xs text-white/40">Followers</p>
        </div>
        <div className="w-px h-8 bg-zinc-800" />
        <div>
          <p className="text-base font-bold text-white">{athlete.engagement}</p>
          <p className="text-xs text-white/40">Engagement</p>
        </div>
        <div className="w-px h-8 bg-zinc-800" />
        <div>
          <p className="text-base font-bold text-white">{athlete.avgViews}</p>
          <p className="text-xs text-white/40">Avg Views</p>
        </div>
      </div>

      {/* Good match badge */}
      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium px-3 py-1 rounded-full">
        <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Good match
      </span>

      {/* Pitch button - only on front card */}
      {isFront && (
        <button className="w-full mt-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-xl py-2.5 hover:from-violet-700 hover:to-blue-600 transition-all">
          Pitch this athlete →
        </button>
      )}
    </div>
  )
}

export default function HeroAthleteStack() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="hidden sm:block">
      <div className="relative w-[340px] h-[520px]">
        {/* Glow effect behind stack */}
        <div className="absolute inset-0 translate-x-8 translate-y-8 rounded-3xl bg-gradient-to-br from-violet-600/20 via-blue-500/10 to-transparent blur-3xl" />

        {/* Bottom card (3rd - Tyler) */}
        <AthleteCard
          athlete={athletes[2]}
          className="absolute"
          style={{
            top: "80px",
            left: "40px",
            transform: "rotate(6deg) scale(0.92)",
            zIndex: 1,
            opacity: 0.7,
          }}
        />

        {/* Middle card (2nd - Aaliyah) */}
        <AthleteCard
          athlete={athletes[1]}
          className="absolute"
          style={{
            top: "40px",
            left: "20px",
            transform: "rotate(-6deg) scale(0.96)",
            zIndex: 2,
            opacity: 0.85,
          }}
        />

        {/* Top card (1st - Marcus - fully visible with fade-in) */}
        <AthleteCard
          athlete={athletes[0]}
          isFront={true}
          visible={visible}
          className="absolute"
          style={{
            top: "0px",
            left: "0px",
            transform: "rotate(0deg)",
            zIndex: 3,
          }}
        />
      </div>
    </div>
  )
}
