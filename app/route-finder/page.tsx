"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import RouteSearchPanel from "@/components/route-search-panel"
import RouteResults from "@/components/route-results"
import { Station } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://speedline-metro-backend.onrender.com"

export default function AIRouteFinder() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({ from: "", to: "" })
  const [stationsData, setStationsData] = useState<Station[]>([])
  const [stationsLoading, setStationsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch stations data on component mount
  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async () => {
    try {
      setStationsLoading(true)
      setError(null)
      console.log("📍 Fetching stations from API...")
      
      const stations = await getAllStations()
      setStationsData(stations)
      console.log("✅ Stations data loaded:", stations.length, "stations")
    } catch (error: any) {
      console.error("❌ Error loading stations:", error)
      setError("Failed to load stations data")
    } finally {
      setStationsLoading(false)
    }
  }

  const handleSearch = async (from: string, to: string) => {
    setSearchParams({ from, to })
    setIsLoading(true)
    setResults(null)
    setError(null)
    console.log("🔍 Searching route from:", from, "to:", to)

    try {
      // Try the /shortest endpoint first (from your original working code)
      const url = `${API_BASE_URL}/api/routes/shortest`
      console.log("📡 Calling API:", url)
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      })

      console.log("Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response not OK:", errorText)
        throw new Error(`Failed to find route: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Route found:", data)
      setResults(data)
    } catch (error: any) {
      console.error("❌ Error fetching route:", error)
      setError(error.message || "Failed to find route. Please try again.")
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0 bg-grid-pattern"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 px-6 py-8 border-b border-blue-500/20"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>

          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
              AI Route Finder 🚇
            </h1>
            <p className="text-gray-400 text-center text-sm mt-2">
              Find the fastest and least-crowded path across Delhi Metro — powered by AI optimization
            </p>
          </div>

          <div className="w-20" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RouteSearchPanel onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-semibold mb-1">Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-red-400/80">Troubleshooting:</p>
                    <ul className="text-xs text-red-400/60 space-y-1 list-disc list-inside">
                      <li>Check if backend is running at: {API_BASE_URL}</li>
                      <li>Verify the station names are correct</li>
                      <li>Check browser console for more details</li>
                    </ul>
                  </div>
                  <button
                    onClick={fetchStations}
                    className="mt-3 text-xs text-red-300 hover:text-red-200 underline"
                  >
                    Try reloading stations
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {results && !stationsLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-12"
            >
              <RouteResults 
                results={results} 
                from={searchParams.from} 
                to={searchParams.to}
                stationsData={stationsData}
              />
            </motion.div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex flex-col items-center justify-center py-12"
            >
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-0 border-2 border-transparent border-t-blue-400 border-r-violet-400 rounded-full shadow-lg shadow-blue-500/50"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-2 border-2 border-transparent border-b-violet-400 border-l-blue-400 rounded-full shadow-lg shadow-violet-500/30"
                />
              </div>
              <p className="text-gray-400 mt-4">Optimizing your route...</p>
              <p className="text-gray-500 text-xs mt-2">Searching from {searchParams.from} to {searchParams.to}</p>
            </motion.div>
          )}

          {/* Stations Loading State */}
          {stationsLoading && !results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex flex-col items-center justify-center py-12"
            >
              <div className="text-gray-400">Loading station data...</div>
            </motion.div>
          )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-xs"
            >
              <p className="text-gray-400 font-mono">Debug Info:</p>
              <p className="text-gray-500 font-mono">API Base URL: {API_BASE_URL}</p>
              <p className="text-gray-500 font-mono">Route Endpoint: /api/routes/shortest</p>
              <p className="text-gray-500 font-mono">Stations Loaded: {stationsData.length}</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 border-t border-red-500/30 mt-16"
      >
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-400 text-sm mb-4">🚆 Powered by Speedline AI — Smarter Metro Commutes</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              Home
            </Link>
            <Link href="/community-reports" className="text-blue-400 hover:text-blue-300 transition-colors">
              Report Crowd
            </Link>
            <Link href="https://github.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
