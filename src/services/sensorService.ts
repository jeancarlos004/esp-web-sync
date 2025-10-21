import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface SensorReading {
  id: string;
  distance: number;
  timestamp: string;
  device_id: string;
}

// Función para generar datos de ejemplo
function generateMockData(limit: number): SensorReading[] {
  const now = new Date();
  const data: SensorReading[] = [];
  
  for (let i = 0; i < limit; i++) {
    const timestamp = new Date(now.getTime() - i * 60000); // Un minuto entre lecturas
    data.push({
      id: `mock-${i}`,
      distance: Math.floor(Math.random() * 50) + 10, // Valor aleatorio entre 10 y 60
      timestamp: timestamp.toISOString(),
      device_id: API_CONFIG.DEVICE_ID,
    });
  }
  
  return data;
}

export const sensorService = {
  async getHistory(limit = 50): Promise<SensorReading[]> {
    // Por ahora, devolvemos datos de ejemplo
    return generateMockData(limit);
    
    // Cuando el backend tenga implementados los endpoints, podemos descomentar esto:
    /*
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/sensor/history?limit=${limit}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
    */
  },

  async getHistoryByDate(startDate: string, endDate: string): Promise<SensorReading[]> {
    // Por ahora, devolvemos datos de ejemplo
    return generateMockData(20);
    
    // Cuando el backend tenga implementados los endpoints, podemos descomentar esto:
    /*
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/sensor/history?start_date=${startDate}&end_date=${endDate}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
    */
  },

  async saveSensorData(distance: number): Promise<void> {
    // En modo demo, solo mostramos los datos en consola
    console.log('Guardando lectura del sensor:', { distance, device_id: API_CONFIG.DEVICE_ID });
    
    // Cuando el backend esté listo, podemos descomentar esto:
    /*
    const response = await fetch(`${API_CONFIG.BASE_URL}/sensor`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ distance, device_id: API_CONFIG.DEVICE_ID }),
    });
    await handleApiResponse(response);
    */
  },
};
