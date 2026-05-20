"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

export default function ForBrandsHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 flex items-center px-6">
        {/* Logo — flex-1 so it balances the right side for true pill centering */}
        <div className="flex-1">
        <Link href="/" className="flex items-center opacity-90 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all">
          <svg
            width="165"
            height="34"
            viewBox="0 0 165 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="NIL Card"
            className="w-[110px] md:w-[165px] h-auto"
          >
            <defs>
              <linearGradient id="nilCardGradient" x1="0" y1="0" x2="165" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#softGlow)">
              <rect x="2" y="5" width="31" height="24" rx="7" fill="#08090a" stroke="url(#nilCardGradient)" strokeWidth="1.8" />
              <circle cx="13" cy="14" r="4" fill="url(#nilCardGradient)" />
              <path d="M7.5 23.5C8.2 19.8 10.2 18 13 18C15.8 18 17.8 19.8 18.5 23.5" stroke="url(#nilCardGradient)" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 12H28" stroke="#93C5FD" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M22 17H27" stroke="#A78BFA" strokeWidth="1.7" strokeLinecap="round" opacity="0.75" />
              <path d="M25.8 23.2L27.1 24.5L30 21.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="43" y="23" fontFamily="var(--font-geist-sans), Inter, sans-serif" fontSize="19" fontWeight="850" letterSpacing="-0.9" fill="url(#nilCardGradient)">NIL</text>
            <rect x="75" y="16" width="10" height="2.4" rx="2" fill="url(#nilCardGradient)" />
            <text x="90" y="23" fontFamily="var(--font-geist-sans), Inter, sans-serif" fontSize="19" fontWeight="500" letterSpacing="-0.7" fill="#E2E8F0">Card</text>
            <path d="M44 28H128" stroke="url(#nilCardGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
          </svg>
        </Link>
        </div>

        {/* Pill toggle — always absolute centered */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center rounded-full border border-white/10 bg-zinc-900/80 p-1 backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.08),0_0_40px_rgba(59,130,246,0.05)]">
          <Link
            href="/"
            className={`rounded-full px-2 md:px-4 py-1.5 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === "/"
                ? "text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">I&apos;m an </span>Athlete
          </Link>
          <Link
            href="/for-brands"
            className={`rounded-full px-2 md:px-4 py-1.5 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              pathname.startsWith("/for-brands")
                ? "text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">I&apos;m a </span>Business
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <Link
            href="/for-brands/apply"
            className="hidden md:block rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full border border-white/10 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white backdrop-blur-md transition-all hover:bg-white/10"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Side drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-zinc-900 border-l border-white/10 z-50 shadow-2xl flex flex-col transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-semibold text-white">Menu</span>
          <button onClick={() => setMenuOpen(false)} className="text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col px-5 py-5 gap-5 text-sm font-medium">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-zinc-400 hover:text-white transition">
            I&apos;m an Athlete
          </Link>
          <Link href="/for-brands" onClick={() => setMenuOpen(false)} className="text-zinc-400 hover:text-white transition">
            I&apos;m a Business
          </Link>
          <div className="border-t border-white/10" />
          <Link
            href="/for-brands/apply"
            onClick={() => setMenuOpen(false)}
            className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium text-center py-2 px-4"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </>
  )
}
