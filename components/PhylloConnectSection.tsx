"use client"

import { Check, Loader2, AlertCircle, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  usePhylloConnect,
  type PhylloConnectionState,
  type PhylloPlatformStats,
  type PhylloStats,
} from "@/hooks/usePhylloConnect"
import type { PhylloPlatform } from "@/lib/phyllo-client"
import { useEffect } from "react"

// TikTok icon (lucide doesn't have one)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z" />
    </svg>
  )
}

type PhylloConnectSectionProps = {
  initialConnectionState?: Partial<PhylloConnectionState>
  initialPlatformStats?: Partial<PhylloPlatformStats>
  onStatsReceived?: (platform: PhylloPlatform, stats: PhylloStats) => void
  onDisconnected?: (platform: PhylloPlatform) => void
  onConnected?: (platform: PhylloPlatform, accountId: string) => void
}

const PLATFORMS: { key: PhylloPlatform; label: string; icon: React.ReactNode }[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: <TikTokIcon className="h-5 w-5" />,
  },
]

export default function PhylloConnectSection({
  initialConnectionState,
  initialPlatformStats,
  onStatsReceived,
  onDisconnected,
  onConnected,
}: PhylloConnectSectionProps) {
  const {
    connectionState,
    platformStats,
    errors,
    connectPlatform,
    disconnectPlatform,
    setConnectionState,
    setPlatformStats,
  } = usePhylloConnect({
    onStatsReceived,
    onDisconnected,
    onConnected,
  })

  // Apply initial states on mount
  useEffect(() => {
    if (initialConnectionState) {
      setConnectionState((prev) => ({ ...prev, ...initialConnectionState }))
    }
    if (initialPlatformStats) {
      setPlatformStats((prev) => ({ ...prev, ...initialPlatformStats }))
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Connect Your Social Accounts
        </h3>
        <p className="text-xs text-gray-500">
          Link your accounts to automatically verify your follower counts and engagement stats.
        </p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map(({ key, label, icon }) => {
          const state = connectionState[key]
          const stats = platformStats[key]
          const error = errors[key]

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  {state === "connected" && stats?.username && (
                    <p className="text-xs text-gray-500">@{stats.username}</p>
                  )}
                  {state === "connected" && stats?.followers != null && (
                    <p className="text-xs text-gray-500">
                      {stats.followers.toLocaleString()} followers
                    </p>
                  )}
                  {state === "connected" && !stats && (
                    <p className="text-xs text-green-600">Connected</p>
                  )}
                  {error && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {state === "idle" || state === "error" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectPlatform(key)}
                  >
                    Connect
                  </Button>
                ) : state === "connecting" ? (
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Connecting
                  </Button>
                ) : state === "connected" ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <Check className="h-4 w-4" />
                      Connected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-400 hover:text-red-500"
                      onClick={() => disconnectPlatform(key)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
