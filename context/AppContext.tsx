// context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentUserId: string | null;
  setIsAuthenticated: (value: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setCurrentUserId: (id: string) => void;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Загружаем состояние при запуске
  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      const [auth, onboarding, userId] = await AsyncStorage.multiGet([
        'isAuthenticated',
        'hasCompletedOnboarding', 
        'currentUserId'
      ]);

      if (auth[1] === 'true') {
        setIsAuthenticated(true);
      }
      if (onboarding[1] === 'true') {
        setHasCompletedOnboarding(true);
      }
      if (userId[1]) {
        setCurrentUserId(userId[1]);
      }
    } catch (error) {
      console.error('Error loading app state:', error);
    }
  };

  const completeOnboarding = async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        hasCompletedOnboarding,
        currentUserId,
        setIsAuthenticated,
        setHasCompletedOnboarding,
        setCurrentUserId,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}