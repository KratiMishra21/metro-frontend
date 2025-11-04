// lib/api/reportService.ts
// Frontend API service - NO backend imports here!

const API_BASE_URL = "http://localhost:5000/api/reports";

// Generate unique user ID (using sessionStorage)
const getUserId = () => {
  if (typeof window === "undefined") return "user-" + Date.now();
  
  let userId = sessionStorage.getItem("userId");
  if (!userId) {
    userId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("userId", userId);
  }
  return userId;
};

// Submit a new crowd report
export const submitReport = async (
  station: string,
  level: "light" | "moderate" | "heavy",
  remarks?: string
) => {
  try {
    console.log("📝 Submitting report to:", `${API_BASE_URL}/submit`);
    console.log("Payload:", { station, level, remarks, userId: getUserId() });
    
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        station,
        level,
        remarks: remarks || "",
        userId: getUserId(),
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response statusText:", response.statusText);
    console.log("Response ok:", response.ok);
    
    // Get response as text first
    const responseText = await response.text();
    console.log("Response text length:", responseText.length);
    console.log("Response text:", responseText);

    if (!response.ok) {
      console.error("❌ Response NOT OK - Status:", response.status);
      let errorData = {};
      try {
        if (responseText) {
          errorData = JSON.parse(responseText);
        } else {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      } catch (e) {
        errorData = { error: responseText || `HTTP ${response.status}` };
      }
      console.error("❌ Parsed error data:", errorData);
      console.error("❌ Error message:", errorData.error || errorData.message || errorData);
      throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Report submitted successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error in submitReport:", error.message);
    throw error;
  }
};

// Get all recent reports
export const getAllReports = async (limit: number = 12, station?: string) => {
  try {
    let url = `${API_BASE_URL}/all?limit=${limit}`;
    if (station) {
      url += `&station=${encodeURIComponent(station)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch reports");
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.count} reports`);
    return data.reports;
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    throw error;
  }
};

// Get reports for a specific station
export const getStationReports = async (station: string, limit: number = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/station/${encodeURIComponent(station)}?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch station reports");
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.count} reports for ${station}`);
    return data.reports;
  } catch (error) {
    console.error("❌ Error fetching station reports:", error);
    throw error;
  }
};

// Get latest status for a specific station
export const getStationStatus = async (station: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/status/${encodeURIComponent(station)}`
    );

    if (!response.ok) {
      throw new Error("Station not found");
    }

    const data = await response.json();
    console.log(`✅ Fetched status for ${station}`);
    return data;
  } catch (error) {
    console.error("❌ Error fetching station status:", error);
    throw error;
  }
};

// Get crowd status summary for all stations
export const getCrowdSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary`);

    if (!response.ok) {
      throw new Error("Failed to fetch crowd summary");
    }

    const data = await response.json();
    console.log(`✅ Fetched summary for ${data.stationCount} stations`);
    return data.summary;
  } catch (error) {
    console.error("❌ Error fetching crowd summary:", error);
    throw error;
  }
};

// Get reports by crowd level
export const getReportsByLevel = async (
  level: "light" | "moderate" | "heavy",
  limit: number = 10
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/level/${level}?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reports by level");
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.count} reports with level: ${level}`);
    return data.reports;
  } catch (error) {
    console.error("❌ Error fetching reports by level:", error);
    throw error;
  }
};

// Get trending stations
export const getTrendingStations = async (limit: number = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trending?limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch trending stations");
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.count} trending stations`);
    return data.trendingStations;
  } catch (error) {
    console.error("❌ Error fetching trending stations:", error);
    throw error;
  }
};

// Like a report
export const likeReport = async (reportId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${reportId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to like report");
    }

    const data = await response.json();
    console.log(`✅ Report liked. Total likes: ${data.likes}`);
    return data;
  } catch (error) {
    console.error("❌ Error liking report:", error);
    throw error;
  }
};

// Delete a report
export const deleteReport = async (reportId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${reportId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: getUserId(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete report");
    }

    const data = await response.json();
    console.log("✅ Report deleted successfully");
    return data;
  } catch (error) {
    console.error("❌ Error deleting report:", error);
    throw error;
  }
}