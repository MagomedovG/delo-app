import HomeHeader from "@/components/Header/HomeHeader";
import TaskListHeader from "@/components/Header/TaskListHeader";
import { Tabs } from "expo-router";
import { Home, ClipboardList, MessageSquare, User, ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from 'react-native';

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
  return (
    <Tabs
    screenOptions={{
        // headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
          height: 60 + insets.bottom, // Динамическая высота с учетом безопасной зоны
          paddingBottom: 8 + insets.bottom, // Динамический отступ
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Главная",
          header: () => <HomeHeader />,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="home/category/[id]"
        options={{
          href:null
        }}
      />
      <Tabs.Screen
        name="task-list"
        options={{
          title: "Мои Задания",
          header: () => <TaskListHeader />,
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          title: "Сообщения",
          headerShown: true,
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
      
      {/* <Tabs.Screen
        name="chat/[id]/index"
        options={{
          tabBarStyle: {
              display: 'none', // Полностью скрыть таббар
          },
          headerShown: true,
          
          href:null
      }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Мой профиль",
          headerShown: true,
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
