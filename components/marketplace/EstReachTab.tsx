export default function EstReachTab() {

    const totalReach = 2000
    const audienceOverlap = 72
    const platforms = [
        { name: "Instagram",   reach: 1400, dotColor: "bg-orange-400", barColor: "bg-orange-400" },
        { name: "TikTok",      reach: 400,  dotColor: "bg-zinc-900 dark:bg-white", barColor: "bg-zinc-900 dark:bg-white" },
        { name: "X (Twitter)", reach: 200,  dotColor: "bg-blue-400",   barColor: "bg-blue-400" },
    ]

    return (
        <div>
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">~{totalReach.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">people per post</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{audienceOverlap}%</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">audience overlap</p>
                </div>
            </div>
            <div className="space-y-2.5">
                {platforms.map(({ name, reach, dotColor, barColor }) => (
                    <div key={name} className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                        <span className="text-[11px] text-zinc-500 w-16 flex-shrink-0">{name}</span>
                        <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(reach / totalReach) * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 min-w-[36px] text-right">{reach.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-zinc-400 text-center mt-3">Sample data — AI-reach coming soon</p>
        </div>
    )
}
