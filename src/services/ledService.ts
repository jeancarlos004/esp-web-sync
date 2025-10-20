import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface LedState {
  id: string;
  led_number: number;
  state: boolean;
  updated_at: string;
}

export const ledService = {
  async getStates(): Promise<LedState[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/led-states?device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    const data = await handleApiResponse(response);
    return data.data || data;
  },

  async updateLed(ledNumber: number, state: boolean): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/led/update`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        led_number: ledNumber,
        state,
        device_id: API_CONFIG.DEVICE_ID,
      }),
    });
    await handleApiResponse(response);
  },

  async getHistory(limit = 5): Promise<any[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/led/history?limit=${limit}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );
    return handleApiResponse(response);
  },
};
