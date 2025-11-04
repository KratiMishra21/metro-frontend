"use client"

import { ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-lg opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 z-10">
        {/* Metro lines decoration */}
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg opacity-20 blur-xl animate-pulse" />
          <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-300 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
            Smarter, Safer Metro Commutes.
          </h1>
        </div>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Crowdsourced real-time crowd updates and AI-powered route optimization for Delhi Metro.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/75 transition-all duration-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            View Live Crowd Map
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-500/30 bg-transparent"
          >
            <Zap className="w-4 h-4 mr-2" />
            Report Crowd Status
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-blue-400/60 hover:text-blue-400/100 transition-colors">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
