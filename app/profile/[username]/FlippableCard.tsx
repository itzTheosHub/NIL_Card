"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Eye, Users, TrendingUp, Camera, Video, Package, Calendar, Award, Share2, BadgeCheck,
     GraduationCap, ExternalLink, ImagePlus, ImagePlay, MessageSquareQuote, Youtube, RotateCcw, Star, Newspaper, Sparkles } from "lucide-react"
import ContactSection from "./ContactSection"

function formatNumber(num: number | null): string {
    if (num == null) return "—"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
}

function formatEngagement(num: number | null): string {
    if (num == null) return "—"
    return `${num}%`
}

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
    "Ambassador": Award
}

const tagColors = [
    { text: "text-violet-400", border: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.08)" },
    { text: "text-purple-400", border: "rgba(168,85,247,0.3)", bg: "rgba(168,85,247,0.08)" },
    { text: "text-blue-400", border: "rgba(59,130,246,0.3)", bg: "rgba(59,130,246,0.08)" },
    { text: "text-indigo-400", border: "rgba(99,102,241,0.3)", bg: "rgba(99,102,241,0.08)" },
    { text: "text-cyan-400", border: "rgba(6,182,212,0.3)", bg: "rgba(6,182,212,0.08)" },
]

type Props = {
    profile: any
    socialLinks: any[]
    profileContentTags: any[]
    deliverables: any[]
    featuredPosts: any[]
    awards: any[]
    highlights: any[]
    pressArticles: any[]
}

