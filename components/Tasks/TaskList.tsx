// components/TaskList.tsx
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { TaskItem } from "./TaskItem";
import { useColorScheme } from "react-native";
import Slider from "@react-native-community/slider";

type PriceType = "fixed" | "hourly" | "range";
type Status = "open" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  priceType: PriceType;
  deadline: string;
  location: string;
  offersCount: number;
  status: Status;
  postedDate: string;
  category: string;
  image: string;
  categoryName: string;
  budgetType:"hourly" | "fixed" | "range" | "negotiable";
  hourlyRate:number
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Props {
  tasks: Task[];
  pagination?: Pagination;
  filters: {
    status: string;
    page: number;
    limit: number;
  };
  onFilterChange: (filters: any) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onBack: () => void;
  onTaskClick: (taskId: string) => void;
}

export function TaskList({ 
  tasks, 
  pagination, 
  filters, 
  onFilterChange, 
  onRefresh, 
  isLoading, 
  onBack, 
  onTaskClick 
}: Props) {
  const [sortBy, setSortBy] = useState<string>("date");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const onRefreshHandler = React.useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const filteredTasks = useMemo(() => {
    return tasks?.filter((task) => {
      if (filters?.status !== "all" && task?.status !== filters?.status) return false;
      if (task?.budgetMin < priceRange[0] || task?.budgetMin > priceRange[1]) return false;
      return true;
    });
  }, [tasks, filters.status, priceRange]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks]?.sort((a, b) => {
      if (sortBy === "date") return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      if (sortBy === "price_asc") return a.budgetMin - b.budgetMin;
      if (sortBy === "price_desc") return b.budgetMin - a.budgetMin;
      if (sortBy === "offers") return b.offersCount - a.offersCount;
      return 0;
    });
  }, [filteredTasks, sortBy]);

  const handlePageChange = (page: number) => {
    onFilterChange({ page });
  };

  const handleStatusFilter = (status: string) => {
    onFilterChange({ status, page: 1 });
  };

  const getStatusLabel = (s: Status) =>
    s === "open" ? "Открыта" : s === "in_progress" ? "В работе" : "Выполнена";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Завтра";
    if (diffDays > 1 && diffDays <= 7) return `Через ${diffDays} дн.`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const renderFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text style={styles.footerText}>Загружаем задачи...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Status Filter */}
      <View style={styles.statusFilter}>
        {['all', 'open', 'in_progress', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              filters.status === status && styles.statusButtonActive
            ]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text style={[
              styles.statusButtonText,
              filters.status === status && styles.statusButtonTextActive
            ]}>
              {status === 'all' ? 'Все' : 
               status === 'open' ? 'Открытые' :
               status === 'in_progress' ? 'В работе' : 'Завершенные'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Фильтры</Text>
            <Text style={styles.modalLabel}>Цена: {priceRange[0]} ₽ - {priceRange[1]} ₽</Text>

            <Slider
              minimumValue={0}
              maximumValue={10000}
              step={100}
              value={priceRange[1]}
              onValueChange={(v) => setPriceRange([0, Math.round(v)])}
              minimumTrackTintColor="#2563EB"
              thumbTintColor="#2563EB"
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <Pressable style={styles.applyBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.applyText}>Применить</Text>
              </Pressable>
              <Pressable style={styles.clearBtn} onPress={() => { setPriceRange([0,10000]); setSortBy("date"); }}>
                <Text style={styles.clearText}>Сбросить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task list */}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshHandler}
            tintColor={isDark ? "#60a5fa" : "#2563eb"}
          />
        }
        renderItem={({ item }) => (
          <TaskItem 
            task={item} 
            onTaskClick={onTaskClick}
            variant="list"           
            swipeEnabled={true}      
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {filters.status === 'all' ? 'Задания не найдены' : 
               `Нет заданий со статусом "${getStatusLabel(filters.status as Status)}"`}
            </Text>
          </View>
        )}
        ListFooterComponent={renderFooter}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity 
            onPress={() => handlePageChange(Math.max(1, pagination.page - 1))} 
            style={styles.pageBtn}
            disabled={pagination.page === 1}
          >
            <Text style={pagination.page === 1 ? styles.pageBtnDisabled : {}}>Назад</Text>
          </TouchableOpacity>

          <View style={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) pageNum = i + 1;
              else if (pagination.page <= 3) pageNum = i + 1;
              else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
              else pageNum = pagination.page - 2 + i;

              if (pageNum < 1 || pageNum > pagination.totalPages) return null;

              return (
                <TouchableOpacity 
                  key={pageNum} 
                  onPress={() => handlePageChange(pageNum)} 
                  style={[
                    styles.pageNumber, 
                    pagination.page === pageNum && styles.pageActive
                  ]}
                >
                  <Text style={pagination.page === pageNum ? styles.pageActiveText : styles.pageText}>
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity 
            onPress={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))} 
            style={styles.pageBtn}
            disabled={pagination.page === pagination.totalPages}
          >
            <Text style={pagination.page === pagination.totalPages ? styles.pageBtnDisabled : {}}>Вперед</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: isDark ? "#111827" : "#F9FAFB" 
  },
  statusFilter: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    backgroundColor: isDark ? "#1f2937" : "#fff"
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isDark ? "#374151" : "#f3f4f6"
  },
  statusButtonActive: {
    backgroundColor: isDark ? "#2563eb" : "#2563eb"
  },
  statusButtonText: {
    fontSize: 14,
    color: isDark ? "#d1d5db" : "#4b5563"
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.3)", 
    justifyContent: "flex-end" 
  },
  modal: { 
    backgroundColor: isDark ? "#1f2937" : "white", 
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16, 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 8,
    color: isDark ? "#f9fafb" : "#1f2937"
  },
  modalLabel: { 
    color: isDark ? "#d1d5db" : "#4B5563", 
    marginBottom: 8 
  },
  applyBtn: { 
    backgroundColor: "#2563EB", 
    borderRadius: 10, 
    paddingVertical: 12, 
    flex: 1, 
    alignItems: "center", 
    marginRight: 8 
  },
  applyText: { 
    color: "white", 
    fontWeight: "600" 
  },
  clearBtn: { 
    borderWidth: 1, 
    borderColor: isDark ? "#4b5563" : "#E5E7EB", 
    borderRadius: 10, 
    paddingVertical: 12, 
    flex: 1, 
    alignItems: "center" 
  },
  clearText: { 
    color: isDark ? "#d1d5db" : "#374151" 
  },
  list: { 
    padding: 16, 
    paddingBottom: 100 
  },
  empty: { 
    alignItems: "center", 
    marginTop: 40 
  },
  emptyText: { 
    color: isDark ? "#9ca3af" : "#9CA3AF",
    textAlign: 'center'
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
  pagination: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 12, 
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? "#374151" : "#E5E7EB",
    backgroundColor: isDark ? "#1f2937" : "#fff"
  },
  pageBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: isDark ? "#4b5563" : "#E5E7EB" 
  },
  pageBtnDisabled: {
    color: isDark ? "#6b7280" : "#9ca3af",
    opacity: 0.5
  },
  pageNumbers: { 
    flexDirection: "row", 
    marginHorizontal: 8 
  },
  pageNumber: { 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    marginHorizontal: 4 
  },
  pageActive: { 
    backgroundColor: "#2563EB", 
    borderRadius: 6 
  },
  pageText: {
    color: isDark ? "#f9fafb" : "#374151"
  },
  pageActiveText: {
    color: "#fff"
  }
});