// components/TaskList.tsx
import Slider from "@react-native-community/slider";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { TaskItem } from "./TaskItem";
import { mockTasks } from "@/data/mocktasks";
type PriceType = "fixed" | "hourly";
type Status = "open" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: PriceType;
  deadline: string;
  location: string;
  offersCount: number;
  status: Status;
  postedDate: string;
  category: string;
  image:string;
}



interface Props {
  categoryId?: string;
  categoryName?: string;
  onBack: () => void;
  onTaskClick: (taskId: string) => void;
}

export function TaskList({ categoryId, categoryName, onBack, onTaskClick }: Props) {
  const [sortBy, setSortBy] = useState<string>("date");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tasksPerPage = 10;
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      setTimeout(()=>setRefreshing(false),1000)
  }, []);

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      if (categoryId && task.category !== categoryId) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (task.price < priceRange[0] || task.price > priceRange[1]) return false;
      return true;
    });
  }, [categoryId, statusFilter, priceRange]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "date") return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "offers") return b.offersCount - a.offersCount;
      return 0;
    });
  }, [filteredTasks, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / tasksPerPage));
  const startIndex = (currentPage - 1) * tasksPerPage;
  const displayedTasks = sortedTasks.slice(startIndex, startIndex + tasksPerPage);

  const getStatusLabel = (s: Status) =>
    s === "open" ? "Открыта" : s === "in_progress" ? "В работе" : "Выполнена";

  const getStatusColor = (s: Status) =>
    s === "open" ? "#22C55E" : s === "in_progress" ? "#3B82F6" : "#9CA3AF";

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

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="black" />
        </TouchableOpacity>

        <View style={{ marginLeft: 8 }}>
          <Text style={styles.title}>{categoryName || "Все задания"}</Text>
          <Text style={styles.subtitle}>{filteredTasks.length} заданий</Text>
        </View>

        <TouchableOpacity style={styles.filterBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="tune" size={18} color="#1D4ED8" />
          <Text style={styles.filterText}>Фильтры</Text>
        </TouchableOpacity>
      </View> */}

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
              <Pressable style={styles.clearBtn} onPress={() => { setPriceRange([0,10000]); setStatusFilter("all"); setSortBy("date"); }}>
                <Text style={styles.clearText}>Сбросить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task list */}
      <FlatList
        data={displayedTasks}
        keyExtractor={(item, index) => item.id}
        contentContainerStyle={styles.list}
        // sty={{gap:26}}
        numColumns={1}
        refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />}
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
            <Text style={styles.emptyText}>Задания не найдены</Text>
          </View>
        )}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity onPress={() => setCurrentPage((p) => Math.max(1, p - 1))} style={styles.pageBtn}>
            <Text>Назад</Text>
          </TouchableOpacity>

          <View style={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <TouchableOpacity key={pageNum} onPress={() => setCurrentPage(pageNum)} style={[styles.pageNumber, currentPage === pageNum && styles.pageActive]}>
                  <Text style={currentPage === pageNum ? { color: "#fff" } : undefined}>{pageNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={styles.pageBtn}>
            <Text>Вперед</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" } as any,
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" } as any,
  backBtn: { padding: 6 } as any,
  title: { fontSize: 18, fontWeight: "600" } as any,
  subtitle: { color: "#6B7280" } as any,
  filterBtn: { marginLeft: "auto", backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center" } as any,
  filterText: { marginLeft: 6, color: "#1D4ED8" } as any,
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" } as any,
  modal: { backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 } as any,
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 } as any,
  modalLabel: { color: "#4B5563", marginBottom: 8 } as any,
  applyBtn: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 12, flex: 1, alignItems: "center", marginRight: 8 } as any,
  applyText: { color: "white", fontWeight: "600" } as any,
  clearBtn: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingVertical: 12, flex: 1, alignItems: "center" } as any,
  clearText: { color: "#374151" } as any,
  list: { padding: 16, paddingBottom: 100 } as any,
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 17, borderLeftWidth: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } as any,
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" } as any,
  cardTitle: { fontSize: 16, fontWeight: "600" } as any,
  status: { fontWeight: "500", marginVertical: 4 } as any,
  price: { color: "#2563EB", fontSize: 18, fontWeight: "700" } as any,
  priceType: { color: "#6B7280", fontSize: 12 } as any,
  description: { color: "#4B5563", marginVertical: 8 } as any,
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" } as any,
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 12 } as any,
  metaText: { color: "#6B7280", marginLeft: 4 } as any,
  empty: { alignItems: "center", marginTop: 40 } as any,
  emptyText: { color: "#9CA3AF" } as any,
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 12, gap: 12 } as any,
  pageBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" } as any,
  pageNumbers: { flexDirection: "row", marginHorizontal: 8 } as any,
  pageNumber: { paddingHorizontal: 8, paddingVertical: 6, marginHorizontal: 4 } as any,
  pageActive: { backgroundColor: "#2563EB", borderRadius: 6 } as any,
});
