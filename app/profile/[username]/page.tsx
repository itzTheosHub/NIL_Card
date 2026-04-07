import Image from "next/image"
import { Eye, Users, TrendingUp, Camera, Video,
        Package, Calendar, Award, Share2, BadgeCheck, GraduationCap, ExternalLink, ImagePlus, ImagePlay, MessageSquareQuote, Youtube, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase"
import ContactSection  from "./ContactSection"
import EditProfileButton from "./EditProfileButton"
import Header from "@/components/Header"
import FlippableCard from "./FlippableCard"


export default async function ProfilePage( {params}: { params: Promise<{ username: string }> }) {

    // Fetch data with await
    // Return JSX
    const supabase = createClient()
    const { username } = await params
    const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

    if (!profile)
    {
        return <div>Profile not found</div>
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
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <Header>
                <EditProfileButton profileId={profile.id} username={username}/>
            </Header>

            <main className="mx-auto max-w-2xl px-4 py-8">
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
            </main>
        </div>
    )
}