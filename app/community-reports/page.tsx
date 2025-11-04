"use client"

import { Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ReportSubmitForm } from "@/components/report-submit-form"
import LiveReportsFeed from "@/components/live-reports-feed"
import { getCrowdSummary } from "@/lib/api/reportService"

interface StationStatus {
  station: string
  level: "light" | "moderate" | "heavy"
  remarks: string
  lastUpdate: string
  reportCount: number
}

const STATUS_CONFIG = {
  light: { bg: "bg-emerald-500", glow: "shadow-lg shadow-emerald-500/30", icon: "🟢" },
  moderate: { bg: "bg-yellow-500", glow: "shadow-lg shadow-yellow-500/30", icon: "🟡" },
  heavy: { bg: "bg-red-500", glow: "shadow-lg shadow-red-500/30", icon: "🔴" },
}

const MOCK_DATA: StationStatus[] = [
  { station: "Rajiv Chowk", level: "moderate", remarks: "Normal crowd", lastUpdate: "5 mins ago", reportCount: 3 },
  { station: "Kashmere Gate", level: "light", remarks: "Quiet", lastUpdate: "10 mins ago", reportCount: 1 },
  { station: "Dwarka", level: "heavy", remarks: "Rush hour", lastUpdate: "2 mins ago", reportCount: 2 },
  { station: "Lajpat Nagar", level: "moderate", remarks: "Average crowd", lastUpdate: "8 mins ago", reportCount: 1 },
  { station: "INA", level: "light", remarks: "Few people", lastUpdate: "12 mins ago", reportCount: 1 },
  { station: "AIIMS", level: "heavy", remarks: "Peak time", lastUpdate: "1 min ago", reportCount: 2 },
  { station: "Hauz Khas", level: "light", remarks: "Relaxed", lastUpdate: "6 mins ago", reportCount: 1 },
  { station: "New Delhi", level: "moderate", remarks: "Moderate crowd", lastUpdate: "4 mins ago", reportCount: 1 },
]

export default function CommunityReportsPage() {
  const [stations, setStations] = useState<StationStatus[]>(MOCK_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCrowdData()
    const interval = setInterval(fetchCrowdData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCrowdData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("🔄 Fetching crowd summary...")
      
      const data = await getCrowdSummary()
      
      if (data && data.length > 0) {
        setStations(data)
        console.log("✅ Crowd summary loaded:", data.length, "stations")
      } else {
        console.warn("⚠️ No crowd data received, using mock data")
        setStations(MOCK_DATA)
      }
    } catch (err: any) {
      console.error("❌ Error fetching crowd data:", err)
      setError(err.message || "Failed to load crowd data")
      setStations(MOCK_DATA)
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-[#0B0B10]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-violet-500/20 bg-gradient-to-b from-[#1A1A25] via-[#0B0B10]/80 to-[#0B0B10] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors px-3 py-2 rounded-lg border border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="p-2 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-lg"
            >
              <Zap className="w-6 h-6 text-violet-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
              Community Reports
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl"
          >
            Share live crowd updates with fellow commuters and stay informed about real-time metro conditions.
          </motion.p>
        </div>
      </motion.header>

      {/* Main Section */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDE - Submit Form & Live Reports */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <ReportSubmitForm />
              <LiveReportsFeed />
            </motion.div>

            {/* RIGHT SIDE - Station Crowd Status */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/10 via-slate-900/50 to-pink-500/10 p-6 backdrop-blur-xl h-full">
                <motion.div className="flex items-center justify-between mb-6 pb-4 border-b border-violet-500/20">
                  <h3 className="text-lg font-semibold text-transparent bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text">
                    🎯 Station Crowd Status
                  </h3>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-violet-500/30 to-pink-500/30 text-violet-200 font-medium border border-violet-500/50"
                  >
                    {stations.length} stations
                  </motion.span>
                </motion.div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {isLoading && stations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      Loading stations...
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/40 scrollbar-track-violet-500/5 pr-2">
                    {stations.length > 0 ? (
                      stations.map((station, idx) => (
                        <motion.div
                          key={station.station}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-violet-500/30 hover:border-violet-500/60 transition-all cursor-pointer"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: idx * 0.1 }}
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              STATUS_CONFIG[station.level].bg
                            } ${STATUS_CONFIG[station.level].glow}`}
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-100 line-clamp-1">
                              {station.station}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">{station.remarks}</p>
                          </div>

                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap flex-shrink-0 ${
                              STATUS_CONFIG[station.level].bg
                            } text-white`}
                          >
                            {STATUS_CONFIG[station.level].icon}
                          </motion.span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No station data available
                      </div>
                    )}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-4 border-t border-violet-500/20"
                >
                  <Link
                    href="/metro-map"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-violet-500/50 text-violet-200 hover:bg-violet-500/20 hover:text-violet-100 bg-slate-800/30 backdrop-blur-sm transition-all font-semibold"
                  >
                    View Full Metro Map →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
