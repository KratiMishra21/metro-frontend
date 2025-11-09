"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, Zap, AlertCircle, RefreshCw } from "lucide-react"
import { getLiveMapData, getStationDetails } from "@/lib/api/metroMap"

interface StationData {
  _id: string
  stationId: string
  name: string
  coordinates: [number, number] // [lng, lat]
  crowdLevel: 'low' | 'medium' | 'high'
  reportCount: number
  lines: string[]
  isInterchange: boolean
}

const LINE_COLORS: Record<string, string> = {
  'red': '#EF4444',
  'blue': '#3B82F6',
  'yellow': '#EAB308',
  'green': '#10B981',
  'violet': '#8B5CF6',
  'pink': '#EC4899',
  'magenta': '#D946EF',
  'orange': '#F97316',
  'aqua': '#06B6D4',
  'grey': '#6B7280'
}

const STATUS_CONFIG = {
  low: { bg: "#10b981", glow: "rgba(16, 185, 129, 0.3)", label: "Light" },
  medium: { bg: "#eab308", glow: "rgba(234, 179, 8, 0.3)", label: "Moderate" },
  high: { bg: "#ef4444", glow: "rgba(239, 68, 68, 0.3)", label: "Heavy" },
}

export default function MetroMapPage() {
  const [stations, setStations] = useState<StationData[]>([])
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchMapData()
    const interval = setInterval(fetchMapData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMapData = async () => {
    try {
      setError(null)
      console.log('Fetching metro map data...') // Debug log
      
      const response = await getLiveMapData()
      console.log('Response received:', response) // Debug log
      
      if (response.success && response.data.stations) {
        setStations(response.data.stations)
        setLastUpdated(new Date(response.data.timestamp))
        console.log('Loaded stations:', response.data.stations.length) // Debug log
      } else {
        setError('Failed to load station data')
      }
    } catch (err: any) {
      console.error("Error fetching map data:", err)
      setError(err.message || 'Failed to connect to server. Please check if backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStationClick = async (station: StationData) => {
    try {
      const details = await getStationDetails(station._id)
      setSelectedStation(details.data)
    } catch (error) {
      console.error('Failed to fetch station details:', error)
    }
  }

  const getStationColor = (level: 'low' | 'medium' | 'high') => {
    return STATUS_CONFIG[level].bg
  }

  // Calculate map bounds and scaling
  const getMapProjection = () => {
    if (stations.length === 0) return null

    const lngs = stations.map(s => s.coordinates[0])
    const lats = stations.map(s => s.coordinates[1])
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    const padding = 50
    const width = 800
    const height = 600

    const lngToX = (lng: number) => {
      return ((lng - minLng) / (maxLng - minLng)) * (width - padding * 2) + padding
    }

    const latToY = (lat: number) => {
      return ((maxLat - lat) / (maxLat - minLat)) * (height - padding * 2) + padding
    }

    return { lngToX, latToY, width, height }
  }

  const projection = getMapProjection()

  const crowdStats = {
    low: stations.filter(s => s.crowdLevel === 'low').length,
    medium: stations.filter(s => s.crowdLevel === 'medium').length,
    high: stations.filter(s => s.crowdLevel === 'high').length,
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B10] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading metro network...</p>
          <p className="text-gray-500 text-sm mt-2">Connecting to backend...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B10]">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-violet-500/20 bg-gradient-to-b from-[#1A1A25] to-[#0B0B10] backdrop-blur-xl"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors px-3 py-2 rounded-lg border border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10 mb-4"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </div>
        </motion.header>

        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="max-w-md text-center">
            <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-300 mb-2">Please check:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Backend server is running</li>
                <li>• API URL is correct in .env.local</li>
                <li>• CORS is configured properly</li>
                <li>• Database is connected</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setIsLoading(true)
                setError(null)
                fetchMapData()
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty State - No Stations
  if (stations.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B10]">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-violet-500/20 bg-gradient-to-b from-[#1A1A25] to-[#0B0B10] backdrop-blur-xl"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors px-3 py-2 rounded-lg border border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </div>
        </motion.header>

        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <div className="inline-flex p-4 bg-yellow-500/10 rounded-full mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Station Data</h2>
            <p className="text-gray-400 mb-4">
              The metro network database is empty. Please add stations to see the map.
            </p>
            <p className="text-sm text-gray-500">
              Make sure stations.json is loaded in your database.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main Map View
  return (
    <div className="min-h-screen bg-[#0B0B10]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-violet-500/20 bg-gradient-to-b from-[#1A1A25] via-[#0B0B10]/80 to-[#0B0B10] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-pink-500/5" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors px-3 py-2 rounded-lg border border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10 mb-4"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-2 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-lg"
              >
                <Zap className="w-6 h-6 text-violet-400" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                  Live Metro Intelligence
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Real-time crowd monitoring • {stations.length} stations connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-400">Last Updated</div>
                <div className="text-sm text-violet-300 font-mono">
                  {lastUpdated.toLocaleTimeString()}
                </div>
              </div>

              <button
                onClick={fetchMapData}
                className="p-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm font-medium">Light Crowd</span>
                <span className="text-3xl font-bold text-green-400">{crowdStats.low}</span>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 text-sm font-medium">Moderate Crowd</span>
                <span className="text-3xl font-bold text-yellow-400">{crowdStats.medium}</span>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm font-medium">Heavy Crowd</span>
                <span className="text-3xl font-bold text-red-400">{crowdStats.high}</span>
              </div>
            </motion.div>
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
              {projection && (
                <svg
                  viewBox={`0 0 ${projection.width} ${projection.height}`}
                  className="w-full h-auto bg-slate-900/30 rounded-xl border border-violet-500/20"
                >
                  {/* Group stations by line and draw connections */}
                  {Object.entries(
                    stations.reduce((acc, station) => {
                      station.lines.forEach(line => {
                        if (!acc[line]) acc[line] = []
                        acc[line].push(station)
                      })
                      return acc
                    }, {} as Record<string, StationData[]>)
                  ).map(([line, lineStations]) => {
                    if (lineStations.length < 2) return null
                    
                    const sorted = [...lineStations].sort((a, b) => {
                      const distA = Math.sqrt(a.coordinates[0]**2 + a.coordinates[1]**2)
                      const distB = Math.sqrt(b.coordinates[0]**2 + b.coordinates[1]**2)
                      return distA - distB
                    })

                    return (
                      <g key={line}>
                        {sorted.map((station, i) => {
                          if (i < sorted.length - 1) {
                            const next = sorted[i + 1]
                            return (
                              <line
                                key={`${station._id}-${next._id}`}
                                x1={projection.lngToX(station.coordinates[0])}
                                y1={projection.latToY(station.coordinates[1])}
                                x2={projection.lngToX(next.coordinates[0])}
                                y2={projection.latToY(next.coordinates[1])}
                                stroke={LINE_COLORS[line.toLowerCase()] || '#6B7280'}
                                strokeWidth="3"
                                opacity="0.5"
                              />
                            )
                          }
                        })}
                      </g>
                    )
                  })}

                  {/* Draw stations */}
                  {stations.map((station) => {
                    const x = projection.lngToX(station.coordinates[0])
                    const y = projection.latToY(station.coordinates[1])
                    
                    return (
                      <g
                        key={station._id}
                        onClick={() => handleStationClick(station)}
                        className="cursor-pointer"
                      >
                        {/* Glow effect for high crowd */}
                        {station.crowdLevel === 'high' && (
                          <circle
                            cx={x}
                            cy={y}
                            r="22"
                            fill={getStationColor(station.crowdLevel)}
                            opacity="0.2"
                          >
                            <animate
                              attributeName="r"
                              values="22;28;22"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                        
                        {/* Station circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={station.isInterchange ? "12" : "8"}
                          fill={getStationColor(station.crowdLevel)}
                          stroke="white"
                          strokeWidth="2"
                        />

                        {/* Station name for interchange stations */}
                        {station.isInterchange && (
                          <text
                            x={x}
                            y={y + 25}
                            textAnchor="middle"
                            fill="white"
                            fontSize="11"
                            fontWeight="600"
                            className="pointer-events-none"
                          >
                            {station.name}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Legend */}
            <div className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-violet-300 mb-4">Crowd Levels</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([level, config]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: config.bg }}
                      />
                      <span className="text-sm text-gray-300">{config.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {level === 'low' ? crowdStats.low : level === 'medium' ? crowdStats.medium : crowdStats.high}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Station Info */}
            {selectedStation ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-violet-300">
                    {selectedStation.station.name}
                  </h3>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getStationColor(selectedStation.currentCrowdLevel) }}
                    />
                    <span className="text-sm text-gray-300 capitalize">
                      {STATUS_CONFIG[selectedStation.currentCrowdLevel as keyof typeof STATUS_CONFIG].label} Crowd
                    </span>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Recent Reports</div>
                    <div className="text-2xl font-bold text-white">
                      {selectedStation.totalReportsLastHour}
                    </div>
                  </div>

                  {selectedStation.station.lines && selectedStation.station.lines.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Metro Lines</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedStation.station.lines.map((line: string) => (
                          <span
                            key={line}
                            className="px-2 py-1 rounded text-xs font-semibold text-white capitalize"
                            style={{ backgroundColor: LINE_COLORS[line.toLowerCase()] || '#6B7280' }}
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedStation.recentReports && selectedStation.recentReports.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Latest Updates</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedStation.recentReports.map((report: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-700/30 rounded-lg p-2 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="capitalize text-white font-medium">
                                {report.crowdLevel}
                              </span>
                              <span className="text-gray-400">
                                {new Date(report.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            {report.remarks && (
                              <p className="text-gray-400">{report.remarks}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="border border-violet-500/30 rounded-2xl bg-gradient-to-br from-violet-500/5 via-slate-900/50 to-pink-500/5 p-6 backdrop-blur-xl">
                <p className="text-sm text-gray-400 text-center">
                  Click on a station to view details
                </p>
              </div>
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
                    <span className="text-sm text-gray-300 capitalize">{line}</span>
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