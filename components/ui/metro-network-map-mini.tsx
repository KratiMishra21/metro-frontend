'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Users } from 'lucide-react';

interface Station {
  _id: string;
  stationId: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  crowdLevel: 'low' | 'medium' | 'high';
  reportCount: number;
  lines: string[];
  isInterchange: boolean;
}

interface MetroNetworkMapProps {
  stations: Station[];
  onStationClick?: (station: Station) => void;
}

const LINE_COLORS: Record<string, string> = {
  'red': '#EF4444',
  'blue': '#3B82F6',
  'yellow': '#EAB308',
  'green': '#10B981',
  'violet': '#8B5CF6',
  'pink': '#EC4899',
  'magenta': '#D946EF',
  'orange': '#F97316',
  'aqua': '#06B6D4',
  'grey': '#6B7280'
};

export default function MetroNetworkMapMini({ stations, onStationClick }: MetroNetworkMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981'; // Green
      case 'medium': return '#EAB308'; // Yellow
      case 'high': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(canvas.parentElement!);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stations.length === 0 || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Find bounds - coordinates are [lng, lat]
    const lngs = stations.map(s => s.coordinates[0]);
    const lats = stations.map(s => s.coordinates[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padding = 40;

    // Convert lng/lat to canvas coordinates
    const lngToX = (lng: number) => {
      return ((lng - minLng) / (maxLng - minLng)) * (dimensions.width - padding * 2) + padding;
    };

    const latToY = (lat: number) => {
      return ((maxLat - lat) / (maxLat - minLat)) * (dimensions.height - padding * 2) + padding;
    };

    // Group stations by line for drawing connections
    const lineGroups: Record<string, Station[]> = {};
    stations.forEach(station => {
      station.lines.forEach(line => {
        if (!lineGroups[line]) lineGroups[line] = [];
        lineGroups[line].push(station);
      });
    });

    // Draw line connections
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.6;

    Object.entries(lineGroups).forEach(([line, lineStations]) => {
      if (lineStations.length < 2) return;

      ctx.strokeStyle = LINE_COLORS[line.toLowerCase()] || '#6B7280';
      ctx.beginPath();

      // Sort stations by their position along the line (simple approximation)
      const sorted = [...lineStations].sort((a, b) => {
        const distA = Math.sqrt(a.coordinates[0]**2 + a.coordinates[1]**2);
        const distB = Math.sqrt(b.coordinates[0]**2 + b.coordinates[1]**2);
        return distA - distB;
      });

      sorted.forEach((station, idx) => {
        const x = lngToX(station.coordinates[0]);
        const y = latToY(station.coordinates[1]);
        
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // Draw stations
    stations.forEach(station => {
      const x = lngToX(station.coordinates[0]);
      const y = latToY(station.coordinates[1]);

      // Draw glow for high crowd stations
      if (station.crowdLevel === 'high') {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, getCrowdColor('high') + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw station circle
      ctx.fillStyle = getCrowdColor(station.crowdLevel);
      ctx.beginPath();
      ctx.arc(x, y, station.isInterchange ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw white border for interchange stations
      if (station.isInterchange) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw outer ring for stations with reports
      if (station.reportCount > 0) {
        ctx.strokeStyle = getCrowdColor(station.crowdLevel);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, station.isInterchange ? 13 : 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw labels for major stations (interchange stations)
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    stations.filter(s => s.isInterchange).forEach(station => {
      const x = lngToX(station.coordinates[0]);
      const y = latToY(station.coordinates[1]);

      // Draw background for text
      const textWidth = ctx.measureText(station.name).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x - textWidth/2 - 4, y + 15, textWidth + 8, 18);

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(station.name, x, y + 18);
    });

  }, [stations, dimensions]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || stations.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    const lngs = stations.map(s => s.coordinates[0]);
    const lats = stations.map(s => s.coordinates[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padding = 40;

    const lngToX = (lng: number) => {
      return ((lng - minLng) / (maxLng - minLng)) * (dimensions.width - padding * 2) + padding;
    };

    const latToY = (lat: number) => {
      return ((maxLat - lat) / (maxLat - minLat)) * (dimensions.height - padding * 2) + padding;
    };

    let found = null;
    for (const station of stations) {
      const sx = lngToX(station.coordinates[0]);
      const sy = latToY(station.coordinates[1]);
      const distance = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2);
      
      if (distance < 15) {
        found = station;
        break;
      }
    }

    setHoveredStation(found);
    canvas.style.cursor = found ? 'pointer' : 'default';
  };

  const handleClick = () => {
    if (hoveredStation && onStationClick) {
      onStationClick(hoveredStation);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredStation(null)}
        onClick={handleClick}
      />
      
      {hoveredStation && (
        <div
          className="fixed z-50 bg-gray-900/95 text-white px-4 py-3 rounded-lg shadow-2xl border border-gray-700 pointer-events-none min-w-[200px]"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y + 15,
          }}
        >
          <div className="font-semibold text-sm mb-2">{hoveredStation.name}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCrowdColor(hoveredStation.crowdLevel) }}
              />
              <span className="capitalize">{hoveredStation.crowdLevel} crowd</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Users className="w-3 h-3" />
              <span>{hoveredStation.reportCount} recent reports</span>
            </div>
            {hoveredStation.lines.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-2">
                {hoveredStation.lines.map(line => (
                  <div
                    key={line}
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: LINE_COLORS[line.toLowerCase()] || '#6B7280' }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
          {hoveredStation.isInterchange && (
            <div className="text-xs text-blue-400 mt-2 font-medium">
              ⊗ Interchange Station
            </div>
          )}
        </div>
      )}
    </div>
  );
}