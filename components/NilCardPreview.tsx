import Image from "next/image"
import { Users, TrendingUp, Eye, BadgeCheck, GraduationCap, ExternalLink, RotateCcw } from "lucide-react"

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
}

export default function NilCardPreview() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm shadow-lg dark:border dark:border-zinc-700 dark:bg-zinc-900 w-full max-w-xs mx-auto">

            {/* Flip Button */}
            <div className="group rounded-full absolute top-4 right-4 px-2 py-1 flex items-center gap-2 justify-center bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors">
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-xs font-medium">Flip Card</span>
            </div>

            {/* Profile Photo */}
            <div className="pt-8 px-6 flex justify-center">
                <div className="relative w-fit">
                    <Image
                        src="/athleteDemoPhoto.jpg"
                        alt="Jordan Smith"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg dark:border-zinc-900 ring-4 ring-violet-500/30"
                    />
                    <BadgeCheck className="absolute bottom-2 right-2 w-6 h-6 text-violet-500 bg-white dark:bg-zinc-900 rounded-full" />
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-3 pt-4 text-center">
                <h1 className="text-3xl font-bold tracking-wide text-zinc-900 dark:text-white">
                    Jordan Smith
                </h1>
                <div className="flex items-center justify-center gap-3 mt-1">
                    <div className="flex-1 max-w-[40px] h-[1px] bg-gradient-to-l from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                    <span className="text-sm text-zinc-600 dark:text-violet-400/70 whitespace-nowrap">
                        Junior • Men's Basketball • Division I
                    </span>
                    <div className="flex-1 max-w-[40px] h-[1px] bg-gradient-to-r from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                </div>
                <div className="flex items-center justify-center gap-3 mt-1">
                    <div className="flex-1 max-w-[40px] h-[1px] bg-gradient-to-l from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                    <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-violet-400/70 whitespace-nowrap">
                        <GraduationCap className="w-4 h-4" />
                        University of Cincinnati &apos;27
                    </span>
                    <div className="flex-1 max-w-[40px] h-[1px] bg-gradient-to-r from-zinc-600/50 dark:from-violet-400/30 to-transparent" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-4 mb-5">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2 dark:bg-purple-900/30">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">{formatNumber(20020)}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">Total Reach</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-2 dark:bg-pink-900/30">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">5.4%</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">Engagement</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2 dark:bg-blue-900/30">
                            <Eye className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">{formatNumber(8000)}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">Avg Reach</div>
                    </div>
                </div>

                {/* Social Channels */}
                <div className="space-y-3 mt-4 text-left">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Social Channels</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-purple-500/60 via-purple-400/40 to-transparent" />
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-900 dark:text-white">Instagram</div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400">@jordan.smith</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-zinc-900 dark:text-white">1.0K</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">followers</div>
                        </div>
                    </div>

                    {/* TikTok */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-black">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-900 dark:text-white">TikTok</div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400">@jordan.smith</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-zinc-900 dark:text-white">61</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">followers</div>
                        </div>
                    </div>

                    {/* X (Twitter) */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-black">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-900 dark:text-white">X (Twitter)</div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400">@jordan.smith</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-zinc-900 dark:text-white">300</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">followers</div>
                        </div>
                    </div>
                </div>
                    <div className="flex items-center justify-center gap-1.5 text-center text-zinc-400 px-4 text-xs dark:text-zinc-500 mt-3">
                        Flip to see awards, press & featured content
                    </div>
            </div>
        </div>
        
    )
}
