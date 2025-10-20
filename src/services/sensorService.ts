import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface SensorReading {
  id: string;
  distance: number;
  timestamp: string;
  device_id: string;
}

export const sensorService = {
  async getHistory(limit = 50): Promise<SensorReading[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/sensor/history?limit=${limit}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
  },

  async getHistoryByDate(startDate: string, endDate: string): Promise<SensorReading[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/sensor/history?start_date=${startDate}&end_date=${endDate}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
  },

  async saveSensorData(distance: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/sensor`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        distance,
        device_id: API_CONFIG.DEVICE_ID,
      }),
    });
    await handleApiResponse(response);
  },
};
