import { TaskDetail } from '@/components/TaskDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // В реальном приложении currentUserId будет из контекста или хранилища
  const currentUserId = "user123";

  return (
    <TaskDetail
      taskId={String(id)}
      currentUserId={currentUserId}
      onBack={() => router.back()}
    />
  );
}