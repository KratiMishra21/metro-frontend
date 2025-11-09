// frontend/lib/api/metroMap.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://speedline-metro-backend.onrender.com';

export interface StationData {
  _id: string;
  stationId: string;
  name: string;
  coordinates: [number, number];
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
  try {
    const url = `${API_URL}/api/metro-map/live-data`;
    console.log('🔍 Fetching live map data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Received data:', data);
    
    return data;
  } catch (error: any) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

export async function getStationDetails(stationId: string) {
  try {
    const url = `${API_URL}/api/metro-map/stations/${stationId}/details`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getNearbyStations(longitude: number, latitude: number, maxDistance?: number) {
  try {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      ...(maxDistance && { maxDistance: maxDistance.toString() })
    });

    const url = `${API_URL}/api/metro-map/nearby?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}
