// app/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useApp();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Даем время на монтирование навигации
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    if (isAuthenticated) {
      if (hasCompletedOnboarding) {
        router.replace('/(user)/tabs/home');
      } else {
        router.replace('/onboarding');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, hasCompletedOnboarding, isNavigationReady]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}