"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Map, ArrowRight, RefreshCw } from "lucide-react"
import { getCrowdSummary } from "@/lib/api/reportService"
import Link from "next/link"
import { MetroNetworkMapMini } from "./metro-network-map-mini"
interface StationStatus {
  station: string
  level: "light" | "moderate" | "heavy"
  remarks: string
  lastUpdate: string
  reportCount: number
}

const STATUS_CONFIG = {
  light: { bg: "bg-emerald-500", glow: "shadow-lg shadow-emerald-500/30" },
  moderate: { bg: "bg-yellow-500", glow: "shadow-lg shadow-yellow-500/30" },
  heavy: { bg: "bg-red-500", glow: "shadow-lg shadow-red-500/30" },
}

export function MetroMapOverview() {
  const [stations, setStations] = useState<StationStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCrowdData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchCrowdData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCrowdData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getCrowdSummary()
      setStations(data || [])
      console.log("✅ Crowd summary loaded:", data?.length, "stations")
    } catch (err) {
      console.error("Error fetching crowd data:", err)
      setError("Failed to load crowd data")
      // Show mock data on error
      setStations(getMockData())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockData = (): StationStatus[] => [
    { station: "Rajiv Chowk", level: "moderate", remarks: "Normal crowd", lastUpdate: "5 mins ago", reportCount: 3 },
    { station: "Kashmere Gate", level: "light", remarks: "Quiet", lastUpdate: "10 mins ago", reportCount: 1 },
    { station: "Dwarka", level: "heavy", remarks: "Rush hour", lastUpdate: "2 mins ago", reportCount: 2 },
    { station: "Lajpat Nagar", level: "moderate", remarks: "Average crowd", lastUpdate: "8 mins ago", reportCount: 1 },
    { station: "INA", level: "light", remarks: "Few people", lastUpdate: "12 mins ago", reportCount: 1 },
    { station: "AIIMS", level: "heavy", remarks: "Peak time", lastUpdate: "1 min ago", reportCount: 2 },
    { station: "Hauz Khas", level: "light", remarks: "Relaxed", lastUpdate: "6 mins ago", reportCount: 1 },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden border border-violet-500/30 bg-white/5 backdrop-blur-xl shadow-2xl relative group">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-pink-500/0 to-violet-500/0 group-hover:from-violet-500/10 group-hover:via-pink-500/10 group-hover:to-violet-500/10 transition-all duration-500 pointer-events-none" />

        {/* Header bar */}
        <div className="relative z-10 bg-gradient-to-r from-violet-500/20 to-pink-500/15 px-6 py-4 border-b border-violet-500/30 backdrop-blur-sm shadow-lg shadow-violet-500/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-transparent bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text flex items-center gap-2">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Map className="w-5 h-5 text-violet-400" />
            </motion.div>
            Metro Network Overview
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchCrowdData}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-violet-500/20 transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
            >
              <RefreshCw className="w-4 h-4 text-violet-400" />
            </motion.div>
          </motion.button>
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Map Placeholder */}
          <MetroNetworkMapMini stationData={stations} />

          {/* Station Status Grid */}
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-3">
            <h3 className="text-sm font-semibold text-violet-200 flex items-center justify-between">
              Station Crowd Status
              {stations.length > 0 && (
                <span className="text-xs bg-violet-500/30 px-2 py-1 rounded text-violet-300">
                  {stations.length} stations
                </span>
              )}
            </h3>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{error}</p>
            )}

            {isLoading && stations.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  Loading crowd data...
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stations.slice(0, 6).map((station, index) => (
                  <motion.div
                    key={station.station}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-violet-500/30 hover:border-violet-500/60 transition-all backdrop-blur-sm cursor-pointer group/station"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.1 }}
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        STATUS_CONFIG[station.level as keyof typeof STATUS_CONFIG].bg
                      } ${STATUS_CONFIG[station.level as keyof typeof STATUS_CONFIG].glow}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100 font-medium line-clamp-1">{station.station}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{station.remarks}</p>
                    </div>
                    <span className="text-xs text-gray-300 capitalize font-medium flex-shrink-0 whitespace-nowrap">
                      {station.level}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Action Button */}
          <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="w-full"
>
  <Link
    href="/metro-map"
    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-violet-500/50 text-violet-200 hover:bg-violet-500/20 hover:text-violet-100 bg-slate-800/30 backdrop-blur-sm transition-all font-semibold"
  >
    View Full Map
    <motion.div 
      animate={{ x: [0, 5, 0] }} 
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
    >
      <ArrowRight className="w-4 h-4" />
    </motion.div>
  </Link>
</motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
