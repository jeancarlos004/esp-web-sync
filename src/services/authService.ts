import { API_CONFIG, getHeaders, handleApiResponse } from '@/config/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleApiResponse(response);
    
    // Guardar token en localStorage
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Notificar a la API que se inició sesión (para mostrar en LCD)
    await this.notifyLogin(data.user.name);
    
    return data;
  },

  async register(email: string, password: string, name: string): Promise<LoginResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    const data = await handleApiResponse(response);
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: getHeaders(true),
      });
      return await handleApiResponse(response);
    } catch {
      return null;
    }
  },

  async notifyLogin(username: string): Promise<void> {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/user/login-notification`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ username }),
      });
    } catch (error) {
      console.error('Error notificando login:', error);
    }
  },

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  },

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
