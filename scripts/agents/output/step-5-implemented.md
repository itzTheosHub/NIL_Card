Looking at the plan, I need to update `components/ProfileForm.tsx` to integrate `PhylloConnectSection` with an `onConnected` callback that auto-populates the stats fields. The existing file already imports `PhylloConnectSection` and `PhylloStats`, but doesn't render the component yet. I need to add it above the "Basic Info" section and wire the callback.

Let me also check: the existing `PhylloConnectSection` has an `onConnected` prop, and the `usePhylloConnect` hook has an `onConnected` callback. Since the plan says "Wire `onConnected` callback to auto-populate `total_followers`, `avg_views`, `engagement_rate` fields using the stats returned from the hook" — but `onConnected` only gives `(platform, accountId)`, not stats. The `onStatsReceived` callback gives stats. However, since `/api/phyllo/stats` doesn't exist yet (plan explicitly says not to implement it), I should wire what's available now: `onConnected` for basic connection feedback, and `onStatsReceived` for when stats eventually come in.

I'll render `PhylloConnectSection` inside the card, above "Basic Info", and wire both callbacks to populate form fields when stats arrive.

FILE: components/ProfileForm.tsx
```
"use client"

import { useState, useRef, useCallback } from "react"
import { Sparkles, X, Info, Camera } from "lucide-react"
import Header from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import PhylloConnectSection from "@/components/PhylloConnectSection"
import type {PhylloPlatform} from "@/lib/phyllo-client"
import type { PhylloStats } from "@/hooks/usePhylloConnect"

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

const availableTags = [
    "Fitness", "Health", "Travel", "Fashion", "Food",
    "Lifestyle", "Music", "Sports", "Training", "Gaming"
  ]

const availableDeliverables = [
    "Instagram Post", "Instagram Story", "Instagram Reel",
    "TikTok Video", "Tweet", "Youtube Video", "Product Review or Unboxing", "Social Media Takeover","Event Appearance", "Brand Ambassador"
]



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

  // Phyllo onStatsReceived callback — auto-populates engagement rate, avg views,
  // and updates the matching social link's follower count.
  const handlePhylloStatsReceived = useCallback(
    (platform: PhylloPlatform, stats: PhylloStats) => {
      // Auto-populate engagement rate if we got one
      if (stats.engagementRate != null) {
        setFormData((prev) => ({
          ...prev,
          engagementRate: `${stats.engagementRate}%`,
        }))
      }

      // Auto-populate avg views if we got one
      if (stats.avgViews != null) {
        setFormData((prev) => ({
          ...prev,
          avgViews: formatFollowers(stats.avgViews!),
        }))
      }

      // Update (or add) the matching social link's follower count and username
      if (stats.followers != null || stats.username != null) {
        setSocialLinks((prev) => {
          const idx = prev.findIndex((l) => l.platform === platform)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = {
              ...updated[idx],
              followers: stats.followers ?? updated[idx].followers,
              username: stats.username ? `@${stats.username}` : updated[idx].username,
            }
            return updated
          }
          // If no matching social link exists, add one
          return [
            ...prev,
            {
              platform,
              username: stats.username ? `@${stats.username}` : "",
              followers: stats.followers ?? "",
            },
          ]
        })
      }
    },
    []
  )

  // Phyllo onConnected callback — adds a social link entry for the platform if missing
  const handlePhylloConnected = useCallback(
    (platform: PhylloPlatform, _accountId: string) => {
      setSocialLinks((prev) => {
        const exists = prev.some((l) => l.platform === platform)
        if (exists) return prev
        return [...prev, { platform, username: "", followers: "" }]
      })
    },
    []
  )

  // Phyllo onDisconnected callback — optionally clear social link
  const handlePhylloDisconnected = useCallback(
    (_platform: PhylloPlatform) => {
      // We leave the social link in place so the user can still edit manually
    },
    []
  )


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
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />

        <main className="flex-1 flex justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-500 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {pageTitle}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {pageSubtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!showBackOfCard && (
              <Card className= {`overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg dark:border
                dark:border-zinc-700 dark:bg-zinc-900/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-300
                 ${isTransitioning ? "animate-fade-slide-out" : ""}`}
              >
                <CardContent className="pt-6 space-y-6">
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
                      <div className="relative group rounded-full w-24 h-24 bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
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
                    <p className="text-sm cursor-pointer font-semibold text-zinc-500 dark:text-zinc-400"
                       onClick={() => fileInputRef.current?.click()}>
                      {profilePhotoFile || formData.profilePhotoUrl ? "Change Photo" : "Upload Photo"}
                    </p>
                  </div>

                  {/* Phyllo Connect Section — connect social accounts to auto-populate stats */}
                  <PhylloConnectSection
                    onStatsReceived={handlePhylloStatsReceived}
                    onConnected={handlePhylloConnected}
                    onDisconnected={handlePhylloDisconnected}
                  />

                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Basic Info
                    </h2>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
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

                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
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
                        <p className="text-xs text-zinc-500">
                          Your profile URL: nilcard.vercel.app/profile/{formData.username}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Point guard passionate about community outreach"
                      />
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Replace the bracketed parts with your own details.</p>
                    </div>
                  </div>

                  {/* School Info Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      School Info
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="school">School *</Label>
                        <Input
                          id="school"
                          value={formData.school}
                          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                          placeholder="USC"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sport">Sport *</Label>
                        <Input
                          id="sport"
                          value={formData.sport}
                          onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                          placeholder="Basketball"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="gradYear">Grad Year</Label>
                        <Input
                          id="gradYear"
                          value={formData.gradYear}
                          onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                          placeholder="2026"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="division">Division</Label>
                        <select
                          id="division"
                          value={formData.division}
                          onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                          className="w-full h-9 px-3 rounded-md border border-input bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 text-sm"
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

                  {/* Social Links Section - MOVED BEFORE STATS */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Social Links
                    </h2>

                    {/* Added social links */}
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                        <div className="w-full sm:w-24 space-y-2">
                          <Label>Platform</Label>
                          <div className="h-9 px-3 flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm font-medium capitalize">
                            {link.platform}
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <Label>Username</Label>
                          <Input
                            value={link.username}
                            onChange={(e) => updateSocialLink(index, "username", e.target.value)}
                            placeholder="@yourhandle"
                          />
                        </div>

                        <div className="w-full sm:w-28 space-y-2">
                          <Label>Followers</Label>
                          <Input
                            type="number"
                            value={link.followers}
                            onChange={(e) => updateSocialLink(index, "followers", e.target.value)}
                            placeholder="50000"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocialLink(index)}
                          className="text-zinc-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add platform buttons */}
                    <div className="space-y-2">
                      <Label>Add a platform</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSocialLinks([...socialLinks, { platform: "instagram", username: "", followers: "" }])}
                        >
                          + Instagram
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSocialLinks([...socialLinks, { platform: "tiktok", username: "", followers: "" }])}
                        >
                          + TikTok
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSocialLinks([...socialLinks, { platform: "x", username: "", followers: "" }])}
                        >
                          + X
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSocialLinks([...socialLinks, { platform: "other", username: "", followers: "" }])}
                        >
                          + Other
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Your Stats
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Total Followers - Auto-calculated */}
                      <div className="space-y-2">
                        <Label>Total Followers</Label>
                        <div className="h-9 px-3 flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
                          {totalFollowers > 0 ? formatFollowers(totalFollowers) : "—"}
                        </div>
                        <p className="text-xs text-zinc-500">Auto-calculated</p>
                      </div>

                      {/* Engagement Rate - with tooltip */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="engagementRate">Engagement Rate</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Find this in Instagram Insights or TikTok Analytics under "Engagement Rate" or calculate: (likes + comments) / followers × 100</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="engagementRate"
                          value={formData.engagementRate}
                          onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                          placeholder="4.5%"
                        />
                      </div>

                      {/* Avg Views - with tooltip */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="avgViews">Avg Views</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Find this in TikTok Analytics or Instagram Reels Insights. Look for "Average views per video" in the last 28 days.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="avgViews"
                          value={formData.avgViews}
                          onChange={(e) => setFormData({ ...formData, avgViews: e.target.value })}
                          placeholder="10K"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Tags Section */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                        Content Focus
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
                          <Input
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                            placeholder="Enter tag..."
                            className="h-8 w-32 text-sm"
                            autoFocus
                          />
                          <Button type="button" size="sm" variant="ghost" onClick={addCustomTag}>
                            Add
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomTagInput(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomTagInput(true)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-violet-500 hover:text-violet-500"
                        >
                          + Other
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Deliverables Section */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                        Partnership Deliverables
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
                          <Input
                            value={customDeliverable}
                            onChange={(e) => setCustomDeliverable(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomDeliverable())}
                            placeholder="Enter deliverable..."
                            className="h-8 w-40 text-sm"
                            autoFocus
                          />
                          <Button type="button" size="sm" variant="ghost" onClick={addCustomDeliverable}>
                            Add
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomDeliverableInput(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomDeliverableInput(true)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-500"
                        >
                          + Other
                        </button>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
              )}

              {/* Skip or Submit Button */}

              {!showBackOfCard ? (
                
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setShowBackOfCard(true)                                                                  
                        setIsTransitioning(false)
                      }, 400)
                    }}
                    className= "w-full rounded-md border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                    size="lg"
                  >
                    Customize back of card 
                  </Button>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    Optional — skip this step and come back later
                  </p>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                    size="lg"
                  >
                    {loading ? loadingLabel : submitLabel}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-slide-in">
                  <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBackOfCard(false)}
                >
                  ← Back to Profile
                </Button>
                <Card className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900/80">
                  <CardContent className="pt-6 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Featured Posts
                    </h2>
                    {featuredPosts.map((post, index) => (
                      <div key={index} className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Post {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFeaturedPosts(featuredPosts.filter((_, i) => i !== index))}
                            className="text-zinc-400 hover:text-red-500 h-6 px-2 text-xs">
                            Remove
                          </Button>
                        </div>
                        <Input
                          placeholder="Paste post URL"
                          value={post.url}
                          onChange={(e) => {
                            const val = e.target.value
                            setFeaturedPosts(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], url: val }
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
                          {["tiktok", "instagram"].map((platform) => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => {
                                setFeaturedPosts(prev => {
                                  const updated = [...prev]
                                  updated[index] = { ...updated[index], platform }
                                  return updated
                                })
                              }}
                              className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                                post.platform === platform
                                  ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                              }`}
                            >
                              {platform === "tiktok" ? "TikTok" : "Instagram"}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {featuredPosts.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFeaturedPosts([...featuredPosts, {url: "", platform: "tiktok", caption: ""}])}
                      >
                        + Add Featured Post
                      </Button>
                    )}
                    {featuredPosts.length >= 3 && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Maximum 3 featured posts reached.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900/80">
                  <CardContent className="pt-6 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Awards
                    </h2>
                    {awards.map((award, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <Input
                          placeholder="Title (e.g. All-Conference 2025)"
                          value={award.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setAwards(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], title: val }
                              return updated
                            })
                          }} />
                        <Input
                          placeholder="Description"
                          value={award.description}
                          onChange={(e) => {
                            const val = e.target.value
                            setAwards(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], description: val }
                              return updated
                            })
                          }} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAwards(awards.filter((_, i) => i !== index))}
                          className="text-zinc-500 hover:text-red-500 self-start">
                          Remove
                        </Button>
                      </div>
                    ))}
                    {awards.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAwards([...awards, { title: "", description: "" }])}>
                        + Add Award
                      </Button>
                    )}
                    {awards.length >= 3 && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Maximum 3 awards reached.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900/80">
                  <CardContent className="pt-6 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Highlights
                    </h2>
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <Input
                          placeholder="Title (e.g. 1,000 career points)"
                          value={highlight.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setHighlights(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], title: val }
                              return updated
                            })
                          }} />
                        <Input
                          placeholder="Description"
                          value={highlight.description}
                          onChange={(e) => {
                            const val = e.target.value
                            setHighlights(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], description: val }
                              return updated
                            })
                          }} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setHighlights(highlights.filter((_, i) => i !== index))}
                          className="text-zinc-500 hover:text-red-500 self-start">
                          Remove
                        </Button>
                      </div>
                    ))}
                    {highlights.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setHighlights([...highlights, { title: "", description: "" }])}>
                        + Add Highlight
                      </Button>
                    )}
                    {highlights.length >= 3 && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Maximum 3 highlights reached.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900/80">
                  <CardContent className="pt-6 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      Articles
                    </h2>
                    {pressArticles.map((article, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <Input
                          placeholder="Title (e.g. All-American Team)"
                          value={article.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setPressArticles(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], title: val }
                              return updated
                            })
                          }} />
                        <Input
                          placeholder="url"
                          value={article.url}
                          onChange={(e) => {
                            const val = e.target.value
                            setPressArticles(prev => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], url: val }
                              return updated
                            })
                          }} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPressArticles(pressArticles.filter((_, i) => i !== index))}
                          className="text-zinc-500 hover:text-red-500 self-start">
                          Remove
                        </Button>
                      </div>
                    ))}
                    {pressArticles.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPressArticles([...pressArticles, { url: "", title: "" }])}>
                        + Add Article
                      </Button>
                    )}
                    {pressArticles.length >= 3 && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Maximum 3 articles reached.</p>
                    )}
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                  size="lg"
                >
                  {loading ? loadingLabel : submitLabel}
                </Button>

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
```

## NOTES

1. **Environment variable required:** Add `NEXT_PUBLIC_PHYLLO_ENVIRONMENT` to your `.env.local` file. Set it to `staging` or `production`. If omitted, it defaults to `staging` (see `lib/phyllo-client.ts`).

2. **npm install:** Run `npm install phyllo-connect` if not already installed.

3. **Files NOT modified** (per plan constraints):
   - `lib/phyllo-client.ts` — already complete, untouched
   - `hooks/usePhylloConnect.ts` — already complete, untouched
   - `components/PhylloConnectSection.tsx` — already complete, untouched
   - `lib/phyllo.ts` — server-only file, untouched

4. **Changes made to `components/ProfileForm.tsx`:**
   - Added `useCallback` to the React import
   - Added three callback handlers: `handlePhylloStatsReceived`, `handlePhylloConnected`, `handlePhylloDisconnected`
   - Rendered `<PhylloConnectSection>` inside the card, between the profile photo section and the "Basic Info" section
   - `onStatsReceived` auto-populates `engagementRate`, `avgViews` in `formData`, and updates/adds matching social link follower counts
   - `onConnected` adds a social link entry for the platform if one doesn't already exist
   - All existing manual input fields remain unchanged as fallbacks

5. **`/api/phyllo/stats` route** does not exist yet — the `onStatsReceived` callback is wired but will only fire once that route is implemented in a future step. The current hook marks accounts as "connected" without stats polling.