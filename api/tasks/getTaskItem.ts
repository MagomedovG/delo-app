// hooks/useTask.ts
import { api } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

interface TaskDetailResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    category: {
      id: string;
      name: string;
    };
    price: number;
    priceType: "fixed" | "hourly" | "range";
    priceMax?: number;
    location: string;
    locationCoords?: {
      lat: number;
      lng: number;
    };
    deadline: string;
    status: "open" | "in_progress" | "completed";
    author: {
      id: string;
      name: string;
      avatar?: string;
      rating: number;
      reviewsCount: number;
    };
    offersCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await api.request(`/tasks/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const data: TaskDetailResponse = await response.json();
      console.log(data)
      if (data.success) {
        return data.data;
      } else {
        throw new Error("Не удалось загрузить задачу");
      }
    },
    enabled: !!taskId, // Запрос выполняется только если передан taskId
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });
};