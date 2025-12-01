import { mockTasks } from "@/data/mocktasks";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { TaskItem } from "./Tasks/TaskItem";
import { Task } from "./Tasks/TaskList.js";
import { useColorScheme } from "react-native";
import { useTasksWithQuery } from "@/api/tasks/getTasks";
import { useCategories } from "@/api/categories/getCategories";
import { useAutocomplete } from "@/api/autocomplete/useAutocomplete";
import { AutocompleteList } from "./SearchComponents/AutocompleteList";
import { SearchOverlay } from "./SearchComponents/SearchOverlay";

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
}

interface HomeProps {
  onCategoryClick: (id: string) => void;
  onCreateTask: () => void;
  onTaskClick: (taskId: string) => void;
  onViewOffers?: () => void;
  onViewProfile?: () => void;
}

export function Home({ onCategoryClick, onCreateTask, onTaskClick, onViewOffers, onViewProfile }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const styles = getStyles(isDark);
  const { data: categories } = useCategories();

  // Дебаунс поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Хук автокомплита
  const {
    suggestions,
    isOpen: isAutocompleteOpen,
    isLoading: isAutocompleteLoading,
    error: autocompleteError,
    closeAutocomplete,
  } = useAutocomplete({
    searchQuery: debouncedSearch,
    enabled: isSearchFocused,
  });

  // Закрытие автокомплита при потере фокуса

  
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      closeAutocomplete();
      // setIsSearchFocused(false);
    }, 1500);
  }, []);
  

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    closeAutocomplete();
  }, [closeAutocomplete]);

  const handleAutocompleteItemPress = useCallback((item: { id: string; title: string }) => {
    setSearchQuery(item.title);
    closeAutocomplete();
    setIsSearchFocused(false);
  }, [closeAutocomplete]);

  const handleOverlayClose = useCallback(() => {
    setIsSearchFocused(false);
    closeAutocomplete();
  }, [closeAutocomplete]);

  // Остальная логика (useTasksWithQuery, категории и т.д.) остается без изменений
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useTasksWithQuery({
    status: 'open',
    sortBy: 'date',
    limit: 10,
  });

  const allTasks = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.tasks || []);
  }, [data]);

  const loadMoreTasks = useCallback(() => {
    console.log('Loading more, hasNextPage:', hasNextPage, 'isFetchingNextPage:', isFetchingNextPage);
    
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // const loadMoreTasks = useCallback(() => {
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return showAllCategories ? categories : categories.slice(0, 6);
  }, [categories, showAllCategories]);
  

  const searchedCategories = useMemo(() => {
      return filteredCategories
  }, [filteredCategories, categorySearch]);

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.8}
      onPress={() => onCategoryClick(item.id)}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon} size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  ), [isDark, onCategoryClick, styles]);

  const renderTaskItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem 
      task={item} 
      onTaskClick={onTaskClick}
      variant="grid"
      swipeEnabled={false}
    />
  ), [onTaskClick]);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text style={styles.footerText}>Загружаем еще задачи...</Text>
        </View>
      );
    }
    
    // Показываем сообщение, если больше нет страниц
    if (!hasNextPage && allTasks.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>Все задачи загружены</Text>
        </View>
      );
    }
    
    return null;
  }, [isFetchingNextPage, hasNextPage, allTasks.length, isDark, styles]);

  const ListHeaderComponent = useCallback(() => (
    <>
      {/* Категории */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Категории услуг</Text>
          <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
            <Text style={styles.showAllText}>
              {showAllCategories ? "Свернуть" : "Все категории"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
            data={searchedCategories} // ← изменил здесь
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
            showsVerticalScrollIndicator={false}
          />
      </View>

      {/* Заголовок задач */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {debouncedSearch ? "Результаты поиска" : "Рекомендуемые задания"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {allTasks.length} заданий
          </Text>
        </View>
      </View>
    </>
  ), [filteredCategories, showAllCategories, debouncedSearch, allTasks.length, styles, renderCategory]);

  // const handleSearchChange = useCallback((text: string) => {
  //   setSearchQuery(text);
  // }, []);

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
        <Text style={styles.loadingText}>Загружаем задачи...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={isDark ? "#ef4444" : "#dc2626"} />
        <Text style={styles.errorText}>Ошибка загрузки</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "#9ca3af" : "gray"}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Поиск задачи или категории..."
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleSearchFocus}
          editable={!isSearchFocused}
          pointerEvents={isSearchFocused ? "none" : "auto"}
          // onBlur={handleSearchBlur}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearSearch}
          >
            <Ionicons name="close-circle" size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Оверлей с автокомплитом */}
      <SearchOverlay 
         visible={isSearchFocused}
         onClose={handleOverlayClose}
      >
        <View style={styles.searchContainer}>
          {/* Поисковый инпут в оверлее */}
          <View style={styles.overlaySearchWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color={isDark ? "#9ca3af" : "gray"}
              style={[ styles.searchIcon, {top: 14}]}
            />
            <TextInput
              placeholder="Поиск задачи..."
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={searchQuery}
              onChangeText={handleSearchChange}
              style={styles.overlaySearchInput}
              autoFocus={true}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={handleClearSearch}
              >
                <Ionicons name="close-circle" size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            )}
          </View>

          {/* Список автокомплита */}
          <AutocompleteList
            suggestions={suggestions}
            isLoading={isAutocompleteLoading}
            onItemPress={handleAutocompleteItemPress}
            searchQuery={searchQuery}
          />
        </View>
      </SearchOverlay>

      {/* Остальной контент */}
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
      onEndReachedThreshold={0.1} // Уменьшите threshold для более раннего срабатывания
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Задачи не найдены</Text>
          </View>
        ) : null
      }
    />

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={onCreateTask}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Создать задачу</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
  searchWrapper: {
    position: "relative",
    marginBottom: 20,
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: isDark ? "#374151" : "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 40,
    fontSize: 15,
    flex: 1,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
    padding: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  sectionSubtitle: {
    color: isDark ? "#9ca3af" : "#6b7280",
    fontSize: 14,
  },
  showAllText: {
    color: isDark ? "#60a5fa" : "#2563eb",
    fontWeight: "500",
    fontSize: 14,
  },
  categoriesGrid: {
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: isDark ? "#1f2937" : "#fff",
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? "#374151" : "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: isDark ? "#f9fafb" : "#374151",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: isDark ? "#9ca3af" : "#9ca3af",
    fontWeight: "500",
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? "#111827" : "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    color: isDark ? "#d1d5db" : "#6b7280",
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
    marginTop: 12,
  },
  errorSubtext: {
    color: isDark ? "#9ca3af" : "#6b7280",
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: isDark ? "#2563eb" : "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
  },
  overlaySearchWrapper: {
    position: "relative",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  overlaySearchInput: {
    backgroundColor: isDark ? "#374151" : "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? "#60a5fa" : "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 40,
    fontSize: 16,
    flex: 1,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
  },
  // footerLoader: {
  //   padding: 16,
  //   alignItems: 'center',
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   gap: 8,
  // },
  // footerText: {
  //   fontSize: 14,
  //   color: isDark ? '#9ca3af' : '#6b7280',
  // },
});