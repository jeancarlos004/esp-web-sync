import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface DashboardStats {
  totalReadings: number;
  averageDistance: number;
  minDistance: number;
  maxDistance: number;
  ledOnCount: number;
  ledOffCount: number;
  buttonPresses: number;
  lastUpdate: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/dashboard/stats?device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
  },
};
