// frontend/lib/api/metroMap.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://speedline-metro-backend.onrender.com';

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

export interface StationDetailsResponse {
  success: boolean;
  data: {
    station: any;
    currentCrowdLevel: 'low' | 'medium' | 'high';
    recentReports: any[];
    totalReportsLastHour: number;
  };
}

export async function getLiveMapData(): Promise<LiveMapResponse> {
  try {
    console.log('Fetching from:', `${API_URL}/metro-map/live-data`);
    
    const response = await fetch(`${API_URL}/metro-map/live-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    
    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch live map data');
  }
}

export async function getStationDetails(stationId: string): Promise<StationDetailsResponse> {
  try {
    const response = await fetch(`${API_URL}/metro-map/stations/${stationId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch station details');
  }
}

export async function getNearbyStations(longitude: number, latitude: number, maxDistance?: number) {
  try {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      ...(maxDistance && { maxDistance: maxDistance.toString() })
    });

    const response = await fetch(`${API_URL}/metro-map/nearby?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch nearby stations');
  }
}
