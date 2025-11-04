"use client"

import { useState, useEffect } from "react"
import HeroSection from "@/components/sections/hero"
import FeaturesSection from "@/components/sections/features"
import MapPreviewSection from "@/components/sections/map-preview"
import HowItWorksSection from "@/components/sections/how-it-works"
import ImpactSection from "@/components/sections/impact"
import Footer from "@/components/sections/footer"
import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link";

export default function Home() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  return (
    <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1e] to-[#0a0a0a] min-h-screen text-white overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </div>

      {/* Background animated grid */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <HeroSection />
      <FeaturesSection />
      <MapPreviewSection />
      <HowItWorksSection />
      <ImpactSection />
      <Footer />
    </main>
  )
}
