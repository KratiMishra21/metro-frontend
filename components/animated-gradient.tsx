"use client"

export default function AnimatedGradient() {
  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-[#0a0a0a]" />
    </div>
  )
}
