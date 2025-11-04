"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, AlertCircle } from "lucide-react"
import { submitReport } from "@/lib/api/reportService"

export function ReportSubmitForm() {
  const [selectedStation, setSelectedStation] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<"light" | "moderate" | "heavy" | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const STATIONS = [
    "Rajiv Chowk",
    "Kashmere Gate",
    "Dwarka",
    "Lajpat Nagar",
    "INA",
    "AIIMS",
    "Hauz Khas",
    "IIT Delhi",
    "New Delhi",
    "Chandni Chowk",
    "Karol Bagh",
    "Dwarka Sector 21",
    "Moolchand",
    "Nehru Place",
    "Botanical Garden",
    "Connaught Place",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (!selectedStation || !selectedLevel) {
      setError("Please select a station and crowd level")
      return
    }

    setIsLoading(true)

    try {
      await submitReport(selectedStation, selectedLevel, remarks)

      // Success - reset form
      setSelectedStation("")
      setSelectedLevel(null)
      setRemarks("")
      setSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to submit report. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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

        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-violet-500/20 to-pink-500/15 px-6 py-4 border-b border-violet-500/30 backdrop-blur-sm shadow-lg shadow-violet-500/10">
          <h2 className="text-xl font-semibold text-transparent bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text flex items-center gap-2">
            📝 Submit a Crowd Report
          </h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-200"
            >
              <p className="text-sm">✅ Report submitted successfully!</p>
            </motion.div>
          )}

          {/* Select Station */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Metro Station
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-violet-500/30 text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none transition-colors"
            >
              <option value="">Choose a station...</option>
              {STATIONS.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          {/* Crowd Level Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Current Crowd Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["light", "moderate", "heavy"].map((level) => {
                const config = {
                  light: { color: "emerald", emoji: "🟢", label: "Light" },
                  moderate: { color: "yellow", emoji: "🟡", label: "Moderate" },
                  heavy: { color: "red", emoji: "🔴", label: "Heavy" },
                }[level as keyof typeof config]

                return (
                  <motion.button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level as "light" | "moderate" | "heavy")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      selectedLevel === level
                        ? `bg-${config.color}-500/40 border-2 border-${config.color}-500`
                        : `bg-slate-800/50 border border-violet-500/30 text-gray-300 hover:border-violet-500/60`
                    }`}
                  >
                    <div className="text-2xl">{config.emoji}</div>
                    <div className="text-sm mt-1">{config.label}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value.slice(0, 500))}
              placeholder="E.g. Delays at the platform or special conditions you observed..."
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-violet-500/30 text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none transition-colors resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{remarks.length}/500</p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Report
              </>
            )}
          </motion.button>
        </form>
      </Card>
    </motion.div>
  )
}
