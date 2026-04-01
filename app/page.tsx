"use client"
import Link from "next/link";
import Header from "@/components/Header"
import {useEffect, useState} from "react" 
import {useRouter} from "next/navigation"
import {createClient} from "@/lib/supabase"
import {ArrowRight, Star} from "lucide-react"
import NilCardPreview from "@/components/NilCardPreview"

export default function HomePage() {

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const SAMPLE_BUSINESSES = [
    {
      name: "Surge Supplements",
      type: "Supplement Store",
      address: "20000 Short Vine, Cincinnati, OH",
      rating: 4.7,
      reviews: 400,
      emoji: "💊"
    }, 
    {
      name: "Iron & Oak Gym",
      type: "Gym & Fitness",
      address: "25 Calhoun Street, Cincinnati, OH",
      rating: 3.9,
      reviews: 3000,
      emoji: "🏋️"
    },
    {
      name: "Campus Cuts Barbershop",
      type: "Salon & Barbershop",
      address: "8998 Vine Street, Cincinnati, OH",
      rating: 4.2,
      reviews: 2894,
      emoji: "✂️"
    },
    {
      name: "Clutch Sportswear",
      type: "Retail & Clothing",
      address: "2395 MLK Street, Cincinnati, OH",
      rating: 3.6,
      reviews: 1987,
      emoji: "👟"
    } 
  ]

  useEffect(() => {
        async function fetchUser() {
            const {data: {user}} = await supabase.auth.getUser()

            if(user){
                setUser(user)
                const {data: profile} = await supabase.from("profiles").select("username").eq("id", user.id).single()
                if(profile) setProfile(profile)
            }
            setAuthLoading(false)
        }
        fetchUser()
        }, [])


  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header>
        {authLoading || user ? (
            null
        ) : (
          <div className="flex gap-2 sm:gap-3">

            <Link
              href="/login"
              className="rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Get Started
            </Link>
          </div>
        )}
      </Header>
      
          
          {/*Hero Section */}
          <main className="py-12 sm:py-20 px-4 bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              {/* Left: text + CTAs */}
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
                  Your NIL Profile,
                  <br/>
                  your confident pitch to brands
                </h1>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
                  Create a professional virtual NIL Card to showcase your social reach,
                  audience, and brand collaboration opportunities. Share it with one simple link.
                </p>
                <div className="flex flex-row gap-4 mt-8">
                  {!authLoading && user ? (
                    <Link
                      href={`/profile/${profile?.username}`}
                      className="rounded-md bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-8 py-3 text-base font-medium text-white whitespace-nowrap"
                    >
                      View My Card
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="flex-1 text-center rounded-md bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 px-4 py-3 text-base font-medium text-white"
                      >
                        Create my free card
                      </Link>
                      <Link
                        href="/athlete/demo"
                        className="flex-1 text-center rounded-md bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-4 py-3 text-base font-medium text-zinc-800 dark:text-zinc-200"
                      >
                        See an Example →
                      </Link>
                    </>
                  )}
                </div>
                {/*Join athletes/ Social Proof section*/}
                <div className="flex items-center mt-6 gap-3">
                  <div className="flex">
                    {["TC", "JM", "AS", "KR"].map((initials, i) => (
                      <div
                        key={initials}
                        className="w-7 h-7 rounded-full border-2 border-zinc-50 dark:border-zinc-950 flex items-center justify-center text-white text-[10px] font-bold -ml-1.5 first:ml-0"
                        style={{
                          backgroundColor: ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"][i],
                          zIndex: 4 - i,
                        }}
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Join athletes 
                    </span> 
                     {" "}already on NIL Card
                  </p>
              </div>
            </div>
        
              
              {/* Right: card preview */}
              <div className="flex justify-center md:justify-end scale-90 md:scale-100">
                <NilCardPreview />
              </div>
            </div>
          </main>

          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-zinc-800"/>

          {/* How It Works Section */}
          <section className="border-t border-zinc-200 bg-white py-20 px-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                How It Works
              </h2>
              <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
                Get your NIL Card in three simple steps
              </p>

              <div className="mt-12 grid gap-12 sm:grid-cols-3">
                {/* Step 1 */}
                <div className="text-center rounded-lg p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-xl font-bold text-white shadow-md">
                    1
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Create Your Profile
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Add your bio, stats, social media handles, and upload a photo.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center rounded-lg p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-xl font-bold text-white shadow-md">
                    2
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Get Your Link
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    We generate a unique, shareable link for your NIL Card.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center rounded-lg p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-xl font-bold text-white shadow-md">
                    3
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Share With Brands
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Send your link to brands and sponsors to land NIL deals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mock Marketplace Teaser */}
          <section className="bg-zinc-50 dark:bg-zinc-950 py-16 md:py-24 px-6 md:px-10">
            <div className="max-w-5xl mx-auto">

              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Brand marketplace
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                    Find local brands to pitch
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-base max-w-md">
                    Browse businesses near you, see which ones match your interests, and send a personalized pitch in seconds.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 px-5 py-2.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors whitespace-nowrap self-start md:self-auto"
                >
                  Browse all businesses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Business cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SAMPLE_BUSINESSES.map((business) => (
                  <div key={business.name} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden flex flex-col hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                    {/* Image placeholder */}
                    <div className="h-28 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">
                      {business.emoji}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
                        {business.name}
                      </p>
                      <span className="self-start bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        {business.type}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">{business.rating}</span>
                        <span>({business.reviews})</span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{business.address}</p>
                    </div>
                    <div className="px-4 pb-4">
                      <Link
                        href="/signup"
                        className="block w-full text-center text-xs font-semibold bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white rounded-lg py-2 transition-all"
                      >
                        Pitch →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </div>
      
      
      
        
  )
  }