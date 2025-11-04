"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Zap } from "lucide-react"

const METRO_STATIONS = [
  "Rajiv Chowk",
  "Central Secretariat",
  "Kasturba Nagar",
  "Jama Masjid",
  "Red Fort",
  "Chandni Chowk",
  "New Delhi",
  "Patel Nagar",
  "Karol Bagh",
  "Rajeev Chowk",
  "Khan Market",
  "IIT Delhi",
  "Hauz Khas",
  "Qutub Minar",
  "Mehrauli",
]

interface RouteSearchPanelProps {
  onSearch: (from: string, to: string) => void
  isLoading: boolean
}

export default function RouteSearchPanel({ onSearch, isLoading }: RouteSearchPanelProps) {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  const fromOptions = METRO_STATIONS.filter((s) => !s.toLowerCase().includes(to.toLowerCase()))
  const toOptions = METRO_STATIONS.filter((s) => !s.toLowerCase().includes(from.toLowerCase()))

  const handleSearch = () => {
    if (from && to) {
      onSearch(from, to)
    }
  }

  return (
    <motion.div
      className="relative p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-blue-500/30 shadow-2xl overflow-hidden"
      whileHover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-xl -z-10" />

      <div className="relative z-10">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="text-blue-400" size={24} />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Smart Route Optimizer
          </span>
        </h2>

        {/* Search inputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* From Station */}
          <div className="relative">
            <label className="block text-sm text-gray-300 mb-2">From Station</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-blue-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setShowFromDropdown(true)
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Select starting station..."
                className="w-full bg-white/5 border border-blue-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:bg-white/10 transition-all"
              />
              {showFromDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-blue-500/30 rounded-lg max-h-40 overflow-y-auto z-50"
                >
                  {fromOptions
                    .filter((s) => s.toLowerCase().includes(from.toLowerCase()))
                    .map((station) => (
                      <button
                        key={station}
                        onClick={() => {
                          setFrom(station)
                          setShowFromDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-500/20 text-white text-sm transition-colors"
                      >
                        {station}
                      </button>
                    ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* To Station */}
          <div className="relative">
            <label className="block text-sm text-gray-300 mb-2">To Station</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-violet-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setShowToDropdown(true)
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Select destination station..."
                className="w-full bg-white/5 border border-violet-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/10 transition-all"
              />
              {showToDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-violet-500/30 rounded-lg max-h-40 overflow-y-auto z-50"
                >
                  {toOptions
                    .filter((s) => s.toLowerCase().includes(to.toLowerCase()))
                    .map((station) => (
                      <button
                        key={station}
                        onClick={() => {
                          setTo(station)
                          setShowToDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-violet-500/20 text-white text-sm transition-colors"
                      >
                        {station}
                      </button>
                    ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          onClick={handleSearch}
          disabled={!from || !to || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/50"
        >
          Find Smart Route ✨
        </motion.button>
      </div>
    </motion.div>
  )
}