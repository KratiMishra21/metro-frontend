"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Clock, MessageSquare, TrendingUp, RefreshCw } from "lucide-react"
import { getAllReports, likeReport } from "@/lib/api/reportService"

interface Report {
  id: string
  station: string
  level: "light" | "moderate" | "heavy"
  remarks: string
  timeAgo: string
  timestamp: number
  likes: number
}

const CROWD_CONFIG = {
  light: {
    color: "from-emerald-500/20 via-emerald-500/10 to-teal-500/20",
    border: "border-emerald-500/50",
    badge: "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50",
    icon: "🟢",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  },
  moderate: {
    color: "from-yellow-500/20 via-yellow-500/10 to-amber-500/20",
    border: "border-yellow-500/50",
    badge: "bg-yellow-500/30 text-yellow-200 border border-yellow-500/50",
    icon: "🟡",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
  },
  heavy: {
    color: "from-red-500/20 via-red-500/10 to-pink-500/20",
    border: "border-red-500/50",
    badge: "bg-red-500/30 text-red-200 border border-red-500/50",
    icon: "🔴",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  },
}

export default function LiveReportsFeed() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set())

  // Fetch reports on mount
  useEffect(() => {
    fetchReports()
    
    // Refresh reports every 30 seconds
    const interval = setInterval(fetchReports, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAllReports(12)
      setReports(data || [])
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError("Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (reportId: string) => {
    if (likedReports.has(reportId)) return

    try {
      await likeReport(reportId)
      setLikedReports((prev) => new Set([...prev, reportId]))
      
      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, likes: report.likes + 1 }
            : report
        )
      )
    } catch (err) {
      console.error("Error liking report:", err)
    }
  }

  const handleRefresh = () => {
    fetchReports()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full flex flex-col bg-gradient-to-br from-violet-500/10 via-slate-900/50 to-pink-500/10 border border-violet-500/20 rounded-2xl p-6 backdrop-blur-xl"
    >
      {/* Header - Fixed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-4 flex-shrink-0 pb-4 border-b border-violet-500/20"
      >
        <h3 className="text-lg font-semibold text-transparent bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}>
            <TrendingUp className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          </motion.div>
          📊 Live Reports
        </h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-violet-500/20 transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
            >
              <RefreshCw className="w-4 h-4 text-violet-400" />
            </motion.div>
          </motion.button>
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-violet-500/30 to-pink-500/30 text-violet-200 font-medium border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
          >
            {reports.length} recent
          </motion.span>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && reports.length === 0 ? (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="flex items-center justify-center py-8 text-gray-400"
        >
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm">Loading reports...</p>
          </div>
        </motion.div>
      ) : (
        /* Reports Container - Scrollable */
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/40 scrollbar-track-violet-500/5 pr-2">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {reports.length > 0 ? (
                reports.map((report, index) => {
                  const config = CROWD_CONFIG[report.level]
                  const isLiked = likedReports.has(report.id)

                  return (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: index * 0.05,
                      }}
                      whileHover={{
                        scale: 1.02,
                      }}
                      className={`group bg-gradient-to-br ${config.color} border ${config.border} rounded-xl p-4 transition-all duration-300 backdrop-blur-xl cursor-pointer ${config.glow} flex-shrink-0`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-pink-500/0 group-hover:from-violet-500/10 group-hover:to-pink-500/10 rounded-xl transition-all duration-500 pointer-events-none" />

                      <div className="relative z-10 space-y-3">
                        {/* Station Name and Badge */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-start justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <h4 className="font-semibold text-gray-100 text-sm line-clamp-1">{report.station}</h4>
                          </div>
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur-sm flex-shrink-0 ${config.badge}`}
                          >
                            {config.icon} {report.level.charAt(0).toUpperCase() + report.level.slice(1)}
                          </motion.span>
                        </motion.div>

                        {/* Remarks */}
                        {report.remarks && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="flex gap-2"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-300 line-clamp-2">{report.remarks}</p>
                          </motion.div>
                        )}

                        {/* Timestamp and Like */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {report.timeAgo}
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => handleLike(report.id)}
                            disabled={isLiked}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              isLiked
                                ? "bg-violet-500/40 text-violet-200 cursor-default"
                                : "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                            }`}
                          >
                            👍 {report.likes}
                          </motion.button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-400"
                >
                  <p className="text-sm">No reports yet. Be the first to share!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}