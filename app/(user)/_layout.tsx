// app/(user)/_layout.tsx
import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="task-detail" />
      <Stack.Screen name="create-task" />
    </Stack>
  );
}