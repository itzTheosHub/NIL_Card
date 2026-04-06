import { Check, User, Star, TrendingUp } from "lucide-react"

export default function MatchScoreTab({ matchScore = 92 }: { matchScore?: number }) {

    const breakdown = [
        { label: "Interest overlap",   pct: 100, iconBg: "bg-emerald-50", barColor: "bg-emerald-400", textColor: "text-emerald-700", icon: <Check className="w-3 h-3 text-emerald-700" /> },
        { label: "Audience age match", pct: 88,  iconBg: "bg-blue-50",    barColor: "bg-blue-400",    textColor: "text-blue-700",    icon: <User className="w-3 h-3 text-blue-700" /> },
        { label: "Engagement rate",    pct: 82,  iconBg: "bg-amber-50",   barColor: "bg-amber-400",   textColor: "text-amber-700",   icon: <Star className="w-3 h-3 text-amber-700" /> },
        { label: "Local relevance",    pct: 95,  iconBg: "bg-violet-50",  barColor: "bg-violet-400",  textColor: "text-violet-700",  icon: <TrendingUp className="w-3 h-3 text-violet-700" /> },
    ]

    const scoreLabel = matchScore >= 85 ? "Strong match" : matchScore >= 65 ? "Good match" : "Low match"
    const scoreLabelStyle = matchScore >= 85 ? "bg-emerald-100 text-emerald-700" : matchScore >= 65 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
    const barColor = matchScore >= 85 ? "bg-emerald-400" : matchScore >= 65 ? "bg-amber-400" : "bg-red-400"

    return (
        <div>
            <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">{matchScore}</span>
                    <span className="text-sm text-zinc-400">%</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${scoreLabelStyle}`}>{scoreLabel}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${matchScore}%` }} />
            </div>
            <div className="space-y-2.5">
                {breakdown.map(({ label, pct, iconBg, barColor, textColor, icon }) => (
                    <div key={label} className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-zinc-500 mb-1 leading-none">{label}</p>
                            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                        <span className={`text-[11px] font-semibold min-w-[28px] text-right ${textColor}`}>{pct}%</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-zinc-400 text-center mt-3">Sample data — AI-scores coming soon</p>
        </div>
    )
}
