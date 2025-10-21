import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface LedState {
  id: string;
  led_number: number;
  state: boolean;
  updated_at: string;
}

/**
 * Servicio para interactuar con los LEDs del sistema.
 * Nota: Los LEDs solo pueden ser controlados a través de los pulsadores físicos.
 */
export const ledService = {
  /**
   * Obtiene el estado actual de todos los LEDs
   * @returns Promesa con el estado de los LEDs
   */
  async getStates(): Promise<LedState[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/led/status?device_id=${API_CONFIG.DEVICE_ID}`,
        { 
          method: 'GET',
          headers: getHeaders(true),
          cache: 'no-store' // Evitar caché para obtener siempre el estado más reciente
        }
      );
      
      const data = await handleApiResponse(response);
      
      // Transformar el formato de respuesta si es necesario
      if (data.leds) {
        return Object.entries(data.leds).map(([led_number, state]) => ({
          id: `led-${led_number}`,
          led_number: parseInt(led_number, 10),
          state: Boolean(state),
          updated_at: new Date().toISOString()
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener el estado de los LEDs:', error);
      // Retornar un estado por defecto en caso de error
      return [1, 2, 3].map(led_number => ({
        id: `led-${led_number}`,
        led_number,
        state: false,
        updated_at: new Date().toISOString()
      }));
    }
  },

  /**
   * @deprecated Los LEDs solo pueden ser controlados a través de los pulsadores físicos
   */
  async updateLed(ledNumber: number, state: boolean): Promise<void> {
    console.warn('Los LEDs solo pueden ser controlados a través de los pulsadores físicos');
    return Promise.resolve();
  },

  /**
   * Obtiene el historial de cambios de los LEDs
   * @param limit Número máximo de registros a devolver
   * @returns Promesa con el historial de cambios
   */
  async getHistory(limit = 5): Promise<Array<{
    id: string;
    led_number: number;
    state: boolean;
    changed_at: string;
  }>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/led/history?limit=${limit}&device_id=${API_CONFIG.DEVICE_ID}`,
        { 
          headers: getHeaders(true),
          cache: 'no-store'
        }
      );
      
      const data = await handleApiResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener el historial de LEDs:', error);
      return [];
    }
  },
};