export default function FlippableCard({ profile, socialLinks, profileContentTags, deliverables, featuredPosts, awards, highlights, pressArticles }: Props) {
    const [isFlipped, setIsFlipped] = useState(false)

    const formattedEngagement = formatEngagement(profile.engagement_rate)
    const formattedTotalFollowers = formatNumber(profile.total_followers)
    const formattedAvgViews = formatNumber(profile.avg_views)

    return (
        <div className="[perspective:1000px]">
            <div className="holographic-border rounded-2xl p-[3px]">
            <div className={`relative transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

                {/* Front Face */}
                <div 
                    className="[backface-visibility:hidden]"
                    style={{WebkitBackfaceVisibility: "hidden"}}
                >
                    <div className="relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900 transition-all duration-300">
                        {/* Flip Button */}
                        <button
                            onClick={() => setIsFlipped(true)}
                            className="group rounded-full absolute top-4 right-4 px-2 py-1 flex items-center gap-2 justify-center bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 active:bg-white/30 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 group-active:rotate-180 group-hover:rotate-180 transition-transform duration-300" />
                            <span className="text-xs font-medium">
                               Flip Card
                            </span>
                        </button>

                        {/* Profile Photo */}
                        <div className="pt-8 px-6 flex justify-center">
                            <div className="relative w-fit">
                                {profile?.profile_photo_url ? (
                                    <Image
                                        src={profile?.profile_photo_url}
                                        alt={profile.full_name}
                                        width={128}
                                        height={128}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg dark:border-zinc-900 ring-4 ring-violet-500/30"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold object-cover border-4 border-white shadow-lg dark:border-zinc-900 ring-4 ring-violet-500/30">
                                        {profile?.full_name.split(" ").map((word: string) => word[0]).join("")}
                                    </div>
                                )}
                                <BadgeCheck className="absolute bottom-2 right-2 w-6 h-6 text-violet-500 bg-white dark:bg-zinc-900 rounded-full" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="px-6 pb-6 pt-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <h1 className="text-3xl font-bold tracking-wide text-zinc-900 dark:text-white">
                                    {profile.full_name}
                                </h1>
                            </div>
                            <div className="flex items-center justify-center gap-3 mt-1">
                                <div className="flex-1 max-w-[40px] h-[2px] bg-gradient-to-l from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                                <span className="text-sm text-zinc-600 dark:text-violet-400/70 whitespace-nowrap">
                                    {profile.sport} • {profile.division}
                                </span>
                                <div className="flex-1 max-w-[40px] h-[2px] bg-gradient-to-r from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                            </div>
                            <div className="flex items-center justify-center gap-3 mt-1">
                                <div className="flex-1 max-w-[40px] h-[2px] bg-gradient-to-l from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                                <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-violet-400/70 whitespace-nowrap">
                                    <GraduationCap className="w-4 h-4 text-zinc-600 dark:text-violet-400/70" />
                                    {profile.university} &#39;{profile.graduation_year}
                                </span>
                                <div className="flex-1 max-w-[40px] h-[2px] bg-gradient-to-r from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mt-4 mb-5">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2 dark:bg-purple-900/30">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white">{formattedTotalFollowers}</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">Total Reach</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-2 dark:bg-pink-900/30">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white">{formattedEngagement}</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">Engagement Rate</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2 dark:bg-blue-900/30">
                                        <Eye className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white">{formattedAvgViews}</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">Avg Reach</div>
                                </div>
                            </div>
                            {/* Social Media Links */}
                            <div className="space-y-3 mt-4 text-left">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Social Channels</span>
                                    <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/60 via-purple-400/40 to-transparent" />
                                </div>
                                {socialLinks?.map((link) => {
                                    let containerClass = ""
                                    let iconBg = ""
                                    let iconSvg = null
                                    let label = link.platform
                                    let hoverColor = ""
                                    let linkUrl = ""

                                    if (link.platform === "instagram") {
                                        containerClass = "from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 border-purple-100 dark:border-purple-800"
                                        iconBg = "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
                                        label = "Instagram"
                                        hoverColor = "group-hover:text-purple-600 dark:group-hover:text-purple-400"
                                        linkUrl = `https://instagram.com/${link.url}`
                                        iconSvg = (
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                        )
                                    } else if (link.platform === "tiktok") {
                                        containerClass = "from-zinc-50 to-zinc-100 hover:from-zinc-100 hover:to-zinc-200 dark:from-zinc-800/50 dark:to-zinc-700/50 dark:hover:from-zinc-800 dark:hover:to-zinc-700 border-zinc-200 dark:border-zinc-700"
                                        iconBg = "bg-black"
                                        label = "TikTok"
                                        hoverColor = "group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                                        linkUrl = `https://tiktok.com/@${link.url}`
                                        iconSvg = (
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                                            </svg>
                                        )
                                    } else if (link.platform === "twitter" || link.platform === "x") {
                                        containerClass = "from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20 dark:hover:from-blue-900/30 dark:hover:to-sky-900/30 border-blue-100 dark:border-blue-800"
                                        iconBg = "bg-black"
                                        label = "X (Twitter)"
                                        hoverColor = "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                        linkUrl = `https://x.com/${link.url}`
                                        iconSvg = (
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                            </svg>
                                        )
                                    } else {
                                        containerClass = "from-zinc-50 to-zinc-100 hover:from-zinc-100 hover:to-zinc-200 dark:from-zinc-800/50 dark:to-zinc-700/50 dark:hover:from-zinc-800 dark:hover:to-zinc-700 border-zinc-200 dark:border-zinc-700"
                                        iconBg = "bg-zinc-600"
                                        hoverColor = "group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                                        iconSvg = <ExternalLink className="w-5 h-5 text-white" />
                                        linkUrl = link.url
                                    }

                                    return (
                                        <a
                                            key={link.id}
                                            className={`flex items-center justify-between p-3 bg-gradient-to-r rounded-xl transition-all group border ${containerClass}`}
                                            href={linkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                                                    {iconSvg}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">{label}</div>
                                                    <div className="text-xs text-zinc-600 dark:text-zinc-400">@{link.url}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <div className="font-semibold text-zinc-900 dark:text-white">{formatNumber(link.follower_count ?? null)}</div>
                                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">followers</div>
                                                </div>
                                                <ExternalLink className={`w-4 h-4 text-zinc-400 transition-colors ${hoverColor}`} />
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="px-6 pt-2 pb-6">
                            <div className="flex items-center gap-4 mb-3">
                                <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">About</h2>
                                <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/60 via-purple-400/40 to-transparent" />
                            </div>
                            <p className="text-gray-700 leading-relaxed dark:text-zinc-300">{profile.bio}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {profileContentTags?.map((tag, index) => {
                                    const color = tagColors[index % tagColors.length]
                                    return (
                                    <span
                                        key={tag.tag_id}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border hover:scale-105 transition-all cursor-pointer ${color.text}`}
                                        style={{ backgroundColor: color.bg, borderColor: color.border }}
                                    >
                                        {(tag.content_tags as any)?.name}
                                    </span>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Partnership Deliverables Section */}
                        <div className="px-6 pt-2 pb-1">
                            <div className="flex items-center gap-4 mb-3">
                                <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Partnership Deliverables</h2>
                                <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/60 via-purple-400/40 to-transparent" />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {deliverables?.map((deliverable) => {
                                    const name = (deliverable.deliverables as any)?.name
                                    const Icon = iconMap[name as keyof typeof iconMap] || Package
                                    return (
                                        <div key={deliverable.deliverable_id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-purple-50 hover:border-purple-200 transition-colors dark:hover:bg-purple-900/20 dark:bg-zinc-800 dark:border-zinc-700">
                                            <Icon className="w-5 h-5 text-purple-600" />
                                            <span className="text-gray-700 font-medium dark:text-zinc-300">{name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Contact Button */}
                        <div className="px-6 pt-1 pb-6">
                            <ContactSection email={profile?.email} name={profile?.full_name} />
                        </div>
                    </div>
                </div>

                {/* Back Face */}
                <div 
                    className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]"
                    style={{WebkitBackfaceVisibility: "hidden"}}
                >
                    <div className="relative flex flex-col rounded-2xl bg-white backdrop-blur-sm shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900 h-full">
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="group absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="px-6 pt-8 pb-6 space-y-6 flex-1 overflow-y-auto">

                        {featuredPosts.length === 0 && awards.length === 0 && highlights.length === 0 && pressArticles.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-violet-400" />
                                </div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">This athlete hasn't completed the back of their card yet.</p>
                            </div>
                        )}

                        {featuredPosts.length > 0 && (
                            <div>
                                {/* Featured Content Section */}
                                <div className="flex items-center gap-4 mb-3">
                                    <Camera className="w-5 h-5 text-purple-600"/>
                                    <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                        Featured Content
                                    </span>
                                    <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/60 via-purple-400/40 to-transparent" />
                                </div>
                                <div className={featuredPosts.length === 1
                                    ? "w-full"
                                    : "flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                }>
                                    {featuredPosts.slice(0, 3).map((post) => {
                                        const isSingle = featuredPosts.length === 1
                                        if (post.platform === "instagram") {
                                            const shortcode = post.url.split("/p/")[1]?.split("/")[0]
                                            return (
                                                <div
                                                    key={post.id}
                                                    className={isSingle ? "w-full h-[400px] overflow-hidden rounded-xl" : "snap-start shrink-0 w-[325px] h-[400px] overflow-hidden rounded-xl"}
                                                >
                                                    <iframe
                                                        src={`https://www.instagram.com/p/${shortcode}/embed/`}
                                                        width={isSingle ? "100%" : "325"}
                                                        height="400"
                                                        className="border-0"
                                                    />
                                                </div>
                                            )
                                        } else {
                                            const postId = post.url.split("/video/")[1]?.split("?")[0]
                                            return (
                                                <div
                                                    key={post.id}
                                                    className={isSingle ? "w-full h-[400px] overflow-hidden rounded-xl" : "snap-start shrink-0 w-[325px] h-[400px] overflow-hidden rounded-xl"}
                                                >
                                                    <iframe
                                                        src={`https://www.tiktok.com/embed/v2/${postId}`}
                                                        width={isSingle ? "100%" : "325"}
                                                        height="400"
                                                    />
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        )}

                            {/* Awards & Honors Section */}
                            {awards.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <Award className="w-5 h-5 text-yellow-600"/>
                                        <h2 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                            Awards & Honors
                                        </h2>
                                        <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/60 via-purple-400/40 to-transparent"/>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {awards.slice(0, 3).map((award) => (
                                            <div
                                                key={award.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-zinc-700 hover:border-amber-200 transition-colors"
                                            >
                                                <Star className="w-5 h-5 text-yellow-600 shrink-0" />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-gray-700 font-medium dark:text-zinc-300">
                                                        {award.title}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400">
                                                        {award.description}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Articles & Press Coverage Section */}
                            {pressArticles.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <Newspaper className="w-5 h-5 text-blue-600"/>
                                        <h2 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                            Articles & Press Coverage
                                        </h2>
                                        <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-500/60 via-purple-400/40 to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {pressArticles.slice(0, 3).map((article) => (
                                            <a
                                                key={article.id}
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-zinc-700 hover:border-blue-200 transition-colors"
                                            >
                                                <span className="text-gray-700 font-medium dark:text-zinc-300 flex-1">
                                                    {article.title}
                                                </span>
                                                <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0"/>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Highlights Section */}
                            {highlights.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <TrendingUp className="w-5 h-5 text-green-600"/>
                                        <h2 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                            Highlights
                                        </h2>
                                        <div className="flex-1 h-[2px] bg-gradient-to-r from-green-500/60 via-purple-400/40 to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {highlights.slice(0, 3).map((highlight) => (
                                            <div
                                                key={highlight.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-zinc-700 hover:border-green-200 transition-colors"
                                            >
                                                <span className="text-gray-700 font-medium dark:text-zinc-300 flex-1">
                                                    {highlight.title}
                                                </span>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setIsFlipped(false)}
                                className="group w-full rounded-full px-2 py-2 flex items-center gap-2 justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                                <span className="text-xs font-medium">Flip Card</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
