"use client"

import { useState, useRef, useCallback } from "react"
import { Sparkles, X, Info, Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SocialLink = {
    platform: string,
    username: string,
    followers: number | ""
}

type FormData = {
    fullName: string,
    bio: string,
    school: string,
    sport: string,
    gradYear: string,
    division: string,
    engagementRate: string,
    avgViews: string,
    username: string
    profilePhotoUrl: string,
}

type EditProfileFormProps = {
  initialFormData?: FormData
  initialSocialLinks?: SocialLink[]
  initialTags?: string[]
  initialDeliverables?: string[]
  initialFeaturedPosts?: FeaturedPost[]
  initialAwards?: Award[]
  initialHighlights?: Highlight[]
  initialPressArticles?: PressArticle[]

  onSubmit: (payload:
              { formData: FormData;
                socialLinks: SocialLink[];
                tags: string[];
                deliverables: string[];
                profilePhotoFile?: File | null;
                featuredPosts: FeaturedPost[];
                awards: Award[];
                highlights: Highlight[];
                pressArticles: PressArticle[];
              }
            ) => Promise<void>

  submitLabel: string
  loadingLabel: string
  pageTitle: string
  pageSubtitle: string

}

type FeaturedPost = {
  url: string;
  platform: string,
  caption: string
}

type Award = {
  title: string;
  description: string;
}

type Highlight = {
  title: string;
  description: string;
}

type PressArticle = {
  url: string;
  title: string;
}

// Format number to K/M notation
function formatFollowers(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function detectPlatform(url: string): string | null {
  if (url.includes("instagram.com")) return "instagram"
  if (url.includes("tiktok.com")) return "tiktok"
  if (url.includes("twitter.com") || url.includes("x.com")) return "x"
  return null
}

const availableSports = [
    "Baseball", "Basketball", "Cross Country", "Diving", "Fencing",
    "Field Hockey", "Football", "Golf", "Gymnastics", "Ice Hockey",
    "Lacrosse", "Rowing", "Soccer", "Softball", "Swimming",
    "Tennis", "Track & Field", "Volleyball", "Water Polo", "Wrestling",
]

const gradYears = Array.from({ length: 6 }, (_, i) => String(2026 + i))

const availableTags = [
    "Fitness", "Health", "Travel", "Fashion", "Food",
    "Lifestyle", "Music", "Sports", "Training", "Gaming"
  ]

const availableDeliverables = [
    "Instagram Post", "Instagram Story", "Instagram Reel",
    "TikTok Video", "Tweet", "Youtube Video", "Product Review or Unboxing", "Social Media Takeover","Event Appearance", "Brand Ambassador"
]

const inputClasses = "w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors text-sm"
const labelClasses = "block text-sm font-medium text-zinc-300 mb-1.5"

export default function EditProfilePage({initialFormData, initialSocialLinks, initialTags, initialDeliverables, initialFeaturedPosts, initialAwards, initialHighlights, initialPressArticles ,onSubmit, submitLabel, loadingLabel, pageTitle, pageSubtitle}: EditProfileFormProps) {
  const [formData, setFormData] = useState(initialFormData ??{
    fullName: "",
    bio: "[Sport] athlete at [School]. I create content around [topic] and [topic], and I'm passionate about building my brand both on and off the field. With a growing audience across social media, I love connecting with brands that align with my values and lifestyle. Open to partnerships in [industry] and [industry].",
    school: "",
    sport: "",
    gradYear: "",
    division: "",
    engagementRate: "",
    avgViews: "",
    username: "",
    profilePhotoUrl: "",
  })

  const [socialLinks, setSocialLinks] = useState(initialSocialLinks ?? [])
  const [selectedTags, setSelectedTags] = useState(initialTags ?? [])
  const [selectedDeliverables, setSelectedDeliverables] = useState(initialDeliverables ?? [])
  const [customTag, setCustomTag] = useState("")
  const [customDeliverable, setCustomDeliverable] = useState("")
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)
  const [showCustomDeliverableInput, setShowCustomDeliverableInput] = useState(false)
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(!!initialFormData?.username)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Back of the card variables
  const [showBackOfCard, setShowBackOfCard] = useState(false)
  const [awards, setAwards] = useState<Award[]>(initialAwards ?? [])
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights ?? [])
  const [pressArticles, setPressArticles] = useState<PressArticle[]>(initialPressArticles ?? [])
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>(initialFeaturedPosts ?? [])

  // Animation var
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Toggle deliverable selection
  const toggleDeliverable = (deliverable: string) => {
    setSelectedDeliverables(prev =>
      prev.includes(deliverable) ? prev.filter(d => d !== deliverable) : [...prev, deliverable]
    )
  }

  // Add custom tag
  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()])
      setCustomTag("")
      setShowCustomTagInput(false)
    }
  }

  // Add custom deliverable
  const addCustomDeliverable = () => {
    if (customDeliverable.trim() && !selectedDeliverables.includes(customDeliverable.trim())) {
      setSelectedDeliverables(prev => [...prev, customDeliverable.trim()])
      setCustomDeliverable("")
      setShowCustomDeliverableInput(false)
    }
  }

  // Calculate total followers from social links
  const totalFollowers = socialLinks.reduce((sum, link) => {
    return sum + (typeof link.followers === "number" ? link.followers : 0)
  }, 0)

  // Update a social link at a specific index
  const updateSocialLink = (index: number, field: keyof SocialLink, value: string | number) => {
    const updated = [...socialLinks]
    if (field === "followers") {
      updated[index][field] = value === "" ? "" : Number(value)
    } else {
      updated[index][field] = value as string
    }
    setSocialLinks(updated)
  }

  // Remove a social link at a specific index
  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try
    {
        await onSubmit({ formData,
                          socialLinks,
                          tags: selectedTags,
                          deliverables: selectedDeliverables,
                          profilePhotoFile: profilePhotoFile,
                          featuredPosts,
                          awards,
                          highlights,
                          pressArticles
                        })
    } catch (err:any) {
        setError(err.message)
    }
    setLoading(false)

  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-500/15 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full" />
        </div>

        <Header hidePillNav />

        <main className="flex-1 flex justify-center px-4 pt-24 pb-8 relative">
          <div className="w-full max-w-2xl">
            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-500 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {pageTitle}
              </h1>
              <p className="text-zinc-400">
                {pageSubtitle}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-0 mb-2">
              <button type="button" onClick={() => setShowBackOfCard(false)} className="flex items-center gap-2 group">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${!showBackOfCard ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white" : "border border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300"}`}>
                  1
                </div>
                <span className={`text-sm font-medium transition-colors ${!showBackOfCard ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>Front of Card</span>
              </button>
              <div className="w-12 h-px bg-zinc-700 mx-3" />
              <button type="button" onClick={() => setShowBackOfCard(true)} className="flex items-center gap-2 group">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${showBackOfCard ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white" : "border border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300"}`}>
                  2
                </div>
                <span className={`text-sm font-medium transition-colors ${showBackOfCard ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>Back of Card</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Top action bar */}
              <div className="flex items-center justify-between">
                <Link
                  href={formData.username ? `/profile/${formData.username}` : "/"}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white text-sm font-semibold transition-all hover:shadow-[0_0_16px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? loadingLabel : submitLabel}
                </button>
              </div>

              {!showBackOfCard && (
              <div
                className={`bg-zinc-900 rounded-2xl p-6 space-y-6 ${isTransitioning ? "animate-fade-slide-out" : ""}`}
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
              >
                {/*ProfilePhotUrl Field*/}
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 p-0.5 cursor-pointer mx-auto"
                       onClick={() => fileInputRef.current?.click()}>
                    <div className="relative group rounded-full w-24 h-24 bg-zinc-800 overflow-hidden flex items-center justify-center">
                      {profilePhotoFile ? (
                        <img src={URL.createObjectURL(profilePhotoFile)}
                         className="w-full h-full object-cover"
                         alt="Profile Photo"/>
                      ): formData.profilePhotoUrl ? (
                        <img src={formData.profilePhotoUrl}
                         className="w-full h-full object-cover"
                         alt="Profile Photo"
                         />
                      ) : (
                        <Camera className="w-8 h-8 text-zinc-400"/>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm cursor-pointer font-semibold text-zinc-500"
                     onClick={() => fileInputRef.current?.click()}>
                    {profilePhotoFile || formData.profilePhotoUrl ? "Change Photo" : "Upload Photo"}
                  </p>
                </div>

                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">
                    Basic Info
                  </h2>

                  <div>
                    <label htmlFor="fullName" className={labelClasses}>Full Name *</label>
                    <input
                      id="fullName"
                      className={inputClasses}
                      value={formData.fullName}
                      onChange={(e) => {
                        const newName = e.target.value
                        setFormData({
                          ...formData,
                          fullName: newName,
                          ...(!usernameManuallyEdited ? {username: generateSlug(newName) } :{})
                        })
                      }}
                      placeholder="Maya Chen"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className={labelClasses}>Username *</label>
                    <input
                      id="username"
                      className={inputClasses}
                      value={formData.username}
                      onChange={(e) => {
                        setUsernameManuallyEdited(true)
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })

                      }}
                      placeholder="maya-chen"
                    />
                    {formData.username && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Your profile URL: nil-card.com/profile/{formData.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="bio" className="text-sm font-medium text-zinc-300">Bio</label>
                      <span className={`text-xs ${formData.bio.length > 360 ? "text-red-400" : "text-zinc-500"}`}>
                        {formData.bio.length}/400
                      </span>
                    </div>
                    <textarea
                      id="bio"
                      rows={4}
                      maxLength={400}
                      className={`${inputClasses} resize-none`}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Point guard passionate about community outreach"
                    />
                    <p className="text-sm text-zinc-500 mt-1">Replace the bracketed parts with your own details.</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* School Info Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">
                    School Info
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="school" className={labelClasses}>School *</label>
                      <input
                        id="school"
                        className={inputClasses}
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        placeholder="USC"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="sport" className={labelClasses}>Sport *</label>
                      <select
                        id="sport"
                        className={inputClasses}
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        required
                      >
                        <option value="" disabled>Select sport</option>
                        {availableSports.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="gradYear" className={labelClasses}>Grad Year</label>
                      <select
                        id="gradYear"
                        className={inputClasses}
                        value={formData.gradYear}
                        onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                      >
                        <option value="" disabled>Select year</option>
                        {gradYears.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="division" className={labelClasses}>Division</label>
                      <select
                        id="division"
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="">Select division</option>
                        <option value="Division I">Division I</option>
                        <option value="Division II">Division II</option>
                        <option value="Division III">Division III</option>
                        <option value="NAIA">NAIA</option>
                        <option value="JUCO">JUCO</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Social Links Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">
                    Social Links
                  </h2>

                  {/* Added social links */}
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
                      <div className="w-full sm:w-24">
                        <label className={labelClasses}>Platform</label>
                        <div className="py-3 px-3 flex items-center rounded-xl bg-zinc-800 text-sm font-medium text-zinc-300 capitalize">
                          {link.platform}
                        </div>
                      </div>

                      <div className="flex-1">
                        <label className={labelClasses}>Username or URL</label>
                        <input
                          className={inputClasses}
                          value={link.username}
                          onChange={(e) => {
                            const val = e.target.value
                            const detected = detectPlatform(val)
                            if (detected) {
                              const updated = [...socialLinks]
                              updated[index] = { ...updated[index], username: val, platform: detected }
                              setSocialLinks(updated)
                            } else {
                              updateSocialLink(index, "username", val)
                            }
                          }}
                          placeholder="@yourhandle or paste a profile URL"
                        />
                      </div>

                      <div className="w-full sm:w-28">
                        <label className={labelClasses}>Followers</label>
                        <input
                          type="number"
                          min="0"
                          className={inputClasses}
                          value={link.followers}
                          onChange={(e) => updateSocialLink(index, "followers", e.target.value)}
                          placeholder="50000"
                        />
                        <p className="text-xs mt-1 h-4">
                          {typeof link.followers === "number" && link.followers < 0
                            ? <span className="text-red-400">Can't be negative.</span>
                            : typeof link.followers === "number" && link.followers > 0
                            ? <span className="text-zinc-500">= {formatFollowers(link.followers)}</span>
                            : null}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-2 mb-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add platform buttons */}
                  <div>
                    <label className={labelClasses}>Add a platform</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSocialLinks([...socialLinks, { platform: "instagram", username: "", followers: "" }])}
                        className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        + Instagram
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialLinks([...socialLinks, { platform: "tiktok", username: "", followers: "" }])}
                        className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        + TikTok
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialLinks([...socialLinks, { platform: "x", username: "", followers: "" }])}
                        className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        + X
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialLinks([...socialLinks, { platform: "other", username: "", followers: "" }])}
                        className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        + Other
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Stats Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">
                    Your Stats
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total Followers - Auto-calculated */}
                    <div>
                      <label className={labelClasses}>Total Followers</label>
                      <div className="py-3 px-3 flex items-center rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-sm font-medium text-zinc-300">
                        {totalFollowers > 0 ? formatFollowers(totalFollowers) : "—"}
                      </div>
                      <p className="text-sm text-zinc-500 mt-1">Auto-calculated</p>
                    </div>

                    {/* Engagement Rate - with tooltip */}
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <label htmlFor="engagementRate" className="text-sm font-medium text-zinc-300">Engagement Rate</label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Find this in Instagram Insights or TikTok Analytics under "Engagement Rate" or calculate: (likes + comments) / followers × 100</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <input
                        id="engagementRate"
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClasses}
                        value={formData.engagementRate}
                        onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                        placeholder="4.5"
                      />
                      {(() => {
                        const v = parseFloat(formData.engagementRate)
                        if (isNaN(v) || formData.engagementRate === "") return null
                        if (v > 100) return <p className="text-xs text-red-400 mt-1">Engagement rate can't exceed 100%.</p>
                        if (v > 0 && v < 1 && totalFollowers > 1000) return <p className="text-xs text-yellow-400 mt-1">Did you mean {(v * 100).toFixed(1)}%? Enter as a percentage (e.g. 4.5, not 0.045).</p>
                        if (v > 30) return <p className="text-xs text-yellow-400 mt-1">This seems high — double-check your analytics.</p>
                        return <p className="text-xs text-zinc-500 mt-1">= {v}%</p>
                      })()}
                    </div>

                    {/* Avg Views - with tooltip */}
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <label htmlFor="avgViews" className="text-sm font-medium text-zinc-300">Avg Views</label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Find this in TikTok Analytics or Instagram Reels Insights. Look for "Average views per video" in the last 28 days.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <input
                        id="avgViews"
                        type="number"
                        min="0"
                        className={inputClasses}
                        value={formData.avgViews}
                        onChange={(e) => setFormData({ ...formData, avgViews: e.target.value })}
                        placeholder="10000"
                      />
                      {(() => {
                        const v = parseInt(formData.avgViews)
                        if (isNaN(v) || formData.avgViews === "") return null
                        if (v < 0) return <p className="text-xs text-red-400 mt-1">Can't be negative.</p>
                        if (totalFollowers > 0 && v > totalFollowers) return <p className="text-xs text-red-400 mt-1">Avg views can't exceed your total followers ({formatFollowers(totalFollowers)}).</p>
                        return <p className="text-xs text-zinc-500 mt-1">= {formatFollowers(v)}</p>
                      })()}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Content Tags Section */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Content Focus
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Select the topics you create content about
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Predefined tags */}
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}

                    {/* Custom tags (user-added) */}
                    {selectedTags
                      .filter(tag => !availableTags.includes(tag))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                        >
                          {tag} ✕
                        </button>
                      ))}

                    {/* Add Other button / input */}
                    {showCustomTagInput ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                          placeholder="Enter tag..."
                          className="h-8 w-32 text-sm bg-zinc-800 border border-zinc-700/50 rounded-lg px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={addCustomTag}
                          className="text-sm text-zinc-300 hover:text-white transition-colors px-2"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomTagInput(false)}
                          className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCustomTagInput(true)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-violet-500 hover:text-violet-400 transition-colors"
                      >
                        + Other
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Deliverables Section */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Partnership Deliverables
                    </h2>
                    <p className="text-sm text-zinc-500">
                      What can you offer brands?
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Predefined deliverables */}
                    {availableDeliverables.map((deliverable) => (
                      <button
                        key={deliverable}
                        type="button"
                        onClick={() => toggleDeliverable(deliverable)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedDeliverables.includes(deliverable)
                            ? "text-white bg-gradient-to-r from-violet-600 to-blue-500"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {deliverable}
                      </button>
                    ))}

                    {/* Custom deliverables (user-added) */}
                    {selectedDeliverables
                      .filter(d => !availableDeliverables.includes(d))
                      .map((deliverable) => (
                        <button
                          key={deliverable}
                          type="button"
                          onClick={() => toggleDeliverable(deliverable)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                        >
                          {deliverable} ✕
                        </button>
                      ))}

                    {/* Add Other button / input */}
                    {showCustomDeliverableInput ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={customDeliverable}
                          onChange={(e) => setCustomDeliverable(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomDeliverable())}
                          placeholder="Enter deliverable..."
                          className="h-8 w-40 text-sm bg-zinc-800 border border-zinc-700/50 rounded-lg px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={addCustomDeliverable}
                          className="text-sm text-zinc-300 hover:text-white transition-colors px-2"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomDeliverableInput(false)}
                          className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCustomDeliverableInput(true)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-violet-500 hover:text-violet-400 transition-colors"
                      >
                        + Other
                      </button>
                    )}
                  </div>
                </div>

              </div>
              )}

              {/* Skip or Submit Button */}

              {!showBackOfCard ? (

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setShowBackOfCard(true)
                        setIsTransitioning(false)
                      }, 400)
                    }}
                    className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                  >
                    Customize back of card
                  </button>
                  <p className="text-xs text-zinc-500 text-center">
                    Optional — skip this step and come back later
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? loadingLabel : submitLabel}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-slide-in">

                  {/* Featured Posts */}
                  <div
                    className="bg-zinc-900 rounded-2xl p-6 space-y-4"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                  >
                    <h2 className="text-lg font-semibold text-white">
                      Featured Posts
                    </h2>
                    {featuredPosts.map((post, index) => (
                      <div key={index} className="flex flex-col gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-500">Post {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => setFeaturedPosts(featuredPosts.filter((_, i) => i !== index))}
                            className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          placeholder="Paste post URL"
                          className={inputClasses}
                          value={post.url}
                          onChange={(e) => {
                            const val = e.target.value
                            const detected = detectPlatform(val)
                            setFeaturedPosts(prev => {
                              const updated = [...prev]
                              updated[index] = {
                                ...updated[index],
                                url: val,
                                ...(detected ? { platform: detected } : {})
                              }
                              return updated
                            })
                          }}
                          onBlur={async (e) => {
                            const url = e.target.value
                            if (!url) return
                            try {
                              const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(url)}`)
                              const data = await res.json()
                              if (data.resolvedUrl) {
                                setFeaturedPosts(prev => {
                                  const updated = [...prev]
                                  updated[index] = { ...updated[index], url: data.resolvedUrl }
                                  return updated
                                })
                              }
                            } catch {}
                          }}
                        />
                        <div className="flex gap-2">
                          {[
                            { value: "tiktok", label: "TikTok" },
                            { value: "instagram", label: "Instagram" },
                            { value: "x", label: "X / Twitter" },
                          ].map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setFeaturedPosts(prev => {
                                  const updated = [...prev]
                                  updated[index] = { ...updated[index], platform: value }
                                  return updated
                                })
                              }}
                              className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
                                post.platform === value
                                  ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <input
                          placeholder="Caption (optional)"
                          className={inputClasses}
                          value={post.caption}
                          onChange={(e) => {
                            const val = e.target.value
                            setFeaturedPosts(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], caption: val }
                              return updated
                            })
                          }}
                        />
                      </div>
                    ))}
                    {featuredPosts.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setFeaturedPosts([...featuredPosts, {url: "", platform: "tiktok", caption: ""}])}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                      >
                        + Add Featured Post
                      </button>
                    )}
                    {featuredPosts.length >= 3 && (
                      <p className="text-xs text-zinc-500">Maximum 3 featured posts reached.</p>
                    )}
                  </div>

                  {/* Awards */}
                  <div
                    className="bg-zinc-900 rounded-2xl p-6 space-y-4"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                  >
                    <h2 className="text-lg font-semibold text-white">
                      Awards
                    </h2>
                    {awards.map((award, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <input
                          placeholder="Title (e.g. All-Conference 2025)"
                          className={inputClasses}
                          value={award.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setAwards(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], title: val }
                              return updated
                            })
                          }} />
                        <textarea
                          placeholder="Description"
                          rows={2}
                          className={`${inputClasses} resize-none`}
                          value={award.description}
                          onChange={(e) => {
                            const val = e.target.value
                            setAwards(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], description: val }
                              return updated
                            })
                          }} />
                        <button
                          type="button"
                          onClick={() => setAwards(awards.filter((_, i) => i !== index))}
                          className="text-sm text-zinc-500 hover:text-red-400 transition-colors self-start"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {awards.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setAwards([...awards, { title: "", description: "" }])}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                      >
                        + Add Award
                      </button>
                    )}
                    {awards.length >= 3 && (
                      <p className="text-xs text-zinc-500">Maximum 3 awards reached.</p>
                    )}
                  </div>

                  {/* Highlights */}
                  <div
                    className="bg-zinc-900 rounded-2xl p-6 space-y-4"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                  >
                    <h2 className="text-lg font-semibold text-white">
                      Highlights
                    </h2>
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <input
                          placeholder="Title (e.g. 1,000 career points)"
                          className={inputClasses}
                          value={highlight.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setHighlights(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], title: val }
                              return updated
                            })
                          }} />
                        <textarea
                          placeholder="Description"
                          rows={2}
                          className={`${inputClasses} resize-none`}
                          value={highlight.description}
                          onChange={(e) => {
                            const val = e.target.value
                            setHighlights(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], description: val }
                              return updated
                            })
                          }} />
                        <button
                          type="button"
                          onClick={() => setHighlights(highlights.filter((_, i) => i !== index))}
                          className="text-sm text-zinc-500 hover:text-red-400 transition-colors self-start"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {highlights.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setHighlights([...highlights, { title: "", description: "" }])}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                      >
                        + Add Highlight
                      </button>
                    )}
                    {highlights.length >= 3 && (
                      <p className="text-xs text-zinc-500">Maximum 3 highlights reached.</p>
                    )}
                  </div>

                  {/* Articles */}
                  <div
                    className="bg-zinc-900 rounded-2xl p-6 space-y-4"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                  >
                    <h2 className="text-lg font-semibold text-white">
                      Articles
                    </h2>
                    {pressArticles.map((article, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <input
                          placeholder="Title (e.g. ESPN: Player Named All-American)"
                          className={inputClasses}
                          value={article.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setPressArticles(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], title: val }
                              return updated
                            })
                          }} />
                        <input
                          placeholder="url"
                          className={inputClasses}
                          value={article.url}
                          onChange={(e) => {
                            const val = e.target.value
                            setPressArticles(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], url: val }
                              return updated
                            })
                          }} />
                        <button
                          type="button"
                          onClick={() => setPressArticles(pressArticles.filter((_, i) => i !== index))}
                          className="text-sm text-zinc-500 hover:text-red-400 transition-colors self-start"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {pressArticles.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setPressArticles([...pressArticles, { url: "", title: "" }])}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                      >
                        + Add Article
                      </button>
                    )}
                    {pressArticles.length >= 3 && (
                      <p className="text-xs text-zinc-500">Maximum 3 articles reached.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? loadingLabel : submitLabel}
                  </button>

                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </form>
          </div>
        </main>

      </div>
    </TooltipProvider>
  )
}
