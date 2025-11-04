"use client"

import { useEffect, useState } from "react"

const stats = [
  { label: "Daily Commuters", value: "5M+", delay: 0 },
  { label: "Crowd Reports", value: "10K+", delay: 0.1 },
  { label: "Stations Covered", value: "60+", delay: 0.2 },
  { label: "Route Accuracy", value: "98%", delay: 0.3 },
]

function Counter({ target, delay }: { target: number; delay: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCount((prev) => {
          const increment = Math.ceil(target / 30)
          return prev + increment >= target ? target : prev + increment
        })
      }, 30)
      return () => clearInterval(interval)
    }, delay * 500)
    return () => clearTimeout(timer)
  }, [target, delay])

  return <span>{count}</span>
}

export default function ImpactSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Empowering 5 Million+ Daily Commuters
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A crowd-driven solution making Delhi Metro smarter and safer for everyone.
          </p>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/30 via-transparent to-transparent blur-3xl" />
        </div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  <Counter target={Number.parseInt(stat.value)} delay={stat.delay} />
                </div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 w-0 group-hover:w-full rounded-full transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
