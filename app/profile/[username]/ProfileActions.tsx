"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Pencil, Link2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function ProfileActions({ profileId, username }: { profileId: string; username: string }) {
    const [isOwner, setIsOwner] = useState(false)
    const [copied, setCopied] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function checkOwner() {
            const { data: { user } } = await supabase.auth.getUser()
            setIsOwner(user?.id === profileId)
        }
        checkOwner()
    }, [])

    const handleCopy = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOwner) return null

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/profile/${username}/edit`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white text-sm font-semibold transition-all hover:shadow-[0_0_16px_rgba(124,58,237,0.4)]"
            >
                <Pencil className="w-4 h-4" />
                Edit
            </Link>
            <button
                onClick={handleCopy}
                title="Copy link"
                className="flex items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 py-2 px-3 backdrop-blur-md hover:bg-white/10 transition-colors"
            >
                {copied
                    ? <Check className="w-4 h-4 text-emerald-400" />
                    : <Link2 className="w-4 h-4 text-zinc-400" />
                }
            </button>
        </div>
    )
}
