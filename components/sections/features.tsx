"use client"

import { MapPin, Zap, Users } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: MapPin,
    title: "Live Metro Map",
    description: "See real-time crowd levels (Green / Yellow / Red) across all stations.",
    gradient: "from-blue-500 to-cyan-500",
    link: "/metro-map",
  },
  {
    icon: Zap,
    title: "Route Optimizer",
    description: "Get least-crowded route suggestions instantly with AI precision.",
    gradient: "from-purple-500 to-pink-500",
    link: "/route-finder",
  },
  {
    icon: Users,
    title: "Community Reports",
    description: "Share live crowd updates with the community in real-time.",
    gradient: "from-red-500 to-orange-500",
    link: "/community-reports",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Powerful Features
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Everything you need for smarter commuting
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <Link 
                href={feature.link} 
                key={index}
                className="block"
              >
                <div className="group relative h-full">
                  {/* Glowing background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl`}
                  />

                  {/* Card */}
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 h-full">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl`}
                      />
                    </div>

                    {/* Icon */}
                    <div
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* Arrow indicator on hover */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-transparent group-hover:text-blue-400 transition-colors duration-300">
                      <span>Explore</span>
                      <svg 
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Bottom glow line */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-full w-0 group-hover:w-full transition-all duration-300`}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}