// hooks/useTasksWithInfiniteScroll.ts
import { api } from '@/utils/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Task, TasksFilters } from './useTasks'; // Импортируем типы

interface TasksResponseWithPagination {
  success: boolean;
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface InfiniteTasksResponse {
  tasks: Task[];
  pagination: TasksResponseWithPagination['pagination'];
}

export const useTasksWithQuery = (filters: TasksFilters = {}) => {
  return useInfiniteQuery<
    InfiniteTasksResponse,
    Error,
    InfiniteTasksResponse,
    [string, TasksFilters],
    number
  >({
    queryKey: ['tasks-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.search) params.append('search', filters.search);
      
      // Пагинационные параметры
      params.append('page', pageParam.toString());
      params.append('limit', (filters.limit || 15).toString());

      const queryString = params.toString();
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      const response = await api.request(url);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки задач: ${response.status}`);
      }

      const data: TasksResponseWithPagination = await response.json();
      console.log(url, data.data.tasks?.[0])
      
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
      const { pagination } = lastPage;
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};