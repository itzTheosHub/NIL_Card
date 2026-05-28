"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { CheckCircle, Loader2 } from "lucide-react"
import Header from "@/components/Header"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function OnboardingBasicsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guard: skip basics if profile already exists
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      if (profile?.username) { router.replace("/onboarding/connect"); return }
      setPageLoading(false)
    }
    check()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-suggest username from full name (only until user manually edits it)
  useEffect(() => {
    if (!usernameTouched && fullName) setUsername(slugify(fullName))
  }, [fullName, usernameTouched])

  // Debounced uniqueness check
  useEffect(() => {
    if (!username) { setUsernameStatus("idle"); return }
    if (!/^[a-z0-9-]+$/.test(username)) { setUsernameStatus("invalid"); return }
    setUsernameStatus("checking")
    const timer = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle()
      setUsernameStatus(data ? "taken" : "available")
    }, 500)
    return () => clearTimeout(timer)
  }, [username]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus !== "available" || !fullName.trim()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: fullName.trim(),
      username: username.trim(),
    })

    if (insertError) {
      setError(insertError.code === "23505" ? "That username is already taken." : insertError.message)
      setLoading(false)
      return
    }

    router.push("/onboarding/connect")
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-500/15 blur-[100px] rounded-full" />
        </div>
        <Header hidePillNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </main>
      </div>
    )
  }

  const usernameHint =
    usernameStatus === "taken" ? <span className="text-red-400">That username is already taken</span> :
    usernameStatus === "invalid" ? <span className="text-amber-400">Only lowercase letters, numbers, and hyphens</span> :
    usernameStatus === "available" ? <span className="text-emerald-400">Available!</span> :
    null

  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-500/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full" />
      </div>

      <Header hidePillNav />

      <main className="flex-1 flex justify-center px-4 pt-24 pb-8 relative">
        <div className="w-full max-w-md">

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-r from-violet-600 to-blue-500 text-white">
                1
              </div>
              <span className="text-sm font-medium text-white">Basics</span>
            </div>
            <div className="w-12 h-px bg-zinc-700 mx-3" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-zinc-700 text-zinc-500">
                2
              </div>
              <span className="text-sm font-medium text-zinc-500">Connect</span>
            </div>
            <div className="w-12 h-px bg-zinc-700 mx-3" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-zinc-700 text-zinc-500">
                3
              </div>
              <span className="text-sm font-medium text-zinc-500">Profile</span>
            </div>
          </div>

          {/* Card */}
          <div
            className="bg-zinc-900 rounded-2xl p-8"
            style={{ boxShadow: "inset 0 0 0 1.5px rgba(139,92,246,0.3), 0 0 40px rgba(124,58,237,0.08)" }}
          >
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">Let&apos;s start with the basics</h1>
              <p className="text-sm text-zinc-400 mt-1">This is how brands will find and recognize you.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Full name */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Theo Colosimo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors text-sm"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
                <div className="flex items-center bg-zinc-800 border border-zinc-700/50 rounded-xl focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30 transition-colors">
                  <span className="pl-4 text-zinc-600 text-sm whitespace-nowrap select-none shrink-0">nil-card.com/</span>
                  <input
                    type="text"
                    placeholder="your-name"
                    value={username}
                    onChange={(e) => {
                      setUsernameTouched(true)
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }}
                    className="flex-1 bg-transparent py-3 pl-0.5 pr-2 text-white placeholder:text-zinc-500 focus:outline-none text-sm min-w-0"
                  />
                  <div className="pr-3 shrink-0 flex items-center h-full">
                    {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
                    {usernameStatus === "available" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {usernameStatus === "taken" && <span className="text-red-400 text-xs font-medium">Taken</span>}
                  </div>
                </div>
                <p className="text-xs mt-1.5 h-4">{usernameHint}</p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={usernameStatus !== "available" || !fullName.trim() || loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span>
                  : "Continue →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
