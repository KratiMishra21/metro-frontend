"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://speedline-metro-backend.onrender.com";

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

export default function GlowingMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [stations, setStations] = useState([]);

  const fetchLiveData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/metro-map/live-data`);
      const json = await res.json();
      if (json.success && json.data.stations) {
        setStations(json.data.stations);
      }
    } catch (e) {
      console.error("Failed to fetch live map data:", e);
    }
  };

  // Init map once
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [77.21, 28.6],
      zoom: 10.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.on("load", () => setMapReady(true));
  }, []);

  // Fetch on mount + every 30s
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Plot stations when map ready + data available
  useEffect(() => {
    if (!mapReady || stations.length === 0 || !map.current) return;

    const crowdColor = (level) => {
      if (level === "high") return "#ef4444";
      if (level === "medium") return "#eab308";
      return "#10b981";
    };

    // ── LINE LAYERS ──────────────────────────────────────────────
    const lineGroups = {};
    stations.forEach((s) => {
      s.lines.forEach((line) => {
        const key = line.toLowerCase();
        if (!lineGroups[key]) lineGroups[key] = [];
        lineGroups[key].push(s);
      });
    });

    Object.entries(lineGroups).forEach(([line, lineStations]) => {
      if (lineStations.length < 2) return;
      const sourceId = `line-src-${line}`;
      const layerId = `line-layer-${line}`;
      const sorted = [...lineStations].sort(
        (a, b) => a.coordinates[0] - b.coordinates[0]
      );
      const geojson = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: sorted.map((s) => s.coordinates),
        },
      };
      if (map.current.getSource(sourceId)) {
        map.current.getSource(sourceId).setData(geojson);
      } else {
        map.current.addSource(sourceId, { type: "geojson", data: geojson });
        map.current.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": LINE_COLORS[line] || "#6B7280",
            "line-width": 3,
            "line-opacity": 0.75,
          },
        });
      }
    });

    // ── STATION DOTS (GeoJSON — no HTML markers!) ────────────────
    const geojsonData = {
      type: "FeatureCollection",
      features: stations.map((s) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: s.coordinates },
        properties: {
          id: s.stationId,
          name: s.name,
          crowdLevel: s.crowdLevel || "low",
          color: crowdColor(s.crowdLevel),
          reportCount: s.reportCount || 0,
          lines: s.lines.join(", "),
          radius: s.lines.length > 1 ? 10 : 7,
        },
      })),
    };

    if (map.current.getSource("stations")) {
      map.current.getSource("stations").setData(geojsonData);
    } else {
      map.current.addSource("stations", { type: "geojson", data: geojsonData });

      // Glow layer
      map.current.addLayer({
        id: "stations-glow",
        type: "circle",
        source: "stations",
        paint: {
          "circle-radius": ["*", ["get", "radius"], 2.2],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.25,
          "circle-blur": 1,
        },
      });

      // Main dot
      map.current.addLayer({
        id: "stations-dot",
        type: "circle",
        source: "stations",
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Labels
      map.current.addLayer({
        id: "stations-label",
        type: "symbol",
        source: "stations",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.6],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#0b0b10",
          "text-halo-width": 1.5,
        },
      });

      // Cursor
      map.current.on("mouseenter", "stations-dot", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "stations-dot", () => {
        map.current.getCanvas().style.cursor = "";
      });

      // Click → popup at exact coordinate
      map.current.on("click", "stations-dot", (e) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();

        const crowdLabel =
          props.crowdLevel === "high"
            ? "🔴 Heavy"
            : props.crowdLevel === "medium"
            ? "🟡 Moderate"
            : "🟢 Light";

        const linesHtml = props.lines
          .split(", ")
          .map(
            (line) =>
              `<span style="background:${
                LINE_COLORS[line.toLowerCase()] || "#6B7280"
              };padding:2px 8px;border-radius:4px;font-size:11px;color:white;font-weight:600;">${line}</span>`
          )
          .join(" ");

        new maplibregl.Popup({ offset: 12, maxWidth: "220px" })
          .setLngLat(coords)
          .setHTML(
            `<div style="background:#1e1b2e;color:white;padding:12px;border-radius:10px;font-family:sans-serif;border:1px solid #7c3aed44;">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px;">${props.name}</div>
              <div style="font-size:12px;margin-bottom:8px;color:#a78bfa;">Crowd: ${crowdLabel}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">${linesHtml}</div>
              ${
                props.reportCount > 0
                  ? `<div style="font-size:11px;color:#9ca3af;margin-top:8px;">${props.reportCount} report${
                      props.reportCount > 1 ? "s" : ""
                    } in last 2h</div>`
                  : ""
              }
            </div>`
          )
          .addTo(map.current);
      });
    }
  }, [mapReady, stations]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", minHeight: "400px" }}
      />

      {/* Live badge */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 10,
        background: "rgba(15,12,30,0.85)", border: "1px solid #7c3aed55",
        borderRadius: 8, padding: "6px 12px", display: "flex",
        alignItems: "center", gap: 8, color: "white", fontSize: 12,
        backdropFilter: "blur(8px)", pointerEvents: "none",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#10b981",
          boxShadow: "0 0 6px #10b981", display: "inline-block",
          animation: "gpulse 2s infinite",
        }} />
        {stations.length} Stations Live
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, left: 12, zIndex: 10,
        background: "rgba(15,12,30,0.85)", border: "1px solid #7c3aed55",
        borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 11,
        backdropFilter: "blur(8px)", display: "flex", gap: 12,
        pointerEvents: "none",
      }}>
        {[
          { color: "#10b981", label: "Low" },
          { color: "#eab308", label: "Moderate" },
          { color: "#ef4444", label: "High" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%", background: color,
              boxShadow: `0 0 6px ${color}`, display: "inline-block",
            }} />
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
        .maplibregl-popup-tip { display: none !important; }
        @keyframes gpulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
