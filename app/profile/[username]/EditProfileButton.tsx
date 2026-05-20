"use client"

import  Link  from "next/link"
import { createClient } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Pencil } from "lucide-react"


export default function EditProfileButton({ profileId, username }: {profileId: string, username: string }){

    const supabase = createClient()
    const [isOwner, setOwner] = useState(false)

    useEffect(() => {
        async function checkOwner()
        {
            const { data: { user } } = await supabase.auth.getUser()
            setOwner(user?.id === profileId)
        }
        checkOwner()
    }, [])

    if (!isOwner){
        return null
    }

    return (
        <Link
            href={`/profile/${username}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white text-sm font-medium transition-all duration-300"
        >
            <Pencil className="w-4 h-4"/>
                Edit Card
        </Link>
    )
       
    
}