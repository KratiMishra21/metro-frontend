const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface StationData {
  _id: string;
  stationId: string;
  name: string;
  coordinates: [number, number]; // [lng, lat] - GeoJSON format
  lines: string[];
  isInterchange: boolean;
  crowdLevel: 'low' | 'medium' | 'high';
  reportCount: number;
  lastUpdated: string | null;
}

export interface LiveMapResponse {
  success: boolean;
  data: {
    stations: StationData[];
    totalStations: number;
    timestamp: string;
  };
}

export async function getLiveMapData(): Promise<LiveMapResponse> {
  const response = await fetch(`${API_URL}/metro-map/live-data`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch live map data');
  }
  
  return response.json();
}

export async function getStationDetails(stationId: string) {
  const response = await fetch(`${API_URL}/metro-map/stations/${stationId}/details`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch station details');
  }
  
  return response.json();
}

export async function getNearbyStations(longitude: number, latitude: number, maxDistance?: number) {
  const params = new URLSearchParams({
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    ...(maxDistance && { maxDistance: maxDistance.toString() })
  });

  const response = await fetch(`${API_URL}/metro-map/nearby?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch nearby stations');
  }
  
  return response.json();
}