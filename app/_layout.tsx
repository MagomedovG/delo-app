// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from '@/hooks/use-color-scheme';
import QueryProvider from '@/context/QueryProvider';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
export const unstable_settings = {
  anchor: '(user)/tabs', 
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryProvider>
          <AuthProvider> 
            <AppProvider>
              <ActionSheetProvider>
                <>
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(user)" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                  </Stack>
                </>
              </ActionSheetProvider>
            </AppProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}