"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, SlidersHorizontal, RotateCcw, X, Copy, Sparkles, TrendingUp, Radio } from "lucide-react"
import { createClient } from "@/lib/supabase"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import MatchScoreTab from "@/components/marketplace/MatchScoreTab"
import EstReachTab from "@/components/marketplace/EstReachTab"
import AudienceTab from "@/components/marketplace/AudienceTab"

export default function MarketplacePage(){
    const [query, setQuery] = useState("")
    const [location, setLocation] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [flipped, setFlipped] = useState(false)
    const [selectedPlace, setSelectedPlace] = useState<any>(null)
    const [contentTags, setContentTags] = useState<string[]>([])
    const [flipping, setFlipping] = useState(false)
    const [activeTab, setActiveTab] = useState<number>(0)
    const TABS = ["Match Score", "Est. Reach"]

    const supabase = createClient()
    const router = useRouter()

    const businessTypes = [
        "Restaurants",
        "Gyms & Fitness",
        "Retail & Apparel",
        "Sports Stores",
        "Salons & Barbershops",
        "Supplement Stores",
        "Coffee Shops",
        "Hotels",
        "Car Dealerships",
        "Local Brands",
    ]

    useEffect(() => {
        async function fetchUser(){
            const { data: {user} } = await supabase.auth.getUser()

            if(!user){
                router.push("/login")
                return
            }
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()
            const {data: tags, error: tagsError} = await supabase
                .from("profile_content_tags")
                .select("content_tags(name)")
                .eq("profile_id", profile.id)
            

            if (profile && tags){
                setProfile(profile)
                const tagNames = tags?.map((t:any) => t.content_tags.name).slice(0,4) ?? []
                setContentTags(tagNames)
            }
            else{
                console.log(profileError?.message)
            }

        }
        fetchUser()
    }, [])

    useEffect(() => {
        if(selectedPlace){
            document.body.style.overflow = "hidden"
        }else{
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [selectedPlace])

    function handleFlip(value: boolean){
        setFlipping(true)
        setFlipped(value)
        setTimeout(() => setFlipping(false), 600)
    }

    async function handleSearch(){
        setLoading(true)
        const response = await fetch(`/api/places?query=${query}&location=${location}`)
        const data = await response.json()
        setResults(data.places ?? [])
        setLoading(false)
    }

    

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <Header />

            <main className="flex-1 px-4 py-10 max-w-6xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Browse Local Businesses
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                    Find local brands and businesses to pitch partnerships to.
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full sm:w-64 shrink-0 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 flex flex-col gap-4 h-fit">
                        <div className="flex items-center gap-2 mb-1">
                            <SlidersHorizontal className="w-4 h-4 text-violet-500" />
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Filters</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Business Type</label>
                            <Select value={query} onValueChange={(value) => setQuery(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {businessTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Location</label>
                            <Input
                                placeholder="City or school"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium hover:from-violet-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1">
                        {results.length > 0 && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-4">
                                Click any card to view details and get a personalized pitch template.
                            </p>
                        )}
                        {results.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((place, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {setSelectedPlace(place); handleFlip(false)}}
                                        className="cursor-pointer bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
                                    >
                                        {/* Photo or gradient placeholder */}
                                        <div className="relative h-44 w-full">
                                            {place.photoUrl ? (
                                                <Image
                                                    src={place.photoUrl}
                                                    alt={place.displayName?.text ?? "Business photo"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-blue-500" />
                                            )}
                                        </div>

                                        {/* Card content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                                                {place.displayName?.text}
                                            </h2>
                                            <div className="flex items-center gap-2 mb-3">
                                                {place.primaryTypeDisplayName?.text && (
                                                    <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                                        {place.primaryTypeDisplayName.text}
                                                    </span>
                                                )}
                                                {place.rating && (
                                                    <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        {place.rating} ({place.userRatingCount})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                                {place.formattedAddress}
                                            </p>
                                            <div className="flex gap-2">
                                                {place.websiteUri ? (
                                                    <a
                                                        href={place.websiteUri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block flex-1 text-center text-sm py-2 rounded-lg border border-violet-500 text-violet-600 dark:text-violet-400 font-medium hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200"
                                                    >
                                                        Visit Website
                                                    </a>
                                                    
                                                    
                                                ) : (
                                                    <button 
                                                        disabled
                                                        className="inline-block flex-1 text-center text-sm py-2 rounded-lg border border-zinc-500 dark:border-zinc-700 text-zinc-500  dark:text-zinc-600 cursor-not-allowed"
                                                        >
                                                            No Website
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {e.stopPropagation(); setSelectedPlace(place); setFlipped(true) }}
                                                    className="flex-1 text-center text-sm py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium hover:from-violet-700 hover:to-blue-600 transition-all duration-200"
                                                >
                                                    Pitch →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && results.length === 0 && (
                            <div className="text-center text-zinc-400 dark:text-zinc-600 mt-20">
                                <p className="text-lg">
                                    Search for businesses near you to get started.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {selectedPlace && (
                <div 
                    onClick={() => setSelectedPlace(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >

                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden">
                        <div style={{perspective: "1000px", height: "745px"}}>
                            <div onClick={() => handleFlip(!flipped)} style={{transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.6s", transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%", cursor: "pointer"}} >

                                {/* Front */}
                                <div style={{backfaceVisibility: "hidden", position: "absolute", inset: 0, pointerEvents: flipped ? "none" : "auto", display: "flex", flexDirection: "column"}}>
                                    <div className="relative h-56 w-full">
                                        {selectedPlace.photoUrl ? (
                                            <Image
                                                src={selectedPlace.photoUrl}
                                                alt={selectedPlace.displayName?.text ?? "Business photo"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-blue-500" />
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (!flipping) setSelectedPlace(null) }}
                                            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 rounded-full px-3 py-1.5 transition"
                                        >
                                            <X className="w-3.5 h-3.5 text-white" />
                                            <span className="text-white text-xs font-medium">Close</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleFlip(!flipped) }}
                                            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 rounded-full px-3 py-1.5 transition"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                                            <span className="text-white text-xs font-medium">Flip Card</span>
                                        </button>
                                        <p className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-xs text-center text-zinc-400 dark:text-zinc-500">
                                            Click anywhere to flip!
                                        </p>
                                    </div>
                                    <div className="p-5 flex flex-col gap-3 flex-1 overflow-y-auto">
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                            {selectedPlace.displayName?.text}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {selectedPlace.primaryTypeDisplayName?.text && (
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                                    {selectedPlace.primaryTypeDisplayName.text}
                                                </span>
                                            )}
                                            {selectedPlace.rating && (
                                                <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    {selectedPlace.rating} ({selectedPlace.userRatingCount})
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {selectedPlace.formattedAddress}
                                        </p>
                                        {selectedPlace.nationalPhoneNumber && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                {selectedPlace.nationalPhoneNumber}
                                            </p>
                                        )}
                                        {/* Tab bar */}
                                        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-4">
                                            {TABS.map((tab, i) => (
                                                <button
                                                    key={tab}
                                                    onClick={(e) => { e.stopPropagation(); setActiveTab(i) }}
                                                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-all ${
                                                        activeTab === i
                                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-600"
                                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                                    }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Tab content */}
                                        <div className="min-h-[140px]">
                                            {activeTab === 0 && <MatchScoreTab />}
                                            {activeTab === 1 && <EstReachTab />}
                                        </div>
                                    </div>

                                        {/* Visit Website & Google Maps Buttons */}
                                        <div className="flex gap-2 px-5 pb-5 flex-shrink-0">
                                            {selectedPlace.websiteUri ? (
                                                <a
                                                    href={selectedPlace.websiteUri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-center text-sm py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium hover:from-violet-700 hover:to-blue-600 transition-all duration-200"
                                                >
                                                    Visit Website
                                                </a>
                                            ) : (
                                                <button 
                                                    disabled
                                                    className="flex-1 text-center text-sm py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500  dark:text-zinc-600 cursor-not-allowed"
                                                >
                                                    No Website
                                                </button>
                                                
                                                    
                                                
                                            )}
                                            {selectedPlace.googleMapsUri && (
                                                <a
                                                    href={selectedPlace.googleMapsUri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-center text-sm py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50
                                                    dark:hover:bg-emerald-900/20 transition-all duration-200">
                                                    View on Maps
                                                </a>
                                            )}
                                        </div>
                                </div>

                                {/* Back */}
                                <div style={{transform: "rotateY(180deg)", backfaceVisibility: "hidden", position: "absolute", inset: 0, overflowY: "auto", pointerEvents: flipped ? "auto" : "none", display: "flex", flexDirection: "column"}}>
                                    {/* Gradient header */}
                                    <div className="relative h-56 w-full bg-gradient-to-br from-violet-600 to-blue-500 flex flex-col items-center justify-center gap-3 px-4">
                                        <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
                                        <p className="text-white/70 text-xs">{profile?.sport} • {profile?.university}</p>
                                        <div className="flex gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-white font-bold text-lg">{profile?.total_followers?.toLocaleString()}</span>
                                                <span className="text-white/70 text-xs">Followers</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-white font-bold text-lg">{profile?.engagement_rate}%</span>
                                                <span className="text-white/70 text-xs">Eng. Rate</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-white font-bold text-lg">{profile?.avg_views?.toLocaleString()}</span>
                                                <span className="text-white/70 text-xs">Avg Views</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">
                                            <Sparkles className="w-3 h-3" />
                                            AI-Tailored Pitch — Coming Soon
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPlace(null) }}
                                            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 rounded-full px-3 py-1.5 transition"
                                        >
                                            <X className="w-3.5 h-3.5 text-white" />
                                            <span className="text-white text-xs font-medium">Close</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleFlip(false) }}
                                            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 rounded-full px-3 py-1.5 transition"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                                            <span className="text-white text-xs font-medium">Flip Card</span>
                                        </button>
                                    </div>

                                    <div className="p-5 flex flex-col gap-4 flex-1">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Copy this and send it to {selectedPlace.displayName?.text}
                                        </p>
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line flex-1">
                                            {`Hi ${selectedPlace.displayName?.text},\n\nI'm ${profile?.full_name}, an athlete at ${profile?.university}. I create ${contentTags.join(", ").toLowerCase()} content and have a growing audience — I think it could be a great fit for your brand.\n\nI'd love to collaborate if it makes sense.\n\nCheck out my NIL Card here: ${typeof window !== "undefined" ? window.location.origin : ""}/profile/${profile?.username}\n\nLet me know what you think,\n${profile?.full_name}`}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`Hi ${selectedPlace.displayName?.text},\n\nI'm ${profile?.full_name}, an athlete at ${profile?.university}. I create ${contentTags.join(", ").toLowerCase()} content and have a growing audience — I think it could be a great fit for your brand.\n\nI'd love to collaborate if it makes sense.\n\nCheck out my NIL Card here: ${window.location.origin}/profile/${profile?.username}\n\nLet me know what you think,\n${profile?.full_name}`) }}
                                            className="w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium hover:from-violet-700 hover:to-blue-600 transition-all duration-200"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy Pitch
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}
