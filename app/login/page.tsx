"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import Header from "@/components/Header"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [resetSent, setResetSent] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
        } else {
            const { data: profile } = await supabase.from("profiles").select("id, username").eq("id", data.user.id).single()
            if (profile?.username) {
                router.push(`/profile/${profile.username}`)
            } else {
                router.push("/profile/create")
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Enter your email above first.")
            return
        }
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })
        setResetSent(true)
        setResendCooldown(15)
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-md w-full max-w-md dark:bg-zinc-900 dark:border-zinc-700">

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Welcome back
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Sign in to your NIL Card account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null) }}
                            required
                        />
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                                className="pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 rounded-md bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium hover:from-violet-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="flex flex-col items-center mt-3 gap-1">
                        {resetSent ? (
                            <>
                                <p className="text-sm text-green-500">Check your email for a reset link.</p>
                                {resendCooldown > 0 ? (
                                    <p className="text-xs text-zinc-400">Resend available in {resendCooldown}s</p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-xs text-violet-500 hover:text-violet-600 transition-colors"
                                    >
                                        Didn't receive it? Resend email
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-violet-500 hover:text-violet-600 transition-colors"
                            >
                                Forgot password?
                            </button>
                        )}
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-700 my-6" />

                    <div className="text-center">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                            Don&#39;t have an account?
                        </p>
                        <Link
                            href="/signup"
                            className="block w-full py-2 rounded-md border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    )
}
