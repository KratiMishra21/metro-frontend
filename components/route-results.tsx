"use client"

import { motion } from "framer-motion"
import { ArrowRight, Clock, Gauge, AlertCircle } from "lucide-react"

interface RouteResultsProps {
  results: {
    path?: string[]
    stations?: string[]
    distance?: number
    time?: number
    crowding_score?: number
  }
  from: string
  to: string
  stationsData?: any[] // Add full stations data to get line info
}

// Color mapping for metro lines
const lineColors: Record<string, string> = {
  "Blue": "bg-blue-600",
  "Yellow": "bg-yellow-500",
  "Red": "bg-red-600",
  "Violet": "bg-violet-600",
  "Green": "bg-green-600",
  "Pink": "bg-pink-600",
  "Magenta": "bg-pink-500",
  "Orange": "bg-orange-600",
  "Airport Express": "bg-indigo-600",
}

const lineTextColors: Record<string, string> = {
  "Blue": "text-blue-300",
  "Yellow": "text-yellow-300",
  "Red": "text-red-300",
  "Violet": "text-violet-300",
  "Green": "text-green-300",
  "Pink": "text-pink-300",
  "Magenta": "text-pink-300",
  "Orange": "text-orange-300",
  "Airport Express": "text-indigo-300",
}

export default function RouteResults({ results, from, to, stationsData = [] }: RouteResultsProps) {
  const stations = results.path || results.stations || [from, to]
  const distance = results.distance || 0
  const time = results.time || 0
  const crowdingScore = results.crowding_score || 0

  // Helper function to get station's lines
  const getStationLines = (stationName: string) => {
    const station = stationsData.find(s => s.name === stationName)
    return station?.lines || []
  }

  // Helper function to find common line between two stations
  const findCommonLine = (station1: string, station2: string) => {
    const lines1 = getStationLines(station1)
    const lines2 = getStationLines(station2)
    const common = lines1.filter(line => lines2.includes(line))
    return common.length > 0 ? common[0] : null
  }

  // Check if there's a line change
  const hasLineChange = (idx: number) => {
    if (idx >= stations.length - 1) return false
    const currentLine = findCommonLine(stations[idx], stations[idx + 1])
    const nextLine = idx < stations.length - 2 ? findCommonLine(stations[idx + 1], stations[idx + 2]) : null
    return currentLine !== nextLine && nextLine !== null
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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Route Path with Line Info */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-green-500/30 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-4 text-green-400">Optimal Route</h3>
        <div className="space-y-4">
          {stations.map((station, idx) => {
            const lines = getStationLines(station)
            const nextStation = idx < stations.length - 1 ? stations[idx + 1] : null
            const currentLine = nextStation ? findCommonLine(station, nextStation) : null
            const isLineChange = hasLineChange(idx)
            
            return (
              <motion.div key={idx} whileHover={{ scale: 1.02 }} className="space-y-2">
                {/* Station */}
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/40 text-sm font-medium text-white min-w-fit">
                    {station}
                  </div>
                  
                  {/* Station Lines */}
                  <div className="flex gap-2">
                    {lines.map((line: string) => (
                      <div
                        key={line}
                        className={`px-2 py-1 rounded text-xs font-semibold text-white ${lineColors[line] || "bg-gray-600"}`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow and Line Info */}
                {idx < stations.length - 1 && (
                  <motion.div className="flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <ArrowRight size={18} />
                      {currentLine && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded bg-white/10 ${lineTextColors[currentLine] || "text-gray-300"}`}>
                          via {currentLine} Line
                        </span>
                      )}
                    </div>
                    
                    {/* Line Change Warning */}
                    {isLineChange && (
                      <div className="flex items-center gap-1 text-orange-400 text-xs">
                        <AlertCircle size={14} />
                        <span>Line Change</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Distance */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-blue-500/30 hover:border-blue-500/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Distance</p>
              <p className="text-2xl font-bold text-blue-400 mt-2">{distance.toFixed(1)} km</p>
            </div>
            <Gauge className="text-blue-500/40" size={32} />
          </div>
        </motion.div>

        {/* Time */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-violet-500/30 hover:border-violet-500/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Estimated Time</p>
              <p className="text-2xl font-bold text-violet-400 mt-2">{Math.round(time)} min</p>
            </div>
            <Clock className="text-violet-500/40" size={32} />
          </div>
        </motion.div>

        {/* Crowding Score */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-red-500/30 hover:border-red-500/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Crowd Level</p>
              <p className="text-2xl font-bold text-red-400 mt-2">{(crowdingScore * 100).toFixed(0)}%</p>
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-red-500/40 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-xs text-red-400 font-semibold text-center"
              >
                Low
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Banner */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm"
      >
        ✨ This route was optimized using AI to balance distance, time, and crowd levels for the best commute experience.
      </motion.div>
    </motion.div>
  )
}