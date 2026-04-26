"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowingMap from "../GlowingMap";

export default function MapPreviewSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Live Metro Intelligence
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Tap a station. View crowd levels. Choose smarter routes.
        </p>

        {/* Map Container */}
        <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent pointer-events-none z-10" />

          {/* Real Glowing Map */}
          <div className="relative h-96 sm:h-[500px] overflow-hidden">
            <GlowingMap />
          </div>

         

          {/* Demo button overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/50 gap-2 animate-pulse hover:animate-none">
              <Play className="w-4 h-4" />
              Try Live Demo
            </Button>
          </div>
        </div>

        {/* Info text */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Color coding: <span className="text-green-400">Green</span> (Low) •{" "}
          <span className="text-yellow-400">Yellow</span> (Medium) •{" "}
          <span className="text-red-400">Red</span> (High)
        </p>
      </div>
    </section>
  );
}
