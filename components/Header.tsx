"use client"

import Link  from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Sun, Moon, X, Menu } from "lucide-react"
import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {createClient} from "@/lib/supabase"

export default function Header({children}: {children?: React.ReactNode}){

    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        async function fetchUser() {
            const {data: {user}} = await supabase.auth.getUser()

            if(user){
                setUser(user)
                const {data: profile} = await supabase.from("profiles").select("username").eq("id", user.id).single()
                if(profile) setProfile(profile)
            }
            setAuthLoading(false)
        }
        fetchUser()
        }, [])

    function handleMyProfile() {
        if(!user) router.push("/login")
        else if(!profile) router.push("/profile/create")
        else router.push(`/profile/${profile.username}`)
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        router.push("/")
    }
    

    return (
        <>
        <header className="border-b border-zinc-200 bg-[rgb(252,253,255)] dark:border-zinc-800 dark:bg-zinc-900 relative z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 py-2">
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="NIL Card logo"
                        width={220}
                        height={120}
                        className="h-12 sm:h-20 w-auto dark:hidden"
                    />
                    <Image
                        src="/logo-dark.png"
                        alt="NIL Card logo"
                        width={220}
                        height={120}
                        className="h-12 sm:h-20 w-auto hidden dark:block"
                    />
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                        {mounted ? (resolvedTheme == "dark" ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>) : <div className="w-5 h-5 "/>}
                    </button>
                    {children}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>

        {/* Backdrop */}
        <div
            onClick={() => setMenuOpen(false)}
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />

        {/* Side drawer */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-zinc-900 z-50 shadow-2xl flex flex-col transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Menu</span>
                <button
                    onClick={() => setMenuOpen(false)}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <nav className="flex flex-col px-5 py-5 gap-5 text-sm font-medium flex-1">
                <Link href="/" onClick={() => setMenuOpen(false)} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">Home</Link>
                <Link href="/marketplace" onClick={() => setMenuOpen(false)} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">Marketplace</Link>
                {authLoading ? (
                    <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                ) : (
                    <button onClick={() => { setMenuOpen(false); handleMyProfile() }} className="text-left text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">My Profile</button>
                )}
                {!authLoading && (
                    <>
                        <div className="border-t border-zinc-200 dark:border-zinc-800" />
                        {user ? (
                            <button onClick={() => { setMenuOpen(false); handleSignOut() }} className="text-left text-red-500 hover:text-red-600 transition">Sign Out</button>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">Sign In</Link>
                                <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-md bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium text-center py-2 px-4">Get Started</Link>
                            </>
                        )}
                    </>
                )}
            </nav>
        </div>
        </>
    )
}