import { API_CONFIG, getHeaders } from '@/config/api';

export const reportService = {
  async exportPDF(startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/reports/export/pdf?start_date=${startDate}&end_date=${endDate}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );

    if (!response.ok) {
      throw new Error('Error generando PDF');
    }

    return response.blob();
  },

  async exportExcel(startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/reports/export/excel?start_date=${startDate}&end_date=${endDate}&device_id=${API_CONFIG.DEVICE_ID}`,
      { headers: getHeaders(true) }
    );

    if (!response.ok) {
      throw new Error('Error generando Excel');
    }

    return response.blob();
  },

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
