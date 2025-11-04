"use client"

import { LogIn, MessageSquare, Navigation, Zap } from "lucide-react"

const steps = [
  {
    number: 1,
    icon: LogIn,
    title: "Log In",
    description: "Create your account or sign in",
  },
  {
    number: 2,
    icon: MessageSquare,
    title: "Report Crowd",
    description: "Share real-time crowd status",
  },
  {
    number: 3,
    icon: Navigation,
    title: "Get Smart Routes",
    description: "Receive AI-powered suggestions",
  },
  {
    number: 4,
    icon: Zap,
    title: "Travel Safer",
    description: "Enjoy a smarter commute",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          How It Works
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">4 simple steps to smarter commuting</p>

        {/* Timeline */}
        <div className="relative">
          {/* Line connector */}
          <div
            className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 opacity-30"
            style={{ zIndex: 0 }}
          />

          {/* Steps grid */}
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Step card */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 h-full relative z-10 hover:border-white/30 transition-all duration-300 group">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Step number circle */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-[#0a0a0a] relative z-20">
                      <span className="text-xl font-bold text-white">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="mt-4 mb-4 inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">{step.title}</h3>
                    <p className="text-gray-400 text-sm relative z-10">{step.description}</p>
                  </div>

                  {/* Arrow connector for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden text-center text-blue-500/40 text-2xl mt-4">↓</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
