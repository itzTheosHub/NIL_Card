"use client"

import ProfileForm from "@/components/ProfileForm"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CreateProfilePage() {

  // Supabase client
  const supabase = createClient()
  const router = useRouter()

  const handleCreate = async (payload:
    {
      formData: any;
      socialLinks: any[];
      tags: string[];
      deliverables: string[];
      phylloUserId?: string | null;
      profilePhotoFile?: File | null;
      featuredPosts: any[];
      awards: any[];
      highlights: any[];
      pressArticles: any[];

    }) => {
    const { formData, socialLinks, tags, deliverables, profilePhotoFile, featuredPosts, awards, highlights, pressArticles, phylloUserId } = payload
    const { data: { user } } = await supabase.auth.getUser()

    
    let profilePhotoUrl: string | null = null

    if(profilePhotoFile)
    {
      const { error: uploadError } = await supabase.storage.from("profile-images").upload(`${user?.id}/photo`, profilePhotoFile)
      if (uploadError) {
        throw new Error(uploadError.message)
      }
      const { data: photoData } = supabase.storage.from("profile-images").getPublicUrl(`${user?.id}/photo`)
      profilePhotoUrl = photoData?.publicUrl || null
    }

    // Calculate totalFollowers from socialLinks
    const totalFollowers = socialLinks.reduce((sum, link) => {
      return sum + (typeof link.followers === "number" ? link.followers : 0)
    }, 0)
    
    // INSERT into profiles
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user?.id, 
      email: user?.email, 
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
      total_followers: totalFollowers,
      phyllo_user_id: phylloUserId ?? null,
    })

    if (insertError)
    {
      throw new Error(insertError.message)
    }
    else
    {

      // Mapping the socialLinks array to match the DB column names
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
          return

        }
        if (featuredPosts.length > 0){
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
        
        

        if (awards.length > 0)
        {
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

        if (highlights.length > 0)
        {
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
        
        if(pressArticles.length > 0)
        {
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
        // Route to user's profile 
       router.push(`/profile/${formData.username}`)

      }

  }

  return (
    <ProfileForm
      onSubmit={handleCreate}
      submitLabel="Generate My NIL Card →"
      loadingLabel="Generating..."
      pageTitle="Quick Profile Setup"
      pageSubtitle="Fill out your info and get your shareable NIL card in minutes"
    />
  )

}