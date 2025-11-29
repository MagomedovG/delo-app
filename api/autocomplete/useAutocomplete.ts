// hooks/useAutocomplete.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

interface AutocompleteItem {
  id: string;
  title: string;
}

interface UseAutocompleteProps {
  searchQuery: string;
  enabled?: boolean;
}

export function useAutocomplete({ searchQuery, enabled = true }: UseAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['autocomplete', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return { tasks: [] };
      }

      const params = new URLSearchParams({
        search: searchQuery.trim(),
        status: 'open',
        page: '1',
        limit: '10'
      });

      const response = await api.request(`/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      return response.json();
    },
    enabled: enabled && searchQuery.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Упрощенная логика открытия/закрытия
  useEffect(() => {
    if (searchQuery.length > 0 && enabled) {
      // Открываем автокомплит когда есть запрос
      setIsOpen(true);
    } else {
      // Закрываем когда запрос пустой
      setIsOpen(false);
      setSuggestions([]);
    }
  }, [searchQuery, enabled]);

  // Обновляем suggestions когда приходят данные
  useEffect(() => {
    if (data?.data?.tasks) {
      const uniqueTitles = new Set<string>();
      const items: AutocompleteItem[] = [];

      data.data.tasks.forEach((task: any) => {
        if (!uniqueTitles.has(task.title)) {
          uniqueTitles.add(task.title);
          items.push({
            id: task.id,
            title: task.title,
          });
        }
      });

      setSuggestions(items);
    }
  }, [data]);

  const closeAutocomplete = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openAutocomplete = useCallback(() => {
    if (searchQuery.length > 0) {
      setIsOpen(true);
    }
  }, [searchQuery]);

  return {
    suggestions,
    isOpen,
    isLoading: isLoading || isFetching,
    error,
    closeAutocomplete,
    openAutocomplete,
  };
}