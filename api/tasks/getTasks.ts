// hooks/useTasksWithInfiniteScroll.ts
import { api } from '@/utils/api';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  priceType: string;
  priceMax?: number;
  location: string;
  locationCoords: {
    lat: number;
    lng: number;
  };
  deadline: string;
  status: string;
  offersCount: number;
  author: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TasksFilters {
  category?: string;
  status?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  search?: string;
  budget_type?: string;
  price_min?: number;
  price_max?: number;
  with_responses?: boolean;
  urgent?: boolean;
  page?: number;
  limit?: number;
}

interface TasksResponseWithPagination {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

interface InfiniteTasksResponse {
  tasks: Task[];
  pagination: TasksResponseWithPagination['data']['pagination'];
}

export const useTasksWithQuery = (filters: TasksFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['tasks-infinite', filters], // Уберите явные типы для упрощения
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      
      // Основные фильтры
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.search) params.append('search', filters.search);
      
      // Дополнительные фильтры из модалки
      if (filters.budget_type) params.append('budgetType', filters.budget_type);
      if (filters.price_min) params.append('minPrice', filters.price_min.toString());
      if (filters.price_max) params.append('maxPrice', filters.price_max.toString());
      if (filters.with_responses) params.append('withResponses', 'true');
      if (filters.urgent) params.append('urgent', 'true');
      
      // Пагинационные параметры - используем pageParam
      params.append('page', pageParam.toString());
      params.append('limit', (filters.limit || 10).toString()); // Убедитесь, что limit совпадает

      const queryString = params.toString();
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      
      console.log('Fetching page:', pageParam); // Добавьте логирование для отладки
      
      const response = await api.request(url);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки задач: ${response.status}`);
      }

      const data: TasksResponseWithPagination = await response.json();
      console.log(data.data.tasks.map(item => item.budgetType))
      if (data.success) {
        return {
          tasks: data.data.tasks,
          pagination: data.data.pagination
        };
      } else {
        throw new Error("Не удалось загрузить задачи");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      
      const { page, totalPages } = lastPage.pagination;
      
      // Если текущая страница меньше общего количества страниц - есть следующая
      if (page < totalPages) {
        return page + 1;
      }
      
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};