"use client"

import {Sparkles} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import ProfileForm from "@/components/ProfileForm"


export default function EditProfilePage() {

    const { username } = useParams()
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profileId, setProfileId] = useState<string>("")
    const [initialFormData, setInitialFormData] = useState<{
        fullName: string;
        username: string;
        bio: string;
        school: string;
        sport: string;
        gradYear: string;
        division: string;
        engagementRate: string;
        avgViews: string;
        profilePhotoUrl: string;
    } | undefined>(undefined)

    const [initialSocialLinks, setInitialSocialLinks] = useState<{ platform: any; username: any; followers: any; }[] | undefined>(undefined)
    const [initialTags, setInitialTags] = useState<any[] | undefined>(undefined)
    const [initialDeliverables, setInitialDeliverables] = useState<any[] | undefined>(undefined)
    const [initialFeaturedPosts, setInitialFeaturedPosts] = useState<any[] | undefined>(undefined)                                                                        
    const [initialAwards, setInitialAwards] = useState<any[] | undefined>(undefined)
    const [initialHighlights, setInitialHighlights] = useState<any[] | undefined>(undefined)     
    const [initialPressArticles, setInitialPressArticles] = useState<any[] | undefined>(undefined)

    useEffect(() => {
        async function authData() {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

            if (!profile || user?.id !== profile.id) {
                router.push("/")
                return
            }

            setProfileId(profile.id)
            const { data: socialLinks } = await supabase.from("social_links").select("*").eq("profile_id", profile.id)
            const { data: profileContentTags } = await supabase.from("profile_content_tags").select("tag_id, content_tags(name)").eq("profile_id", profile.id)
            const { data: deliverables } = await supabase.from("profile_deliverables").select("deliverable_id, deliverables(name)").eq("profile_id", profile.id)
            const {data: awards} = await supabase.from("awards").select("*").eq("profile_id", profile.id)
            const {data: featuredPosts} = await supabase.from("featured_posts").select("*").eq("profile_id", profile.id)
            const {data: highlights} = await supabase.from("highlights").select("*").eq("profile_id", profile.id)
            const {data: pressArticles} = await supabase.from("press_articles").select("*").eq("profile_id", profile.id)

            setInitialFormData({
                fullName: profile?.full_name ?? "",
                username: profile?.username ?? "",
                bio: profile?.bio ?? "",
                school: profile?.university ?? "",
                sport: profile?.sport ?? "",
                gradYear: String(profile?.graduation_year ?? ""),
                division: profile?.division ?? "",
                engagementRate: String(profile?.engagement_rate ?? ""),
                avgViews: String(profile?.avg_views ?? ""),
                profilePhotoUrl: profile?.profile_photo_url ?? "",
            })

            setInitialSocialLinks(
                socialLinks?.map(link => ({
                    platform: link.platform,
                    username: link.url,
                    followers: link.follower_count,
                })) ?? []
            )

            setInitialDeliverables(deliverables?.map(deliverable => (deliverable.deliverables as any)?.name) ?? [])

            setInitialTags(profileContentTags?.map(tag => (tag.content_tags as any)?.name) ?? [])

            setInitialFeaturedPosts(featuredPosts?.map(post => ({
              platform: post.platform,
              url: post.url,
              caption: post.caption,
            })) ?? [])

            setInitialAwards(awards?.map(award => ({
              title: award.title,
              description: award.description
            })))

            setInitialHighlights(highlights?.map(highlight => ({
              title: highlight.title,
              description: highlight.description
            })))

            setInitialPressArticles(pressArticles?.map(article => ({
              url: article.url,
              title: article.title
            })))

            setLoading(false)

        }
        authData()
    }, [])

    const handleEdit = async (payload: {
      formData: any; 
      socialLinks: any[]; 
      tags: string[]; 
      deliverables: string[]; 
      profilePhotoFile?: File | null;
      featuredPosts: any[];
      awards: any[];
      highlights: any[];
      pressArticles: any[];
    }) => {
        const { formData, socialLinks, tags, deliverables, profilePhotoFile, featuredPosts, awards, highlights, pressArticles } = payload
        const {data: { user }, error: userError,} = await supabase.auth.getUser()

        // Upload photo if new file selected
        let profilePhotoUrl: string | null = formData.profilePhotoUrl || null
        if (profilePhotoFile) {
            await supabase.storage.from("profile-images").upload(`${user?.id}/photo`, profilePhotoFile, { upsert: true })
            const { data: photoData } = supabase.storage.from("profile-images").getPublicUrl(`${user?.id}/photo`)
            profilePhotoUrl = photoData?.publicUrl || null
        }

        // Calculate total followers from social links
        const totalFollowers = socialLinks.reduce((sum, link) => {
            return sum + (typeof link.followers === "number" ? link.followers : 0)
        }, 0)

        const { error: insertError } = await supabase.from("profiles").update({
            full_name: formData.fullName,
            username: formData.username,
            profile_photo_url: profilePhotoUrl,
            bio: formData.bio,
            university: formData.school,
            sport: formData.sport,
            graduation_year: parseInt(formData.gradYear),
            division: formData.division,
            engagement_rate: parseFloat(formData.engagementRate),
            avg_views: parseInt(formData.avgViews),
            total_followers: totalFollowers
        }).eq("id", user?.id)

        if (insertError)
    {
      throw new Error(insertError.message)
    }
    else
    {
        // Deleting before inserting
        await supabase.from("social_links").delete().eq("profile_id", profileId)
        
        // Mapping the socialLinks array to math the DB column names
        const {error: socialLinksError } = await supabase.from("social_links").insert(
        socialLinks.map(link => ({
          profile_id: user?.id,
          platform: link.platform,
          url: link.username,
          follower_count: link.followers
        }))
      )
        
        if(socialLinksError)
        {
            throw new Error(socialLinksError.message)
            return
        }
        // Delete tag row before inserting
        await supabase.from("profile_content_tags").delete().eq("profile_id", profileId)

        // For each tag in selectedTags, insert it into content_tags (if it doesn't already exist) and get back the ID: 
        const {data: tagRows } = await supabase.from("content_tags").upsert(
          tags.map(tag => ({ name: tag })),
          { onConflict: "name"}
        ).select("id")

        if(!tagRows)
        {
          throw new Error("Failed to save content tags")
          return
        }

        // Insert junction rows into profile_content_tags
        const {error : tagLinkError } = await supabase.from("profile_content_tags").insert(
          tagRows.map(row => ({
            profile_id: user?.id,
            tag_id: row.id,
          }))
        )
       
        if (tagLinkError)
        {
          throw new Error(tagLinkError.message)  
          return
        }

        // Delete before inserting
        await supabase.from("profile_deliverables").delete().eq("profile_id", profileId)

        // deliverables + profile_deliverables
        const { data: deliverablesRows } = await supabase.from("deliverables").upsert(
          deliverables.map(tag => ({ name: tag})),
          { onConflict: "name"}
        ).select("id")

        if(!deliverablesRows)
        {
          throw new Error("Failed to save deliverable")
          return
        }

        const { error : deliverableError} = await supabase.from("profile_deliverables").insert(
          deliverablesRows.map(row => ({ 
            profile_id: user?.id,
            deliverable_id: row.id,

          }))
        )
      
        if (deliverableError)
        {
          throw new Error(deliverableError.message)
        }

        // Featured posts section
        if (featuredPosts.length > 0){
          await supabase.from("featured_posts").delete().eq("profile_id", profileId)
          const {error : featuredPostsError} = await supabase.from("featured_posts").insert(
            featuredPosts.map((post, index) => (
              {
              profile_id: user?.id,
              url: post.url,
              platform: post.platform,
              caption: post.caption,
              display_order: index
            })))

            if(featuredPostsError)
            {
              throw new Error(featuredPostsError.message)
              return
            }
        }

        // awards section
        if (awards.length > 0)
        {
          await supabase.from("awards").delete().eq("profile_id", profileId)
          const {error : awardsError} = await supabase.from("awards").insert(
            awards.map(award => (
              {
                profile_id: user?.id,
                title: award.title,
                description: award.description
              }
            )))

          if (awardsError)
          {
            throw new Error(awardsError.message)
            return
          }
        }

        // highlights section
        if (highlights.length > 0)
        {
          await supabase.from("highlights").delete().eq("profile_id", profileId)
          const {error : highlightsError} = await supabase.from("highlights").insert(
            highlights.map(highlight => (
              {
                profile_id: user?.id,
                title: highlight.title,
                description: highlight.description
              }
            ))
          )
          if (highlightsError)
          {
            throw new Error(highlightsError.message)
            return
          }
        }
        
        // press articles
        if(pressArticles.length > 0)
        {
          await supabase.from("press_articles").delete().eq("profile_id", profileId)
          const {error: pressArticlesError} = await supabase.from("press_articles").insert(
            pressArticles.map(article => (
              {
                profile_id: user?.id,
                url: article.url,
                title: article.title
              }
            ))
          )
          if (pressArticlesError)
          {
            throw new Error(pressArticlesError.message)
            return
          }
        }



        router.push(`/profile/${formData.username}`)
    }
    }

    if (loading) {
         return (
         <div className="flex min-h-screen items-center justify-center bg-[#08090a]">
              <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-500 rounded-full mb-4 animate-spin">
                      <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-zinc-400">Loading your profile...</p>
              </div>
          </div>
      )
    }

    return (
        <ProfileForm
            onSubmit={handleEdit}
            initialFormData={initialFormData}
            initialSocialLinks={initialSocialLinks}
            initialTags={initialTags}
            initialDeliverables={initialDeliverables}
            initialFeaturedPosts={initialFeaturedPosts}
            initialAwards={initialAwards}
            initialHighlights={initialHighlights}
            initialPressArticles={initialPressArticles}
            submitLabel="Save Changes"
            loadingLabel="Saving..."
            pageTitle="Edit Profile"
            pageSubtitle="Update your NIL Card info"
        />
    )

}
