// utils/api.ts
import { Storage } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    let accessToken = await Storage.getToken('accessToken');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    };

    let response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Если токен истек, пробуем обновить
    if (response.status === 401 && accessToken) {
      const newTokens = await refreshTokens();
      
      if (newTokens) {
        // Повторяем запрос с новым токеном
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
        };
        response = await fetch(`${BASE_URL}${endpoint}`, config);
      }
    }

    return response;
  },
};

async function refreshTokens() {
  try {
    const refreshToken = await Storage.getToken('refreshToken');
    
    if (!refreshToken) return null;

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    console.log('/auth/refresh')
    if (response.ok) {
      const data = await response.json();
      console.log(data)
      if (data.success) {
        // Сохраняем новые токены
        await Promise.all([
          Storage.setToken('accessToken', data.data.accessToken),
          Storage.setToken('refreshToken', data.data.refreshToken),
        ]);

        return data.data;
      }
    }
  } catch (error) {
    console.error('Token refresh error:', error);
  }

  return null;
}