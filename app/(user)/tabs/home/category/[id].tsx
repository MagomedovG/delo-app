// app/(user)/(tabs)/category/[id].tsx
import { View, Text, FlatList, useColorScheme, RefreshControl, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import TaskList from '../../task-list';
import { TaskItem } from '@/components/Tasks/TaskItem';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTasksWithQuery } from '@/api/tasks/getTasks';
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  icon: string;
  tasksCount: number;
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const categories = queryClient.getQueryData<Category[]>(['categories']);
    const category = categories?.find(cat => cat.id === id);
    
    navigation.setOptions({
      headerTitle: category?.name || `Категория ${id}`,
      headerLeft: () => (
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={{ paddingHorizontal: 12, paddingVertical: 5 }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? "#fff" : "#000"} 
          />
        </Pressable>
      ),
    });
  }, [id, navigation, queryClient]);

  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useTasksWithQuery({
    category:id,
    status: 'open',
    sortBy: 'date',
    limit: 10,
  });
  const onTaskClick = (id) => {
    console.log(id)
  }
  const allTasks = useMemo(() => {
    return data?.pages.flatMap(page => page.tasks) || [];
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const loadMoreTasks = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderTaskItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem 
      task={item} 
      onTaskClick={onTaskClick}
      variant="grid"
      swipeEnabled={false}
    />
  ), [onTaskClick]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator
          size="large"
          color={isDark ? '#60a5fa' : '#2563eb'}
        />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={allTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={isDark ? "#60a5fa" : "#2563eb"}
          />
        }
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.3}
        // ListHeaderComponent={ListHeaderComponent}
        // ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={21}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#f9fafb",
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 6,
      },
    
})