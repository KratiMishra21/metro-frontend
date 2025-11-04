// Replace the placeholder in metro-map-overview.tsx with this component:

import { motion } from "framer-motion"

const MINI_STATIONS = [
  { name: "Dwarka", x: 40, y: 250, level: "light" },
  { name: "Rajiv Chowk", x: 200, y: 120, level: "light" },
  { name: "Kashmere Gate", x: 320, y: 80, level: "light" },
  { name: "New Delhi", x: 220, y: 100, level: "light" },
  { name: "Lajpat Nagar", x: 280, y: 200, level: "light" },
  { name: "INA", x: 240, y: 280, level: "light" },
  { name: "Hauz Khas", x: 220, y: 340, level: "light" },
]

const MINI_LINES = [
  { from: [40, 250], to: [200, 120], color: "#3b82f6" },   // Blue
  { from: [220, 100], to: [320, 80], color: "#eab308" },   // Yellow
  { from: [280, 200], to: [240, 280], color: "#a855f7" },  // Violet
  { from: [240, 280], to: [220, 340], color: "#eab308" },  // Yellow
]

const STATUS_COLORS = {
  light: "#10b981",
  moderate: "#eab308",
  heavy: "#ef4444",
}

export function MetroNetworkMapMini({ stationData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative bg-gradient-to-br from-violet-500/10 via-slate-800/50 to-pink-500/10 border border-violet-500/30 rounded-xl p-8 flex items-center justify-center min-h-56 backdrop-blur-sm overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Mini SVG Map */}
      <svg
        viewBox="0 0 360 380"
        className="w-full h-full max-h-64 relative z-10"
      >
        {/* Draw metro lines */}
        {MINI_LINES.map((line, idx) => (
          <motion.line
            key={`line-${idx}`}
            x1={line.from[0]}
            y1={line.from[1]}
            x2={line.to[0]}
            y2={line.to[1]}
            stroke={line.color}
            strokeWidth="3"
            opacity="0.5"
            initial={{ strokeDasharray: 200, strokeDashoffset: 200 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.5, delay: 0.2 + idx * 0.1 }}
          />
        ))}

        {/* Draw stations */}
        {MINI_STATIONS.map((station, idx) => {
          const stationData = stationData?.find(
            (s) => s.station.toLowerCase() === station.name.toLowerCase()
          )
          const level = stationData?.level || "light"
          const color = STATUS_COLORS[level]

          return (
            <g key={station.name}>
              {/* Outer glow */}
              <motion.circle
                cx={station.x}
                cy={station.y}
                r="14"
                fill={color}
                opacity="0.15"
                initial={{ r: 8, opacity: 0 }}
                animate={{ r: 14, opacity: 0.15 }}
                transition={{ duration: 1, delay: idx * 0.05 }}
              />

              {/* Station dot */}
              <motion.circle
                cx={station.x}
                cy={station.y}
                r="8"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 8, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.05 }}
                style={{
                  filter: `drop-shadow(0 0 6px ${color})`,
                }}
              />

              {/* Pulsing animation for stations */}
              <motion.circle
                cx={station.x}
                cy={station.y}
                r="8"
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.5"
                animate={{ r: [8, 16], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </g>
          )
        })}
      </svg>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-3 justify-center text-xs z-20">
        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-gray-300">Light</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-gray-300">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-gray-300">Heavy</span>
        </div>
      </div>

      {/* Instruction text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute top-4 left-0 right-0 text-center text-xs text-gray-400 pointer-events-none"
      >
        Click "View Full Map" for details
      </motion.div>
    </motion.div>
  )
}

// Usage in metro-map-overview.tsx:
// Replace the entire placeholder div with:
// <MetroNetworkMapMini stationData={stations} />