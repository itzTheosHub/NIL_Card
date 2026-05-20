"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

function Logo() {
    return (
        <Link href="/" className="flex items-center opacity-90 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all">
            <svg width="165" height="34" viewBox="0 0 165 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NIL Card" className="w-[165px] h-auto">
                <defs>
                    <linearGradient id="signupLogoGrad" x1="0" y1="0" x2="165" y2="34" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8B5CF6" />
                        <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                    <filter id="signupLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <g filter="url(#signupLogoGlow)">
                    <rect x="2" y="5" width="31" height="24" rx="7" fill="#08090a" stroke="url(#signupLogoGrad)" strokeWidth="1.8" />
                    <circle cx="13" cy="14" r="4" fill="url(#signupLogoGrad)" />
                    <path d="M7.5 23.5C8.2 19.8 10.2 18 13 18C15.8 18 17.8 19.8 18.5 23.5" stroke="url(#signupLogoGrad)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M22 12H28" stroke="#93C5FD" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M22 17H27" stroke="#A78BFA" strokeWidth="1.7" strokeLinecap="round" opacity="0.75" />
                    <path d="M25.8 23.2L27.1 24.5L30 21.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <text x="43" y="23" fontFamily="var(--font-geist-sans), Inter, sans-serif" fontSize="19" fontWeight="850" letterSpacing="-0.9" fill="url(#signupLogoGrad)">NIL</text>
                <rect x="75" y="16" width="10" height="2.4" rx="2" fill="url(#signupLogoGrad)" />
                <text x="90" y="23" fontFamily="var(--font-geist-sans), Inter, sans-serif" fontSize="19" fontWeight="500" letterSpacing="-0.7" fill="#E2E8F0">Card</text>
                <path d="M44 28H128" stroke="url(#signupLogoGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
            </svg>
        </Link>
    )
}

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({ email, password })

        if (error) {
            setError(error.message)
        } else {
            const { data: profile } = await supabase.from("profiles").select("id, username").eq("id", data.user?.id).single()
            if (profile) {
                router.push(`/profile/${profile.username}`)
            } else {
                router.push("/profile/create")
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-[120px]" />
                <div className="absolute -top-20 -right-20 w-[450px] h-[450px] rounded-full bg-blue-500/20 blur-[120px]" />
                <div className="absolute top-1/3 -left-20 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px]" />
                <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] rounded-full bg-blue-400/10 blur-[80px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[100px]" />
            </div>

            <div className="relative flex items-center px-6 py-5">
                <Logo />
            </div>

            <main className="relative flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-md flex flex-col items-center">
                <div className="text-center mb-8">
                    <p className="text-2xl font-bold tracking-tight">
                        Build your NIL Card{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                            in minutes.
                        </span>
                    </p>
                    <p className="text-sm text-white/30 mt-2">Join athletes already getting discovered by local brands.</p>
                </div>

                <div
                    className="bg-zinc-900 rounded-2xl p-8 w-full"
                    style={{ boxShadow: "inset 0 0 0 1.5px rgba(139,92,246,0.3), 0 0 40px rgba(124,58,237,0.1)" }}
                >
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white">Create your athlete account</h1>
                        <p className="text-sm text-white/40 mt-1">Start building your NIL Card for free</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null) }}
                            required
                            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors text-sm"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                                required
                                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors text-sm [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? "Signing up..." : "Create my free card"}
                        </button>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    </form>

                    <p className="text-xs text-white/20 text-center mt-3">No credit card required.</p>

                    <div className="border-t border-white/5 my-6" />

                    <div className="text-center">
                        <p className="text-sm text-white/40 mb-3">Already have an account?</p>
                        <Link
                            href="/login"
                            className="block w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors text-center"
                        >
                            Go to sign in
                        </Link>
                    </div>
                </div>
                </div>
            </main>
        </div>
    )
}
