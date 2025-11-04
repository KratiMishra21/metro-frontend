import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function GlowingMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // prevent reinitialization

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz/style.json?key=${
        process.env.NEXT_PUBLIC_MAPTILER_KEY
      }`,
      center: [77.2090, 28.6139], // Delhi center
      zoom: 10,
    });

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add glowing animated marker
    map.current.on("load", () => {
      const el = document.createElement("div");
      el.className = "glow-marker";

      new maplibregl.Marker(el)
        .setLngLat([77.2090, 28.6139])
        .addTo(map.current);
    });
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full rounded-2xl shadow-lg" />
      <style>
        {`
          .glow-marker {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: #00ffff;
            box-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 45px #00ffff;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.6; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
