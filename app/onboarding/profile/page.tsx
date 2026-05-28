"use client"

import { useEffect, useState } from "react"
import ProfileForm from "@/components/ProfileForm"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Header from "@/components/Header"

export default function OnboardingProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [pageLoading, setPageLoading] = useState(true)
  const [profileId, setProfileId] = useState<string>("")
  const [initialFormData, setInitialFormData] = useState<any>(undefined)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .eq("id", user.id)
        .maybeSingle()

      // No profile row means basics was skipped — send them back
      if (!profile) { router.replace("/onboarding/basics"); return }

      setProfileId(profile.id)
      setInitialFormData({
        fullName: profile.full_name ?? "",
        username: profile.username ?? "",
        bio: "",
        school: "",
        sport: "",
        gradYear: "",
        division: "",
        engagementRate: "",
        avgViews: "",
        profilePhotoUrl: "",
      })
      setPageLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (payload: {
    formData: any
    socialLinks: any[]
    tags: string[]
    deliverables: string[]
    profilePhotoFile?: File | null
    featuredPosts: any[]
    awards: any[]
    highlights: any[]
    pressArticles: any[]
  }) => {
    const { formData, socialLinks, tags, deliverables, profilePhotoFile, featuredPosts, awards, highlights, pressArticles } = payload
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let profilePhotoUrl: string | null = null
    if (profilePhotoFile) {
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(`${user.id}/photo`, profilePhotoFile, { upsert: true })
      if (uploadError) throw new Error(uploadError.message)
      const { data: photoData } = supabase.storage.from("profile-images").getPublicUrl(`${user.id}/photo`)
      profilePhotoUrl = photoData?.publicUrl || null
    }

    const totalFollowers = socialLinks.reduce((sum, link) => sum + (typeof link.followers === "number" ? link.followers : 0), 0)

    // UPDATE the partial profile row created at basics
    const { error: updateError } = await supabase.from("profiles").update({
      full_name: formData.fullName,
      username: formData.username,
      profile_photo_url: profilePhotoUrl,
      bio: formData.bio,
      university: formData.school,
      sport: formData.sport,
      graduation_year: parseInt(formData.gradYear) || null,
      division: formData.division,
      engagement_rate: parseFloat(formData.engagementRate) || null,
      avg_views: parseInt(formData.avgViews) || null,
      total_followers: totalFollowers,
    }).eq("id", user.id)

    if (updateError) throw new Error(updateError.message)

    if (socialLinks.length > 0) {
      const { error: socialLinksError } = await supabase.from("social_links").insert(
        socialLinks.map(link => ({
          profile_id: user.id,
          platform: link.platform,
          url: link.username,
          follower_count: link.followers,
        }))
      )
      if (socialLinksError) throw new Error(socialLinksError.message)
    }

    if (tags.length > 0) {
      const { data: tagRows } = await supabase
        .from("content_tags")
        .upsert(tags.map(tag => ({ name: tag })), { onConflict: "name" })
        .select("id")
      if (!tagRows) throw new Error("Failed to save content tags")
      const { error: tagLinkError } = await supabase.from("profile_content_tags").insert(
        tagRows.map(row => ({ profile_id: user.id, tag_id: row.id }))
      )
      if (tagLinkError) throw new Error(tagLinkError.message)
    }

    if (deliverables.length > 0) {
      const { data: delRows } = await supabase
        .from("deliverables")
        .upsert(deliverables.map(d => ({ name: d })), { onConflict: "name" })
        .select("id")
      if (!delRows) throw new Error("Failed to save deliverables")
      const { error: delError } = await supabase.from("profile_deliverables").insert(
        delRows.map(row => ({ profile_id: user.id, deliverable_id: row.id }))
      )
      if (delError) throw new Error(delError.message)
    }

    if (featuredPosts.length > 0) {
      const { error } = await supabase.from("featured_posts").insert(
        featuredPosts.map((post, i) => ({ profile_id: user.id, url: post.url, platform: post.platform, caption: post.caption, display_order: i }))
      )
      if (error) throw new Error(error.message)
    }

    if (awards.length > 0) {
      const { error } = await supabase.from("awards").insert(
        awards.map(a => ({ profile_id: user.id, title: a.title, description: a.description }))
      )
      if (error) throw new Error(error.message)
    }

    if (highlights.length > 0) {
      const { error } = await supabase.from("highlights").insert(
        highlights.map(h => ({ profile_id: user.id, title: h.title, description: h.description }))
      )
      if (error) throw new Error(error.message)
    }

    if (pressArticles.length > 0) {
      const { error } = await supabase.from("press_articles").insert(
        pressArticles.map(a => ({ profile_id: user.id, url: a.url, title: a.title }))
      )
      if (error) throw new Error(error.message)
    }

    router.push(`/profile/${formData.username}`)
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

  return (
    <ProfileForm
      onSubmit={handleSubmit}
      submitLabel="Generate My NIL Card →"
      loadingLabel="Generating..."
      pageTitle="Complete Your Profile"
      pageSubtitle="Fill out your info and get your shareable NIL card in minutes"
      initialFormData={initialFormData}
      profileId={profileId}
    />
  )
}
