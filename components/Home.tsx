import { mockTasks } from "@/data/mocktasks";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TaskItem } from "./TaskItem"; // Импортируем наш универсальный компонент
import { Task } from "./TaskList"; // Импортируем тип Task

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
}

const categories: Category[] = [
  { id: "repair", name: "Ремонт и строительство", icon: "construct-outline", count: 234 },
  { id: "delivery", name: "Доставка", icon: "cube-outline", count: 156 },
  { id: "courier", name: "Курьерские поручения", icon: "bicycle-outline", count: 89 },
  { id: "cleaning", name: "Уборка", icon: "sparkles-outline", count: 178 },
  { id: "education", name: "Репетиторы и обучение", icon: "school-outline", count: 145 },
  { id: "it", name: "IT и цифровые услуги", icon: "laptop-outline", count: 267 },
  { id: "beauty", name: "Красота и здоровье", icon: "heart-outline", count: 92 },
  { id: "media", name: "Фото / Видео / Дизайн", icon: "camera-outline", count: 103 },
  { id: "auto", name: "Автоуслуги", icon: "car-outline", count: 67 },
  { id: "legal", name: "Юридические и финансовые", icon: "scale-outline", count: 54 },
  { id: "other", name: "Прочее", icon: "ellipsis-horizontal", count: 198 },
];

// Моковые задачи для демонстрации


interface HomeProps {
  onCategoryClick: (id: string) => void;
  onCreateTask: () => void;
  onTaskClick: (taskId: string) => void;
  onViewOffers?: () => void;
  onViewProfile?: () => void;
}

export function Home({ onCategoryClick, onCreateTask, onTaskClick, onViewOffers, onViewProfile }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Показываем только первые 6 категорий, если не открыты все
    return showAllCategories ? filtered : filtered.slice(0, 6);
  }, [searchQuery, showAllCategories]);

  const displayedTasks = useMemo(() => {
    return mockTasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.8}
      onPress={() => onCategoryClick(item.id)}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon} size={24} color="#2563eb" />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem 
      task={item} 
      onTaskClick={onTaskClick}
      variant="grid"           // ✅ Режим сетки
      swipeEnabled={false}     // ✅ Свайп отключен для сетки
    />
  );

  return (
    <View style={styles.container}>
      {/* Поиск */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Поиск задачи или категории..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
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
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Рекомендуемые задания */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Рекомендуемые задания</Text>
            <Text style={styles.sectionSubtitle}>
              {displayedTasks.length} заданий
            </Text>
          </View>

          <FlatList
            data={displayedTasks}
            renderItem={renderTaskItem}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.tasksGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Отступ для FAB */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
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
    left: 10,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 36,
    fontSize: 15,
    flex: 1,
  },
  viewModeButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
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
    color: "#1f2937",
  },
  sectionSubtitle: {
    color: "#6b7280",
    fontSize: 14,
  },
  showAllText: {
    color: "#2563eb",
    fontWeight: "500",
    fontSize: 14,
  },
  // Стили для компактных категорий
  categoriesGrid: {
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
  // ✅ Исправленные стили для сетки задач
  tasksGrid: {
    // Оставляем пустым или с минимальными отступами
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  // Стили для списка задач (List)
  tasksList: {
    gap: 12,
  },
  bottomSpacer: {
    height: 100,
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
});