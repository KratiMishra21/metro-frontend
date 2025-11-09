'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, MapPin, TrendingUp } from 'lucide-react';
import MetroNetworkMapMini from './metro-network-map-mini';
import { getLiveMapData, getStationDetails, StationData } from '@/lib/api/metroMap';

export default function LiveMetroMap() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await getLiveMapData();
      setStations(response.data.stations);
      setLastUpdated(new Date(response.data.timestamp));
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = async (station: StationData) => {
    try {
      const details = await getStationDetails(station._id);
      setSelectedStation(details.data);
    } catch (error) {
      console.error('Failed to fetch station details:', error);
    }
  };

  useEffect(() => {
    fetchMapData();

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(fetchMapData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const crowdStats = {
    low: stations.filter(s => s.crowdLevel === 'low').length,
    medium: stations.filter(s => s.crowdLevel === 'medium').length,
    high: stations.filter(s => s.crowdLevel === 'high').length,
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-400" />
              Live Metro Intelligence
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time crowd monitoring across {stations.length}+ stations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Last Updated</div>
              <div className="text-sm text-white font-mono">
                {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Crowd Stats */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-4">
          <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-sm">Low Crowd</span>
              <span className="text-2xl font-bold text-green-400">{crowdStats.low}</span>
            </div>
          </div>
          
          <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 text-sm">Medium Crowd</span>
              <span className="text-2xl font-bold text-yellow-400">{crowdStats.medium}</span>
            </div>
          </div>
          
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-red-400 text-sm">High Crowd</span>
              <span className="text-2xl font-bold text-red-400">{crowdStats.high}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Main Map */}
        <div className="flex-1 p-4">
          <div className="h-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
            {loading && stations.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading live map data...</p>
                </div>
              </div>
            ) : (
              <MetroNetworkMapMini 
                stations={stations} 
                onStationClick={handleStationClick}
              />
            )}
          </div>
        </div>

        {/* Side Panel - Station Details */}
        {selectedStation && (
          <div className="w-96 p-4">
            <div className="h-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Station Details</h3>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {selectedStation.station.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          selectedStation.currentCrowdLevel === 'low'
                            ? '#10B981'
                            : selectedStation.currentCrowdLevel === 'medium'
                            ? '#EAB308'
                            : '#EF4444',
                      }}
                    />
                    <span className="text-gray-300 capitalize">
                      {selectedStation.currentCrowdLevel} Crowd
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Reports (Last Hour)</div>
                  <div className="text-3xl font-bold text-white">
                    {selectedStation.totalReportsLastHour}
                  </div>
                </div>

                {selectedStation.recentReports.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-400 mb-3">Recent Reports</h5>
                    <div className="space-y-2">
                      {selectedStation.recentReports.map((report: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gray-700/30 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="capitalize text-white">{report.crowdLevel}</span>
                            <span className="text-gray-400 text-xs">
                              {new Date(report.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {report.remarks && (
                            <p className="text-gray-400 text-xs">{report.remarks}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="fixed bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">Color Coding</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-gray-300">Low Crowd</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-gray-300">Medium Crowd</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-gray-300">High Crowd</span>
          </div>
        </div>
      </div>
    </div>
  );
}