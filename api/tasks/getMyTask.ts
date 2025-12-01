// hooks/useMyTasks.ts
import { api } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

interface Task {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  priceType: "fixed" | "hourly" | "range";
  deadline: string;
  location: string;
  offersCount: number;
  status: "open" | "in_progress" | "completed";
  category: string;
  categoryName: string;
  postedDate: string;
  image?: string;
}

interface MyTasksResponse {
  success: boolean;
  tasks: Task[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MyTasksFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export const useMyTasks = (filters: MyTasksFilters = {}) => {
  return useQuery<{
    tasks: Task[];
    pagination: MyTasksResponse['pagination'];
  }, Error>({
    queryKey: ['my-tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `/tasks/my-tasks?${queryString}` : '/tasks/my-tasks';

      const response = await api.request(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки задач: ${response.status}`);
      }

      const taskData: {data:MyTasksResponse; success:boolean} = await response.json();
      const data: MyTasksResponse =  taskData.data
      console.log(data)

      if (taskData?.success) {
        return {
          tasks: data.tasks,
          pagination: data.pagination || {
            page: 1,
            limit: 10,
            total: data?.tasks?.length,
            totalPages: 1
          }
        };
      } else {
        throw new Error("Не удалось загрузить задачи");
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};