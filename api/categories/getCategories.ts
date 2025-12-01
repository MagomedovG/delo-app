// hooks/useCategories.ts
import { api } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

interface Category {
  id: string;
  name: string;
  icon: string;
  tasksCount: number;
}

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
}

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.request('/categories');
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const data: CategoriesResponse = await response.json();
      // console.log('/categories', data)
      
      if (data.success) {
        return data.data.categories;
      } else {
        throw new Error("Не удалось загрузить категории");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });
};