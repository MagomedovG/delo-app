// app/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { ActivityIndicator, View } from 'react-native';
import { Storage } from '@/utils/storage';
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useApp();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
  } | null>(null);

  useEffect(() => {
    const loadAuthStatus = async () => {
      try {
        const [isAuth, onboarding] = await Promise.all([
          Storage.getItem('isAuth'),
          Storage.getItem('onboardingCompleted')
        ]);
        // const isAuth = await Storage.getItem('isAuth')
        setAuthStatus({
          isAuthenticated: Boolean(isAuth),
          hasCompletedOnboarding: Boolean(onboarding)
        });
        // setAuthStatus({
        //   isAuthenticated: Boolean(isAuth)
        // });
      } catch (error) {
        console.error('Error loading auth status:', error);
        setAuthStatus({
          isAuthenticated: false,
          hasCompletedOnboarding: false
        });
      }
    };

    loadAuthStatus();
  }, []);

  useEffect(() => {
    // Даем время на монтирование навигации и загрузку статуса
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    // Даем время на монтирование навигации
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;
    console.log(authStatus, authStatus?.isAuthenticated, authStatus?.hasCompletedOnboarding)
    if (authStatus?.isAuthenticated) {
      if (authStatus.hasCompletedOnboarding) {
        router.replace('/(user)/tabs/home');
      } else {
        router.replace('/onboarding');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [authStatus, hasCompletedOnboarding, isNavigationReady]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}