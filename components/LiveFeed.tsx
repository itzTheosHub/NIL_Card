"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Signup data                                                        */
/* ------------------------------------------------------------------ */
const signupData = [
  { business: "Iron & Oak Gym", location: "Cincinnati, OH", time: "2 minutes ago" },
  { business: "Bella's Italian Kitchen", location: "Columbus, OH", time: "5 minutes ago" },
  { business: "Peak Performance Auto", location: "Lexington, KY", time: "8 minutes ago" },
  { business: "Thread & Needle Boutique", location: "Louisville, KY", time: "12 minutes ago" },
  { business: "Campus Cuts Barbershop", location: "Bloomington, IN", time: "15 minutes ago" },
  { business: "Sunrise Smoothie Bar", location: "Cincinnati, OH", time: "18 minutes ago" },
  { business: "Metro Dental Studio", location: "Dayton, OH", time: "22 minutes ago" },
  { business: "FreshFit Meal Prep", location: "Oxford, OH", time: "25 minutes ago" },
  { business: "The Grind Coffee Co.", location: "Columbus, OH", time: "30 minutes ago" },
  { business: "Elite Sports Rehab", location: "Louisville, KY", time: "35 minutes ago" },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LiveFeed() {
  const [visibleItems, setVisibleItems] = useState<typeof signupData>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  /* Init with first 3 items */
  useEffect(() => {
    setVisibleItems(signupData.slice(0, 3))
    setCurrentIndex(3)
  }, [])

  /* Cycle every 4 seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev >= signupData.length ? 0 : prev
        const newItem = signupData[nextIndex]

        setVisibleItems((prevItems) => [newItem, ...prevItems.slice(0, 2)])

        return nextIndex + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-[#08090a] py-20 sm:py-28 px-4 sm:px-6 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left — Section text */}
          <div className="lg:max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              {/* Live ping indicator */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-400">Live</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Businesses are joining right now
            </h2>
            <p className="mt-3 text-white/40 text-sm leading-relaxed">
              Every week, new local businesses sign up to connect with college athletes in their area.
            </p>
          </div>

          {/* Right — Feed items */}
          <div className="flex-1 lg:max-w-md flex flex-col gap-3">
            {visibleItems.map((item, index) => (
              <div
                key={`${item.business}-${index}`}
                className={`flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all ${
                  index === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""
                }`}
                style={{ opacity: 1 - index * 0.2 }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-400">
                    {item.business.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {item.business}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span className="text-xs text-white/40 truncate">{item.location}</span>
                  </div>
                </div>

                {/* Time */}
                <span className="flex-shrink-0 text-xs text-white/30">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
