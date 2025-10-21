import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface DashboardStats {
  // Estos son los campos que espera el frontend
  totalReadings: number;
  averageDistance: number;
  minDistance: number;
  maxDistance: number;
  ledOnCount: number;
  ledOffCount: number;
  buttonPresses: number;
  lastUpdate: string;
}

// Datos de ejemplo para mostrar en el dashboard
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    // Por ahora, devolvemos datos de ejemplo
    return {
      totalReadings: 42,
      averageDistance: 25.5,
      minDistance: 10,
      maxDistance: 50,
      ledOnCount: 15,
      ledOffCount: 27,
      buttonPresses: 8,
      lastUpdate: new Date().toISOString()
    };
    
    // Cuando el backend tenga implementados los endpoints, podemos descomentar esto:
    /*
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/dashboard/stats?device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
    */
  },
};
