import HomeHeader from "@/components/Header/HomeHeader";
import TaskListHeader from "@/components/Header/TaskListHeader";
import { Tabs } from "expo-router";
import { Home, ClipboardList, MessageSquare, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
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
        name="home"
        options={{
          title: "Главная",
          header: () => <HomeHeader />,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
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
        name="messages"
        options={{
          title: "Сообщения",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
