// app/(user)/(tabs)/task/[id].tsx
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { TaskDetail } from '@/components/TaskDetail';
import { useTask } from '@/api/tasks/getTaskItem';

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const { data: task, isLoading, error } = useTask(id as string);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 16 }}>Загрузка задачи...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 18, color: '#ef4444', textAlign: 'center' }}>
          {error?.message || 'Не удалось загрузить задачу'}
        </Text>
      </View>
    );
  }

  return (
    <TaskDetail 
      task={task} // Передаем данные задачи
      currentUserId={task?.posterId} // Здесь должен быть ID текущего пользователя
      onBack={() => router.back()}
    />
  );
}