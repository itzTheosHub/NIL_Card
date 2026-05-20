"use client"

import Image from "next/image"
import { useState } from "react"
import { Users, TrendingUp, Eye, BadgeCheck, GraduationCap, RotateCcw, Link2, Star, Newspaper, ExternalLink, Camera } from "lucide-react"

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const featuredContent = [
  { title: "Game Day Warm-Up 🏀", type: "Reel", views: "45K", engagement: "8.2%" },
  { title: "Training Session 💪", type: "Post", views: "28K", engagement: "6.1%" },
  { title: "Game Night Vlog 🎮", type: "TikTok", views: "31K", engagement: "7.4%" },
]

const awards = [
  { title: "Conference First Team", description: "2025–26 American Athletic Conference" },
  { title: "Academic All-American", description: "3.8 GPA while competing Division I" },
]

const pressArticles = [
  { title: "UC Basketball's Rising Stars to Watch", source: "Cincinnati Enquirer" },
  { title: "Jordan Smith Makes Dean's List", source: "UC Athletics" },
]


export default function NilCardPreview() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="[perspective:1000px] w-full max-w-xs mx-auto">
      <div
        className="relative transition-transform duration-700 [transform-style:preserve-3d] min-h-[700px]"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >

        {/* ── FRONT FACE ── */}
        <div
          className="[backface-visibility:hidden] rounded-2xl bg-zinc-900 w-full overflow-hidden cursor-pointer"
          style={{ WebkitBackfaceVisibility: "hidden", boxShadow: "inset 0 0 0 1.5px rgba(139,92,246,0.5), 0 0 40px rgba(124,58,237,0.15)" }}
          onClick={() => setIsFlipped(true)}
        >
          {/* Flip button */}
          <button
            onClick={() => setIsFlipped(true)}
            className="group absolute top-4 right-4 rounded-full px-2 py-1 flex items-center gap-1.5 bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white/60 group-hover:rotate-180 transition-transform duration-300" />
            <span className="text-xs font-medium text-white/60">Flip Card</span>
          </button>

          {/* Profile photo */}
          <div className="pt-8 px-6 flex justify-center">
            <div className="relative w-fit">
              <Image
                src="/athleteDemoPhoto.jpg"
                alt="Jordan Smith"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-4 border-zinc-900 ring-4 ring-violet-500/30"
              />
              <BadgeCheck className="absolute bottom-2 right-2 w-6 h-6 text-violet-500 bg-zinc-900 rounded-full" />
            </div>
          </div>

          {/* Name + info */}
          <div className="px-6 pb-6 pt-4 text-center">
            <h1 className="text-3xl font-bold tracking-wide text-white">Jordan Smith</h1>

            <div className="flex items-center justify-center gap-3 mt-1">
              <div className="flex-1 max-w-[40px] h-px bg-gradient-to-l from-violet-400/30 to-transparent" />
              <span className="text-sm text-violet-400/70 whitespace-nowrap">Junior • Men&apos;s Basketball • Division I</span>
              <div className="flex-1 max-w-[40px] h-px bg-gradient-to-r from-violet-400/30 to-transparent" />
            </div>

            <div className="flex items-center justify-center gap-3 mt-1">
              <div className="flex-1 max-w-[40px] h-px bg-gradient-to-l from-violet-400/30 to-transparent" />
              <span className="flex items-center gap-1.5 text-sm text-violet-400/70 whitespace-nowrap">
                <GraduationCap className="w-4 h-4" />
                University of Cincinnati &apos;27
              </span>
              <div className="flex-1 max-w-[40px] h-px bg-gradient-to-r from-violet-400/30 to-transparent" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mt-4 mb-5">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="font-bold text-white">{formatNumber(20500)}</div>
                <div className="text-xs text-zinc-500">Total Reach</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-pink-900/30 rounded-xl flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-pink-400" />
                </div>
                <div className="font-bold text-white">5.4%</div>
                <div className="text-xs text-zinc-500">Engagement</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div className="font-bold text-white">{formatNumber(8000)}</div>
                <div className="text-xs text-zinc-500">Avg Reach</div>
              </div>
            </div>

            {/* Social channels */}
            <div className="space-y-3 mt-4 text-left">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm font-semibold text-zinc-400 whitespace-nowrap">Social Channels</span>
                <div className="flex-1 h-px bg-gradient-to-r from-violet-500/40 to-transparent" />
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-xl border border-purple-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Instagram</div>
                    <div className="text-xs text-zinc-400">@jordan.smith</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">19.0K</div>
                  <div className="text-xs text-zinc-500">followers</div>
                </div>
              </div>

              {/* TikTok */}
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-black">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">TikTok</div>
                    <div className="text-xs text-zinc-400">@jordan.smith</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">1.2K</div>
                  <div className="text-xs text-zinc-500">followers</div>
                </div>
              </div>

              {/* X */}
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-xl border border-blue-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-black">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">X (Twitter)</div>
                    <div className="text-xs text-zinc-400">@jordan.smith</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">300</div>
                  <div className="text-xs text-zinc-500">followers</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-600 text-center mt-4 mb-2">Flip to see featured content, awards &amp; press</p>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div
          className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]"
          style={{ WebkitBackfaceVisibility: "hidden" }}
        >
          <div
            className="relative flex flex-col h-full rounded-2xl bg-zinc-900 overflow-hidden cursor-pointer"
            style={{ boxShadow: "inset 0 0 0 1.5px rgba(139,92,246,0.5), 0 0 40px rgba(124,58,237,0.15)" }}
            onClick={() => setIsFlipped(false)}
          >
          {/* Top-right flip icon — absolute inside the relative inner div, stays fixed */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false) }}
            className="group absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white/60 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          <div className="flex-1 px-6 pt-10 pb-3 space-y-7">

            {/* Featured Content */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Camera className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm font-bold text-white whitespace-nowrap">Featured Content</span>
                <div className="flex-1 h-px bg-gradient-to-r from-violet-500/40 to-transparent" />
              </div>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6">
                {featuredContent.map((item) => (
                  <div key={item.title} className="snap-start shrink-0 w-[180px] rounded-xl overflow-hidden border border-zinc-800">
                    <div className="h-32 bg-gradient-to-br from-violet-900/50 to-blue-900/40 flex items-center justify-center relative">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <Link2 className="w-4 h-4 text-white/60" />
                      </div>
                      <span className="absolute bottom-2 right-2 text-[10px] bg-black/50 text-white/70 px-1.5 py-0.5 rounded">{item.type}</span>
                    </div>
                    <div className="bg-zinc-800/60 px-2.5 py-2 flex flex-col gap-1">
                      <p className="text-xs text-white/70 font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2.5 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {item.engagement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Awards & Honors */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm font-bold text-white whitespace-nowrap">Awards & Honors</span>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/40 to-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                {awards.map((a) => (
                  <div key={a.title} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-900/10 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-white">{a.title}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Press Articles */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Newspaper className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm font-bold text-white whitespace-nowrap">Press Coverage</span>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/40 to-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                {pressArticles.map((a) => (
                  <div key={a.title} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-blue-900/10 border border-blue-500/20">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{a.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Contact CTA */}
          <div className="px-6 py-4">
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-full py-2.5 flex items-center gap-2 justify-center bg-gradient-to-r from-violet-600 to-blue-500 hover:opacity-90 transition-opacity"
            >
              <span className="text-sm font-semibold text-white">Contact</span>
            </button>
          </div>
          </div>
        </div>

      </div>
    </div>
  )
}
