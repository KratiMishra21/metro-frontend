"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, Zap } from "lucide-react"
import { getCrowdSummary } from "@/lib/api/reportService"
import LiveMetroMap from '@/components/ui/live-metro-map';

export default function MetroMapPage() {
  return <LiveMetroMap />;
}
interface StationData {
  station: string
  level: "light" | "moderate" | "heavy"
  coordinates: [number, number] // [x, y] for positioning
  lines: string[]
}

// Metro stations with their coordinates on the map
const METRO_STATIONS: StationData[] = [
  { station: "Dwarka", level: "light", coordinates: [50, 300], lines: ["Blue"] },
  { station: "Dwarka Sector 21", level: "light", coordinates: [120, 250], lines: ["Blue", "Airport"] },
  { station: "Rajiv Chowk", level: "light", coordinates: [300, 150], lines: ["Blue", "Yellow"] },
  { station: "Karol Bagh", level: "light", coordinates: [200, 200], lines: ["Blue"] },
  { station: "New Delhi", level: "light", coordinates: [320, 120], lines: ["Yellow", "Airport"] },
  { station: "Chandni Chowk", level: "light", coordinates: [400, 100], lines: ["Yellow"] },
  { station: "Kashmere Gate", level: "light", coordinates: [480, 80], lines: ["Red", "Yellow", "Violet"] },
  { station: "Lajpat Nagar", level: "light", coordinates: [420, 250], lines: ["Pink", "Violet"] },
  { station: "Nehru Place", level: "light", coordinates: [450, 320], lines: ["Violet"] },
  { station: "Moolchand", level: "light", coordinates: [380, 280], lines: ["Violet"] },
  { station: "INA", level: "light", coordinates: [350, 350], lines: ["Yellow", "Pink"] },
  { station: "Hauz Khas", level: "light", coordinates: [320, 400], lines: ["Yellow", "Magenta"] },
  { station: "IIT Delhi", level: "light", coordinates: [250, 420], lines: ["Magenta"] },
  { station: "Botanical Garden", level: "light", coordinates: [550, 350], lines: ["Magenta"] },
  { station: "AIIMS", level: "light", coordinates: [340, 380], lines: ["Yellow"] },
  { station: "Connaught Place", level: "light", coordinates: [330, 140], lines: ["Blue", "Yellow"] },
]

const LINE_COLORS = {
  "Blue": "#3b82f6",
  "Yellow": "#eab308",
  "Red": "#ef4444",
  "Violet": "#a855f7",
  "Pink": "#ec4899",
  "Green": "#22c55e",
  "Orange": "#f97316",
  "Magenta": "#d946ef",
  "Airport": "#06b6d4",
}

const STATUS_CONFIG = {
  light: { bg: "#10b981", glow: "rgba(16, 185, 129, 0.3)" },
  moderate: { bg: "#eab308", glow: "rgba(234, 179, 8, 0.3)" },
  heavy: { bg: "#ef4444", glow: "rgba(239, 68, 68, 0.3)" },
}

