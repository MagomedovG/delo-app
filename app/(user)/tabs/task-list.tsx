// app/task-list.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { TaskList } from "@/components/Tasks/TaskList";
import { useApp } from "@/context/AppContext";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "react-native";
import { useMyTasks } from "@/api/tasks/getMyTask";

export default function MyTaskListPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // const { setSelectedTaskId } = useApp();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [filters, setFilters] = useState({
    status: params.status as string || 'all',
    page: 1,
    limit: 10
  });

  const { 
    data: tasksData, 
    isLoading, 
    error,
    refetch 
  } = useMyTasks(filters);

  const handleTaskClick = (taskId: string) => {
    // setSelectedTaskId(taskId);
    router.push(`/(user)/task/${taskId}`);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading && !tasksData) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: isDark ? "#111827" : "#f9fafb" 
      }}>
        <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
        <Text style={{ 
          marginTop: 12, 
          color: isDark ? "#d1d5db" : "#6b7280" 
        }}>
          Загрузка задач...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: isDark ? "#111827" : "#f9fafb",
        padding: 20 
      }}>
        <Text style={{ 
          color: isDark ? "#ef4444" : "#dc2626", 
          textAlign: 'center',
          fontSize: 16,
          marginBottom: 16
        }}>
          Ошибка загрузки: {error?.message}
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: isDark ? "#2563eb" : "#2563eb",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8
          }}
          onPress={() => refetch()}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Попробовать снова
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // <>
    // <Text>Мои таски</Text>
    // </>
    <TaskList
      tasks={tasksData?.tasks || []}
      pagination={tasksData?.pagination}
      filters={filters}
      onFilterChange={handleFilterChange}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      onBack={() => router.push("/home")}
      onTaskClick={handleTaskClick}
    />
  );
}