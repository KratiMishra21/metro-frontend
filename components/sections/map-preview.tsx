"use client";

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

        <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <div className="relative h-96 sm:h-[500px]">
            <GlowingMap />
          </div>
        </div>
      </div>
    </section>
  );
}