export default function MetroMapPage() {
  const [stations, setStations] = useState<StationData[]>(METRO_STATIONS)
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCrowdData()
    const interval = setInterval(fetchCrowdData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCrowdData = async () => {
    try {
      const crowdSummary = await getCrowdSummary()
      setStations((prev) =>
        prev.map((station) => {
          const crowdData = crowdSummary?.find(
            (s) => s.station.toLowerCase() === station.station.toLowerCase()
          )
          return {
            ...station,
            level: (crowdData?.level as "light" | "moderate" | "heavy") || "light",
          }
        })
      )
    } catch (error) {
      console.error("Error fetching crowd data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStationColor = (level: "light" | "moderate" | "heavy") => {
    return STATUS_CONFIG[level].bg
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
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/community-reports"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors px-3 py-2 rounded-lg border border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10 mb-4"
          >
            <ChevronLeft size={16} />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="p-2 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-lg"
            >
              <Zap className="w-6 h-6 text-violet-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                Metro Network Map
              </h1>
              <p className="text-gray-400 text-sm mt-1">Real-time crowd density across Delhi Metro</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl">
              <svg
                viewBox="0 0 600 500"
                className="w-full h-auto bg-slate-900/30 rounded-xl border border-violet-500/20"
              >
                {/* Draw metro lines */}
                {[
                  { stations: ["Dwarka", "Dwarka Sector 21", "Rajiv Chowk", "Connaught Place", "New Delhi"], color: LINE_COLORS.Blue, name: "Blue" },
                  { stations: ["New Delhi", "Chandni Chowk", "Kashmere Gate", "Lajpat Nagar", "INA", "AIIMS", "Hauz Khas"], color: LINE_COLORS.Yellow, name: "Yellow" },
                  { stations: ["Kashmere Gate", "Lajpat Nagar", "Nehru Place", "Moolchand"], color: LINE_COLORS.Violet, name: "Violet" },
                  { stations: ["Lajpat Nagar", "INA"], color: LINE_COLORS.Pink, name: "Pink" },
                  { stations: ["Hauz Khas", "IIT Delhi", "Botanical Garden"], color: LINE_COLORS.Magenta, name: "Magenta" },
                ].map((line, idx) => {
                  const lineStations = stations.filter((s) => line.stations.includes(s.station))
                  return (
                    <g key={idx}>
                      {lineStations.length > 1 &&
                        lineStations.map((s, i) => {
                          if (i < lineStations.length - 1) {
                            const next = lineStations[i + 1]
                            return (
                              <line
                                key={`line-${i}`}
                                x1={s.coordinates[0]}
                                y1={s.coordinates[1]}
                                x2={next.coordinates[0]}
                                y2={next.coordinates[1]}
                                stroke={line.color}
                                strokeWidth="3"
                                opacity="0.6"
                              />
                            )
                          }
                        })}
                    </g>
                  )
                })}

                {/* Draw stations */}
                {stations.map((station) => (
                  <g key={station.station} onClick={() => setSelectedStation(station.station)}>
                    {/* Glow effect */}
                    <circle
                      cx={station.coordinates[0]}
                      cy={station.coordinates[1]}
                      r="18"
                      fill={getStationColor(station.level)}
                      opacity="0.2"
                    />
                    {/* Station circle */}
                    <motion.circle
                      cx={station.coordinates[0]}
                      cy={station.coordinates[1]}
                      r="12"
                      fill={getStationColor(station.level)}
                      stroke="white"
                      strokeWidth="2"
                      whileHover={{ r: 16 }}
                      className="cursor-pointer"
                    />
                    {/* Station name on hover */}
                    {selectedStation === station.station && (
                      <text
                        x={station.coordinates[0]}
                        y={station.coordinates[1] - 25}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {station.station}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </motion.div>

          {/* Sidebar - Legend & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Legend */}
            <div className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-violet-300 mb-4">Legend</h3>

              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([level, config]) => (
                  <div key={level} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: config.bg }}
                    />
                    <span className="text-sm text-gray-300 capitalize">{level} Crowd</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Station Info */}
            {selectedStation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl"
              >
                <h3 className="text-lg font-semibold text-violet-300 mb-4">{selectedStation}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <p className="text-gray-400">Crowd Status:</p>
                    <p className="capitalize font-semibold text-violet-300">
                      {stations.find((s) => s.station === selectedStation)?.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Metro Lines:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stations
                        .find((s) => s.station === selectedStation)
                        ?.lines.map((line) => (
                          <span
                            key={line}
                            className="px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: LINE_COLORS[line as keyof typeof LINE_COLORS] }}
                          >
                            {line}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Metro Lines */}
            <div className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-violet-300 mb-4">Metro Lines</h3>
              <div className="space-y-2">
                {Object.entries(LINE_COLORS).map(([line, color]) => (
                  <div key={line} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-300">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}