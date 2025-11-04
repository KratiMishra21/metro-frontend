// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Helper Functions
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// ============================================
// STATION APIs
// ============================================

export interface Station {
  _id: string;
  stationId: string;
  name: string;
  coords: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  lines: string[];
  meta?: {
    entryCount?: number;
  };
}

export interface StationWithCrowd extends Station {
  crowdLevel: 'low' | 'moderate' | 'high';
  crowdConfidence: number;
  reportCount: number;
  lastUpdated: string | null;
}

// Get all stations
export const getAllStations = async (): Promise<Station[]> => {
  const response = await api.get<Station[]>('/api/stations');
  return response;
};

// Get all stations with crowd data
export const getAllStationsWithCrowd = async (): Promise<{
  success: boolean;
  count: number;
  data: StationWithCrowd[];
  timestamp: string;
}> => {
  return api.get('/api/stations/live/all');
};

// Get station by ID
export const getStationById = async (stationId: string): Promise<Station> => {
  return api.get(`/api/stations/${stationId}`);
};

// Get station live details
export const getStationLiveDetails = async (stationId: string): Promise<{
  success: boolean;
  data: StationWithCrowd & {
    recentReports: Report[];
    distribution: {
      low: number;
      moderate: number;
      high: number;
    };
  };
}> => {
  return api.get(`/api/stations/${stationId}/live`);
};

// Get station trends
export const getStationTrends = async (stationId: string): Promise<{
  success: boolean;
  stationId: string;
  stationName: string;
  trends: Array<{
    hour: number;
    level: 'low' | 'moderate' | 'high' | null;
    counts: {
      low: number;
      moderate: number;
      high: number;
    };
    total: number;
  }>;
}> => {
  return api.get(`/api/stations/${stationId}/trends`);
};

// Get nearby stations
export const getNearbyStations = async (
  lng: number,
  lat: number,
  maxDistance: number = 2000
): Promise<{
  success: boolean;
  count: number;
  data: StationWithCrowd[];
}> => {
  return api.get(`/api/stations/live/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`);
};

// Get crowd statistics
export const getCrowdStatistics = async (): Promise<{
  success: boolean;
  data: {
    total: number;
    low: number;
    moderate: number;
    high: number;
    mostCrowded: Array<{ stationId: string; name: string; reportCount: number }>;
    leastCrowded: Array<{ stationId: string; name: string }>;
  };
}> => {
  return api.get('/api/stations/live/stats');
};

// ============================================
// REPORT APIs
// ============================================

export interface Report {
  _id: string;
  station: string;
  level: 'low' | 'moderate' | 'high';
  remarks: string;
  userId: string;
  photo?: string;
  likes: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportData {
  station: string;
  level: 'low' | 'moderate' | 'high';
  remarks?: string;
  userId: string;
  photo?: string;
}

// Create a new report
export const createReport = async (data: CreateReportData): Promise<{
  success: boolean;
  message: string;
  data: Report;
}> => {
  return api.post('/api/reports', data);
};

// Get all reports
export const getAllReports = async (params?: {
  station?: string;
  level?: 'low' | 'moderate' | 'high';
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<{
  success: boolean;
  data: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    hasMore: boolean;
  };
}> => {
  const queryParams = new URLSearchParams();
  if (params?.station) queryParams.append('station', params.station);
  if (params?.level) queryParams.append('level', params.level);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const query = queryParams.toString();
  return api.get(`/api/reports${query ? `?${query}` : ''}`);
};

// Get report by ID
export const getReportById = async (reportId: string): Promise<{
  success: boolean;
  data: Report;
}> => {
  return api.get(`/api/reports/${reportId}`);
};

// Like a report
export const likeReport = async (reportId: string): Promise<{
  success: boolean;
  message: string;
  data: Report;
}> => {
  return api.patch(`/api/reports/${reportId}/like`, {});
};

// Delete a report
export const deleteReport = async (reportId: string, userId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  return api.delete(`/api/reports/${reportId}`);
};

// Get recent reports for a station
export const getRecentReports = async (stationId: string): Promise<{
  success: boolean;
  station: string;
  count: number;
  data: Report[];
  timeRange: string;
}> => {
  return api.get(`/api/reports/recent/${stationId}`);
};

// Get station reports with pagination
export const getStationReports = async (
  stationId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  stationId: string;
  stationName: string;
  data: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    hasMore: boolean;
  };
}> => {
  return api.get(`/api/stations/${stationId}/reports?page=${page}&limit=${limit}`);
};

// ============================================
// ROUTE APIs
// ============================================

export interface RouteRequest {
  from: string;
  to: string;
}

export interface RouteResponse {
  success: boolean;
  route: {
    from: string;
    to: string;
    path: string[];
    distance: number;
    stations: Station[];
  };
}

// Find route between two stations
export const findRoute = async (from: string, to: string): Promise<RouteResponse> => {
  return api.post('/api/routes/find', { from, to });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format time ago
export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

// Get crowd color
export const getCrowdColor = (level: 'low' | 'moderate' | 'high'): string => {
  switch (level) {
    case 'low':
      return '#10b981'; // green
    case 'moderate':
      return '#f59e0b'; // yellow
    case 'high':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

// Get crowd label
export const getCrowdLabel = (level: 'low' | 'moderate' | 'high'): string => {
  switch (level) {
    case 'low':
      return 'Low Crowd';
    case 'moderate':
      return 'Moderate Crowd';
    case 'high':
      return 'High Crowd';
    default:
      return 'Unknown';
  }
};

export default api;