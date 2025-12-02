// app/(user)/(tabs)/task/[id].tsx
import { useTask } from '@/api/tasks/getTaskItem';
import { TaskDetail } from '@/components/Tasks/TaskDetail';
import { Storage } from '@/utils/storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const { data: task, isLoading, error } = useTask(id as string);
  const [currentUserId, setCurrentUserId] = useState()
  useEffect(() => {
    const loadAuthStatus = async () => {
      try {

        const user = await Storage.getItem('user')
        setCurrentUserId(user.id)
      } catch (error) {
        console.error('Error loading auth status:', error);
        
      }
    };

    loadAuthStatus();
  }, []);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text allowFontScaling={false} style={{ marginTop: 16 }}>Загрузка задачи...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text allowFontScaling={false} style={{ fontSize: 18, color: '#ef4444', textAlign: 'center' }}>
          {error?.message || 'Не удалось загрузить задачу'}
        </Text>
      </View>
    );
  }

  return (
    <TaskDetail 
      task={task} // Передаем данные задачи
      currentUserId={currentUserId || ""} // Здесь должен быть ID текущего пользователя
      onBack={() => router.back()}
    />
  );
}