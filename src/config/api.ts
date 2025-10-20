// Configuración de la API externa Python+MySQL
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api', // Cambiar por la URL de tu API
  DEVICE_ID: 'ESP32-001',
  TIMEOUT: 10000,
};

// Headers comunes para todas las peticiones
export const getHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Manejo de respuestas de API
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
};
