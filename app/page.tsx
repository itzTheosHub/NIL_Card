"use client"
import Link from "next/link";
import Header from "@/components/Header"
import {useEffect, useState} from "react" 
import {useRouter} from "next/navigation"
import {createClient} from "@/lib/supabase"
import {ArrowRight, Star} from "lucide-react"
import NilCardPreview from "@/components/NilCardPreview"

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

export default function HomePage() {

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

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
                  Stop DMing brands with nothing to show.
                  <br/>
                  <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
                    Send a link that does the talking.
                  </span>
                </h1>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
                  Local businesses in your city are looking for athletes to partner with. Most athletes never reach out because they don't know how to pitch. NIL Card gives you everything you need in one link.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  {!authLoading && user ? (
                    <Link
                      href={profile?.username ? `/profile/${profile.username}` : "/profile/create"}
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
                        href="/profile/theo-colosimo"
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
          <section className="bg-zinc-50 dark:bg-zinc-950 py-20 px-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                How It Works
              </h2>
              <p className="mt-2 text-center text-zinc-500 dark:text-zinc-400">
                Get your NIL Card up and running in minutes
              </p>

              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* Step 1 */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-base font-bold text-white shadow-md">
                    1
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Build your pitch
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Add your sport, stats, social handles, and a photo. Takes less than 5 minutes.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-base font-bold text-white shadow-md">
                    2
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Get your link
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Your card lives at nilcard.app/profile/your-name — one link that shows everything a brand needs to say yes.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-base font-bold text-white shadow-md">
                    3
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Share with brands
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    DM it, email it, drop it in your bio. Brands see your reach, your audience, and how to work with you — all in one place.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-base font-bold text-white shadow-md">
                    4
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Get discovered
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Brands browsing the marketplace find you. The best deals don't always come from who you pitch — sometimes they come to you.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Brands Section — Before/After Comparison */}
          <section className="bg-white dark:bg-zinc-900 py-20 px-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  NIL partnerships vs. traditional advertising
                </h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                  See why local businesses are making the switch.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* NIL */}
                <div className="bg-white dark:bg-zinc-900 border border-violet-300 dark:border-violet-700 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-5">NIL Partnership</p>
                  <div className="flex flex-col gap-4">
                    {[
                      ["Cost", "Sponsor a local athlete with 10K engaged followers for a fraction of ad spend"],
                      ["Trust", "Fans trust athletes they follow — sponsored content feels like a real recommendation"],
                      ["Targeting", "Local athletes have local audiences — your ad reaches people who can actually walk in"],
                      ["Longevity", "Athletes become brand ambassadors — posting organically long after the deal is signed"],
                    ].map(([label, desc]) => (
                      <div key={label} className="flex gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                          <span className="block w-1.5 h-1.5 rounded-full bg-violet-500" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traditional */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-5">Traditional Advertising</p>
                  <div className="flex flex-col gap-4">
                    {[
                      ["Cost", "Rising CPMs on Google, Meta & TikTok — paying more for less reach every year"],
                      ["Trust", "Audiences tune out banner ads and skip pre-rolls within seconds"],
                      ["Targeting", "Broad demographics — no guarantee your audience is local or relevant"],
                      ["Longevity", "Stops working the moment you stop paying"],
                    ].map(([label, desc]) => (
                      <div key={label} className="flex gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                          <span className="block w-1.5 h-1.5 rounded-full bg-red-400" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
          {/* Bottom CTA */}
          <section className="bg-gradient-to-r from-violet-600 to-blue-500 py-20 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white">
                Ready to land your first deal?
              </h2>
              <p className="mt-3 text-violet-100 text-lg">
                Create your free NIL Card in minutes and start pitching brands with confidence.
              </p>
              <Link
                href="/signup"
                className="inline-block mt-8 px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors text-base"
              >
                Create my free card →
              </Link>
            </div>
          </section>
        </div>
  )
  }