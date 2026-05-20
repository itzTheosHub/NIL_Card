import Image from "next/image"
import { Eye, Users, TrendingUp, Camera, Video,
        Package, Calendar, Award, Share2, BadgeCheck, GraduationCap, ExternalLink, ImagePlus, ImagePlay, MessageSquareQuote, Youtube, RotateCcw, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase"
import ContactSection  from "./ContactSection"
import Header from "@/components/Header"
import FlippableCard from "./FlippableCard"
import ProfileActions from "./ProfileActions"
import Link from "next/link"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const supabase = createClient()
    const { username } = await params
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("username", username).single()
    return {
        title: profile?.full_name ? `${profile.full_name} | NIL-Card` : "NIL-Card",
    }
}

export default async function ProfilePage( {params, searchParams}: { params: Promise<{ username: string }>; searchParams: Promise<{ ref?: string }> }) {

    // Fetch data with await
    // Return JSX
    const supabase = createClient()
    const { username } = await params
    const { ref } = await searchParams
    const showBack = ref === "home"
    const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

    if (!profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#08090a] text-white">
                <p className="text-white/40 text-sm">Profile not found.</p>
            </div>
        )
    }

    const { data: socialLinks } = await supabase.from("social_links").select("*").eq("profile_id", profile.id)
    const { data: profileContentTags } = await supabase.from("profile_content_tags").select("tag_id, content_tags(name)").eq("profile_id", profile.id)
    const { data: deliverables, error: deliverablesError } = await supabase.from("profile_deliverables").select("deliverable_id, deliverables(name)").eq("profile_id", profile.id)
    const {data: awards} = await supabase.from("awards").select("*").eq("profile_id", profile.id)
    const {data: featuredPosts} = await supabase.from("featured_posts").select("*").eq("profile_id", profile.id)
    const {data: highlights} = await supabase.from("highlights").select("*").eq("profile_id", profile.id)
    const {data: pressArticles} = await supabase.from("press_articles").select("*").eq("profile_id", profile.id)


    const iconMap = {
        "Instagram Post": Camera,
        "Instagram Story": ImagePlus,
        "Instagram Reel": ImagePlay,
        "TikTok Video": Video,
        "Tweet": MessageSquareQuote,
        "YouTube Video": Youtube,
        "Product Review or Unboxing": Package,
        "Social Media Takeover": Share2,
        "Appearance": Calendar,
        "Ambassador" : Award
        } 

    

    return (
        <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[100px]" />
                <div className="absolute top-1/3 -left-20 w-[300px] h-[500px] rounded-full bg-violet-600/15 blur-[90px]" />
                <div className="absolute top-1/3 -right-20 w-[300px] h-[500px] rounded-full bg-blue-500/15 blur-[90px]" />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
            </div>

            <Header hidePillNav>
                <div className="flex items-center gap-2">
                    {showBack && (
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-zinc-900/80 text-sm font-medium text-zinc-400 hover:text-white backdrop-blur-md transition-all hover:bg-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                    )}
                    <ProfileActions profileId={profile.id} username={username} />
                </div>
            </Header>

            <main className="mx-auto max-w-2xl w-full px-4 pt-24 pb-8">
                <div className="relative">
                <FlippableCard
                    profile={profile}
                    socialLinks={socialLinks ?? []}
                    profileContentTags={profileContentTags ?? []}
                    deliverables={deliverables ?? []}
                    featuredPosts={featuredPosts ?? []}
                    awards={awards ?? []}
                    highlights={highlights ?? []}
                    pressArticles={pressArticles ?? []}
                />
                </div>
            </main>
        </div>
    )
}