"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const CROWD_COLORS = {
  low: "#10b981",
  medium: "#eab308",
  high: "#ef4444",
};

const LINE_COLORS = {
  blue: "#3B82F6",
  yellow: "#EAB308",
  red: "#EF4444",
  green: "#10B981",
  violet: "#8B5CF6",
  pink: "#EC4899",
  magenta: "#D946EF",
  orange: "#F97316",
  aqua: "#06B6D4",
  "airport express": "#06B6D4",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://speedline-metro-backend.onrender.com";

export default function GlowingMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stationData, setStationData] = useState([]);

  // Fetch live crowd data
  const fetchLiveData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/metro-map/live-data`);
      const json = await res.json();
      if (json.success && json.data.stations) {
        setStationData(json.data.stations);
      }
    } catch (e) {
      console.error("Failed to fetch live map data:", e);
    }
  };

  // Init map
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [77.2090, 28.6],
      zoom: 10.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.on("load", () => setMapLoaded(true));

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, []);

  // Fetch data on mount + every 30s
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Plot stations once map is loaded and data is ready
  useEffect(() => {
    if (!mapLoaded || stationData.length === 0) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove old popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Draw line connections using GeoJSON
    const lineGroups = {};
    stationData.forEach((station) => {
      station.lines.forEach((line) => {
        const key = line.toLowerCase();
        if (!lineGroups[key]) lineGroups[key] = [];
        lineGroups[key].push(station);
      });
    });

    Object.entries(lineGroups).forEach(([line, stations]) => {
      const layerId = `line-${line}`;
      const sourceId = `source-${line}`;

      // Remove existing layers/sources
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      if (stations.length < 2) return;

      // Sort stations roughly by longitude for line drawing
      const sorted = [...stations].sort(
        (a, b) => a.coordinates[0] - b.coordinates[0]
      );

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: sorted.map((s) => s.coordinates),
          },
        },
      });

      map.current.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": LINE_COLORS[line] || "#6B7280",
          "line-width": 3,
          "line-opacity": 0.7,
        },
      });
    });

    // Add station markers
    stationData.forEach((station) => {
      const crowdLevel = station.crowdLevel || "low";
      const color = CROWD_COLORS[crowdLevel] || CROWD_COLORS.low;
      const isInterchange = station.lines && station.lines.length > 1;

      // Create custom marker element
      const el = document.createElement("div");
      el.style.cssText = `
        width: ${isInterchange ? "18px" : "13px"};
        height: ${isInterchange ? "18px" : "13px"};
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color}55;
        cursor: pointer;
        transition: transform 0.2s;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.4)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      // Popup content
      const crowdLabel =
        crowdLevel === "low"
          ? "🟢 Light"
          : crowdLevel === "medium"
          ? "🟡 Moderate"
          : "🔴 Heavy";

      const linesHtml = station.lines
        .map(
          (line) =>
            `<span style="
              background:${LINE_COLORS[line.toLowerCase()] || "#6B7280"};
              padding:2px 8px;
              border-radius:4px;
              font-size:11px;
              color:white;
              font-weight:600;
            ">${line}</span>`
        )
        .join(" ");

      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        maxWidth: "220px",
      }).setHTML(`
        <div style="
          background:#1e1b2e;
          color:white;
          padding:12px;
          border-radius:10px;
          font-family:sans-serif;
          border:1px solid #7c3aed44;
        ">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;">
            ${station.name}
          </div>
          <div style="font-size:12px;margin-bottom:8px;color:#a78bfa;">
            Crowd: ${crowdLabel}
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            ${linesHtml}
          </div>
          ${
            station.reportCount > 0
              ? `<div style="font-size:11px;color:#9ca3af;margin-top:8px;">
              ${station.reportCount} report${station.reportCount > 1 ? "s" : ""} in last 2h
            </div>`
              : ""
          }
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(station.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, stationData]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Live indicator */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          background: "rgba(15,12,30,0.85)",
          border: "1px solid #7c3aed55",
          borderRadius: 8,
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "white",
          fontSize: 12,
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 6px #10b981",
            display: "inline-block",
            animation: "pulse 2s infinite",
          }}
        />
        {stationData.length} Stations Live
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 10,
          background: "rgba(15,12,30,0.85)",
          border: "1px solid #7c3aed55",
          borderRadius: 8,
          padding: "8px 12px",
          color: "white",
          fontSize: 11,
          backdropFilter: "blur(8px)",
          display: "flex",
          gap: 12,
        }}
      >
        {[
          { color: "#10b981", label: "Low" },
          { color: "#eab308", label: "Moderate" },
          { color: "#ef4444", label: "High" },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 6px ${color}`,
                display: "inline-block",
              }}
            />
            {label}
          </div>
        ))}
      </div>

      <style>{`
        .maplibregl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .maplibregl-popup-tip { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
