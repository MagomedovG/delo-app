// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '@/utils/storage';

// 1. Сначала создаем контекст
const AuthContext = createContext<any>(null); // Можно типизировать properly

// 2. Интерфейсы для TypeScript (опционально, но рекомендуется)
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  completedTasks: number;
  hasCompletedOnboarding: boolean;
}

interface AuthState {
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

// 3. Провайдер
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    accessToken: null,
    refreshToken: null,
    user: null,
  });

  // Загрузка токенов при старте
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const [accessToken, refreshToken, user] = await Promise.all([
        Storage.getToken('accessToken'),
        Storage.getToken('refreshToken'),
        Storage.getItem('user'),
      ]);

      setAuthState({
        isLoading: false,
        accessToken,
        refreshToken,
        user,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (tokens: { accessToken: string; refreshToken: string }, user: User) => {
    try {
      await Promise.all([
        Storage.setToken('accessToken', tokens.accessToken),
        Storage.setToken('refreshToken', tokens.refreshToken),
        Storage.setItem('user', user),
      ]);

      setAuthState({
        isLoading: false,
        ...tokens,
        user,
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        Storage.deleteToken('accessToken'),
        Storage.deleteToken('refreshToken'),
        Storage.removeItem('user'),
      ]);

      setAuthState({
        isLoading: false,
        accessToken: null,
        refreshToken: null,
        user: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Хук для использования контекста
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}