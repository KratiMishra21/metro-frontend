import React, { useState, useEffect } from 'react';
import { MapPin, ZoomIn, ZoomOut, Locate, X, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';

// Sample Delhi Metro stations with coordinates
const METRO_STATIONS = [
  { id: 1, name: 'Rajiv Chowk', lat: 28.6328, lng: 77.2197, line: 'Blue/Yellow', crowdLevel: 'high' },
  { id: 2, name: 'Kashmere Gate', lat: 28.6676, lng: 77.2273, line: 'Red/Yellow/Violet', crowdLevel: 'moderate' },
  { id: 3, name: 'Central Secretariat', lat: 28.6144, lng: 77.2107, line: 'Yellow/Violet', crowdLevel: 'high' },
  { id: 4, name: 'New Delhi', lat: 28.6431, lng: 77.2197, line: 'Yellow/Airport', crowdLevel: 'moderate' },
  { id: 5, name: 'Chandni Chowk', lat: 28.6577, lng: 77.2303, line: 'Yellow', crowdLevel: 'low' },
  { id: 6, name: 'Hauz Khas', lat: 28.5431, lng: 77.2065, line: 'Yellow/Magenta', crowdLevel: 'moderate' },
  { id: 7, name: 'Dwarka Sector 21', lat: 28.5522, lng: 77.0580, line: 'Blue', crowdLevel: 'low' },
  { id: 8, name: 'Noida City Centre', lat: 28.5747, lng: 77.3560, line: 'Blue', crowdLevel: 'moderate' },
  { id: 9, name: 'Vaishali', lat: 28.6490, lng: 77.3410, line: 'Blue', crowdLevel: 'low' },
  { id: 10, name: 'HUDA City Centre', lat: 28.4595, lng: 77.0727, line: 'Yellow', crowdLevel: 'moderate' },
  { id: 11, name: 'Botanical Garden', lat: 28.5641, lng: 77.3343, line: 'Blue/Magenta', crowdLevel: 'high' },
  { id: 12, name: 'Nehru Place', lat: 28.5494, lng: 77.2501, line: 'Violet', crowdLevel: 'moderate' },
  { id: 13, name: 'Mandi House', lat: 28.6255, lng: 77.2341, line: 'Blue/Violet', crowdLevel: 'low' },
  { id: 14, name: 'Anand Vihar', lat: 28.6469, lng: 77.3158, line: 'Blue/Pink', crowdLevel: 'high' },
  { id: 15, name: 'Majlis Park', lat: 28.7267, lng: 77.1522, line: 'Pink/Magenta', crowdLevel: 'moderate' },
];

const MetroLiveMap = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('all');
  const [stations, setStations] = useState(METRO_STATIONS);

  // Convert lat/lng to SVG coordinates
  const latLngToXY = (lat, lng) => {
    const centerLat = 28.6;
    const centerLng = 77.2;
    const scale = 3000;
    
    const x = (lng - centerLng) * scale + 400;
    const y = (centerLat - lat) * scale + 300;
    
    return { x, y };
  };

  // Get color based on crowd level
  const getCrowdColor = (level) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Handle zoom
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle pan start
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Handle pan move
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset view
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Filter stations
  const filteredStations = stations.filter(station => {
    if (filter === 'all') return true;
    return station.crowdLevel === filter;
  });

  // Get crowd stats
  const crowdStats = {
    low: stations.filter(s => s.crowdLevel === 'low').length,
    moderate: stations.filter(s => s.crowdLevel === 'moderate').length,
    high: stations.filter(s => s.crowdLevel === 'high').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Live Metro Intelligence
          </h1>
          <p className="text-slate-300">Tap a station. View crowd levels. Choose smarter routes.</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Stations</p>
                <p className="text-2xl font-bold">{stations.length}</p>
              </div>
              <MapPin className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Low Crowd</p>
                <p className="text-2xl font-bold text-green-400">{crowdStats.low}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Moderate Crowd</p>
                <p className="text-2xl font-bold text-yellow-400">{crowdStats.moderate}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">High Crowd</p>
                <p className="text-2xl font-bold text-red-400">{crowdStats.high}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 overflow-hidden">
              {/* Map Controls */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('low')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filter === 'low'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Low
                  </button>
                  <button
                    onClick={() => setFilter('moderate')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filter === 'moderate'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => setFilter('high')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filter === 'high'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    High
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleZoom(0.2)}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <button
                    onClick={() => handleZoom(-0.2)}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <Locate size={20} />
                  </button>
                </div>
              </div>

              {/* Map Container */}
              <div
                className="relative bg-slate-200 overflow-hidden"
                style={{ height: '600px', cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>

                {/* SVG Map */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 800 600"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                  }}
                >
                  {/* Metro Lines */}
                  <g opacity="0.3" stroke="#475569" strokeWidth="2" fill="none">
                    {/* Blue Line connections */}
                    <path d="M 200,300 L 600,300" />
                    {/* Yellow Line connections */}
                    <path d="M 400,100 L 400,500" />
                    {/* Other connections */}
                    <path d="M 300,200 L 500,400" />
                    <path d="M 250,250 L 550,350" />
                  </g>

                  {/* Station Markers */}
                  {filteredStations.map((station) => {
                    const { x, y } = latLngToXY(station.lat, station.lng);
                    const color = getCrowdColor(station.crowdLevel);
                    const isSelected = selectedStation?.id === station.id;

                    return (
                      <g
                        key={station.id}
                        transform={`translate(${x}, ${y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStation(station);
                        }}
                        className="cursor-pointer"
                      >
                        {/* Pulse animation for high crowd */}
                        {station.crowdLevel === 'high' && (
                          <circle
                            r="20"
                            fill={color}
                            opacity="0.3"
                            className="animate-ping"
                          />
                        )}
                        
                        {/* Station marker */}
                        <circle
                          r={isSelected ? "16" : "12"}
                          fill={color}
                          stroke="white"
                          strokeWidth={isSelected ? "3" : "2"}
                          className="transition-all"
                        />
                        
                        {/* Station icon */}
                        <text
                          textAnchor="middle"
                          dy="0.3em"
                          fontSize="10"
                          fill="white"
                          fontWeight="bold"
                        >
                          M
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
                  <p className="text-sm font-semibold mb-2">Color Coding</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-slate-300">Green (Low)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-slate-300">Yellow (Medium)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-slate-300">Red (High)</span>
                    </div>
                  </div>
                </div>

                {/* Real-time badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span className="text-sm font-semibold">Real-Time Coverage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Station Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedStation ? (
              <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedStation.name}</h2>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="p-1 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Crowd Status */}
                <div className={`p-4 rounded-xl mb-4 ${
                  selectedStation.crowdLevel === 'high' ? 'bg-red-500/20 border border-red-500/50' :
                  selectedStation.crowdLevel === 'moderate' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                  'bg-green-500/20 border border-green-500/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} className={
                      selectedStation.crowdLevel === 'high' ? 'text-red-400' :
                      selectedStation.crowdLevel === 'moderate' ? 'text-yellow-400' :
                      'text-green-400'
                    } />
                    <span className="font-semibold capitalize">{selectedStation.crowdLevel} Crowd</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {selectedStation.crowdLevel === 'high' && 'Consider alternative routes or wait for off-peak hours.'}
                    {selectedStation.crowdLevel === 'moderate' && 'Moderate congestion expected. Plan accordingly.'}
                    {selectedStation.crowdLevel === 'low' && 'Great time to travel! Station is relatively empty.'}
                  </p>
                </div>

                {/* Station Info */}
                <div className="space-y-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <MapPin size={18} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-400">Metro Line</p>
                      <p className="font-semibold">{selectedStation.line}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <Clock size={18} className="text-purple-400" />
                    <div>
                      <p className="text-xs text-slate-400">Last Updated</p>
                      <p className="font-semibold">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <Users size={18} className="text-green-400" />
                    <div>
                      <p className="text-xs text-slate-400">Community Reports</p>
                      <p className="font-semibold">24 reports today</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all">
                    Find Alternate Route
                  </button>
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all">
                    Report Crowd Status
                  </button>
                </div>

                {/* Trend Chart Placeholder */}
                <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={18} className="text-blue-400" />
                    <span className="font-semibold">Today's Trend</span>
                  </div>
                  <div className="h-32 flex items-end justify-between gap-1">
                    {[40, 60, 80, 70, 90, 85, 75, 60].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>6AM</span>
                    <span>12PM</span>
                    <span>6PM</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-semibold mb-2">Select a Station</h3>
                  <p className="text-slate-400 text-sm">
                    Click on any station marker to view detailed crowd information and insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetroLiveMap;