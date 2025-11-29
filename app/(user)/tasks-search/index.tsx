// app/(user)/tasks-search.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useColorScheme } from 'react-native';
import { TaskItem } from '@/components/TaskItem';
import { useTasksWithQuery } from '@/api/tasks/getTasks';
import TaskListSearchHeader from '@/components/Header/TaskListSearchHeader';

export default function TasksSearch() {
  const searchParams = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  console.log('Приняли  параметры на экране', searchParams)
  // Преобразуем параметры URL в фильтры для хука
  const filters = useMemo(() => {
    const filters: any = {
      limit: 15,
      sortBy: 'date'
    };

    // Поисковый запрос
    // if (searchParams.search) {
    //   filters.search = searchParams.search as string;
    // }

    // Статус
    if (searchParams.status) {
      filters.status = searchParams.status as string;
    }

    // Тип бюджета
    if (searchParams.budget_type) {
      filters.budget_type = searchParams.budget_type as string;
    }

    // Цена
    if (searchParams.price_min) {
      filters.price_min = parseInt(searchParams.price_min as string);
    }
    if (searchParams.price_max) {
      filters.price_max = parseInt(searchParams.price_max as string);
    }

    // Категории
    if (searchParams.category) {
      filters.category = searchParams.category as string;
    }

    // Локация
    if (searchParams.location) {
      filters.location = searchParams.location as string;
    }

    // Сортировка
    if (searchParams.sort) {
      filters.sortBy = searchParams.sort as string;
    }

    // Дополнительные фильтры
    if (searchParams.with_responses === 'true') {
      filters.with_responses = true;
    }
    if (searchParams.urgent === 'true') {
      filters.urgent = true;
    }

    return filters;
  }, [searchParams]);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useTasksWithQuery(filters);

  // Собираем все задачи из всех страниц
  const allTasks = useMemo(() => {
    return data?.pages.flatMap(page => page.tasks) || [];
  }, [data]);

  // Общее количество задач
  const totalTasks = data?.pages[0]?.pagination.total || 0;

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <TaskListSearchHeader 
          totalTasks={totalTasks}
          // searchQuery={searchParams.search as string}
        />
      )
    });
  }, [navigation, totalTasks, searchParams.search]);

  const loadMoreTasks = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onRefresh = () => {
    refetch();
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem 
      task={item} 
      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
      variant="list"
      swipeEnabled={false}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={isDark ? "#60a5fa" : "#2563eb"} />
        <Text style={[styles.footerText, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
          Загружаем еще задачи...
        </Text>
      </View>
    );
  };

  const styles = getStyles(isDark);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
        <Text style={[styles.loadingText, { color: isDark ? "#d1d5db" : "#6b7280" }]}>
          Загружаем задачи...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка загрузки</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Заголовок с информацией о поиске */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>
          {searchParams.search ? `Поиск: "${searchParams.search}"` : 'Все задания'}
        </Text>
        <Text style={styles.subtitle}>
          Найдено заданий: {totalTasks}
          {Object.keys(filters).length > 2 && ' (с фильтрами)'}
        </Text>
      </View> */}

      {/* Список задач */}
      <FlatList
        data={allTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={onRefresh}
            tintColor={isDark ? "#60a5fa" : "#2563eb"}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Задания не найдены</Text>
            <Text style={styles.emptySubtext}>
              Попробуйте изменить параметры поиска или фильтры
            </Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? "#111827" : "#f9fafb",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#374151" : "#e5e7eb",
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap:10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? "#111827" : "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? "#111827" : "#f9fafb",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
    textAlign: 'center',
  },
});