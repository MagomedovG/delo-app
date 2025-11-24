import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch, TextInput } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

interface Filters {
  status: string[];
  budgetType: string[];
  priceMin?: number;
  priceMax?: number;
  category: string[];
  location: string;
  sortBy: string;
  withResponses: boolean;
  urgent: boolean;
}

export default function TaskListSearchHeader() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const router = useRouter();
    
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
      status: ['open'],
      budgetType: [],
      priceMin: undefined,
      priceMax: undefined,
      category: [],
      location: '',
      sortBy: 'newest',
      withResponses: false,
      urgent: false
    });

    const buildQueryString = (filters: Filters): string => {
      const params = new URLSearchParams();

      // Статус
      if (filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }

      // Тип бюджета
      if (filters.budgetType.length > 0) {
        params.append('budget_type', filters.budgetType.join(','));
      }

      // Цена
      if (filters.priceMin) {
        params.append('price_min', filters.priceMin.toString());
      }
      if (filters.priceMax) {
        params.append('price_max', filters.priceMax.toString());
      }

      // Категории
      if (filters.category.length > 0) {
        params.append('category', filters.category.join(','));
      }

      // Локация
      if (filters.location) {
        params.append('location', filters.location);
      }

      // Сортировка
      if (filters.sortBy && filters.sortBy !== 'newest') {
        params.append('sort', filters.sortBy);
      }

      // Дополнительные фильтры
      if (filters.withResponses) {
        params.append('with_responses', 'true');
      }
      if (filters.urgent) {
        params.append('urgent', 'true');
      }

      return params.toString();
    };

    const handleFilterChange = (key: keyof Filters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleStatusToggle = (status: string) => {
      const currentStatus = [...filters.status];
      const index = currentStatus.indexOf(status);
      
      if (index > -1) {
        currentStatus.splice(index, 1);
      } else {
        currentStatus.push(status);
      }
      
      handleFilterChange('status', currentStatus);
    };

    const handleBudgetTypeToggle = (type: string) => {
      const currentTypes = [...filters.budgetType];
      const index = currentTypes.indexOf(type);
      
      if (index > -1) {
        currentTypes.splice(index, 1);
      } else {
        currentTypes.push(type);
      }
      
      handleFilterChange('budgetType', currentTypes);
    };

    const handleCategoryToggle = (categoryId: string) => {
      const currentCategories = [...filters.category];
      const index = currentCategories.indexOf(categoryId);
      
      if (index > -1) {
        currentCategories.splice(index, 1);
      } else {
        currentCategories.push(categoryId);
      }
      
      handleFilterChange('category', currentCategories);
    };

    const resetFilters = () => {
      setFilters({
        status: ['open'],
        budgetType: [],
        priceMin: undefined,
        priceMax: undefined,
        category: [],
        location: '',
        sortBy: 'newest',
        withResponses: false,
        urgent: false
      });
    };

    const applyFilters = () => {
      const queryString = buildQueryString(filters);
      console.log('Query string:', queryString);
      
      // Обновляем URL с фильтрами
      router.push(`/task-list?${queryString}`);
      
      setShowFilters(false);
      // Здесь можно добавить запрос к API с фильтрами
    };

    const getActiveFiltersCount = () => {
      let count = 0;
      
      if (filters.status.length > 0 && !(filters.status.length === 1 && filters.status[0] === 'open')) count++;
      if (filters.budgetType.length > 0) count++;
      if (filters.priceMin || filters.priceMax) count++;
      if (filters.category.length > 0) count++;
      if (filters.location) count++;
      if (filters.sortBy !== 'newest') count++;
      if (filters.withResponses) count++;
      if (filters.urgent) count++;
      
      return count;
    };
  
    return (
      <>
        <View style={[styles.taskListHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => console.log("Назад")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={isDark ? "#f9fafb" : "black"} />
          </TouchableOpacity>
    
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.title}>Все задания</Text>
            <Text style={styles.subtitle}>25 заданий</Text>
          </View>
    
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="tune" size={18} color={isDark ? "#60a5fa" : "#1D4ED8"} />
            <Text style={styles.filterText}>Фильтры</Text>
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Модальное окно фильтров */}
        <Modal
          visible={showFilters}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? "#1f2937" : "white" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                Фильтры
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color={isDark ? "#f9fafb" : "#374151"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Статус задания */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                  Статус задания
                </Text>
                {['open', 'in_progress', 'completed'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={styles.checkboxItem}
                    onPress={() => handleStatusToggle(status)}
                  >
                    <View style={[
                      styles.checkbox,
                      filters.status.includes(status) && styles.checkboxSelected
                    ]}>
                      {filters.status.includes(status) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: isDark ? "#f9fafb" : "#374151" }]}>
                      {status === 'open' && 'Открытые'}
                      {status === 'in_progress' && 'В работе'}
                      {status === 'completed' && 'Завершенные'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Тип бюджета */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                  Тип бюджета
                </Text>
                {['fixed', 'hourly', 'range', 'negotiable'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.checkboxItem}
                    onPress={() => handleBudgetTypeToggle(type)}
                  >
                    <View style={[
                      styles.checkbox,
                      filters.budgetType.includes(type) && styles.checkboxSelected
                    ]}>
                      {filters.budgetType.includes(type) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: isDark ? "#f9fafb" : "#374151" }]}>
                      {type === 'fixed' && 'Фиксированная цена'}
                      {type === 'hourly' && 'Почасовая оплата'}
                      {type === 'range' && 'Диапазон цен'}
                      {type === 'negotiable' && 'По договоренности'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Цена */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                  Бюджет
                </Text>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={[styles.priceLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>от</Text>
                    <TextInput
                      style={[styles.priceInput, { 
                        backgroundColor: isDark ? "#374151" : "white",
                        color: isDark ? "#f9fafb" : "#1f2937",
                        borderColor: isDark ? "#4b5563" : "#d1d5db"
                      }]}
                      placeholder="0"
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      value={filters.priceMin?.toString() || ''}
                      onChangeText={(text) => handleFilterChange('priceMin', text ? parseInt(text) : undefined)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceInputWrapper}>
                    <Text style={[styles.priceLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>до</Text>
                    <TextInput
                      style={[styles.priceInput, { 
                        backgroundColor: isDark ? "#374151" : "white",
                        color: isDark ? "#f9fafb" : "#1f2937",
                        borderColor: isDark ? "#4b5563" : "#d1d5db"
                      }]}
                      placeholder="100000"
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      value={filters.priceMax?.toString() || ''}
                      onChangeText={(text) => handleFilterChange('priceMax', text ? parseInt(text) : undefined)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Дополнительные фильтры */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                  Дополнительно
                </Text>
                
                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: isDark ? "#f9fafb" : "#374151" }]}>
                    Только с откликами
                  </Text>
                  <Switch
                    value={filters.withResponses}
                    onValueChange={(value) => handleFilterChange('withResponses', value)}
                    trackColor={{ false: isDark ? "#374151" : "#d1d5db", true: "#2563eb" }}
                    thumbColor={filters.withResponses ? "#ffffff" : "#f3f4f6"}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: isDark ? "#f9fafb" : "#374151" }]}>
                    Срочные задания
                  </Text>
                  <Switch
                    value={filters.urgent}
                    onValueChange={(value) => handleFilterChange('urgent', value)}
                    trackColor={{ false: isDark ? "#374151" : "#d1d5db", true: "#2563eb" }}
                    thumbColor={filters.urgent ? "#ffffff" : "#f3f4f6"}
                  />
                </View>
              </View>

              {/* Сортировка */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                  Сортировка
                </Text>
                {[
                  { value: 'newest', label: 'Сначала новые' },
                  { value: 'oldest', label: 'Сначала старые' },
                  { value: 'price_high', label: 'Цена по убыванию' },
                  { value: 'price_low', label: 'Цена по возрастанию' },
                  { value: 'deadline', label: 'По сроку выполнения' }
                ].map(sort => (
                  <TouchableOpacity
                    key={sort.value}
                    style={styles.radioItem}
                    onPress={() => handleFilterChange('sortBy', sort.value)}
                  >
                    <View style={styles.radioCircle}>
                      {filters.sortBy === sort.value && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={[styles.radioLabel, { color: isDark ? "#f9fafb" : "#374151" }]}>
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Сбросить</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>
                  Применить ({getActiveFiltersCount()})
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </>
    );
}

// Добавьте SafeAreaView в импорты
import { SafeAreaView } from "react-native-safe-area-context";

const getStyles = (isDark: boolean) => StyleSheet.create({
  // ... предыдущие стили остаются такими же ...

  // Новые стили для модального окна фильтров
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#374151" : "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: isDark ? "#6b7280" : "#9ca3af",
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  priceLabel: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 14,
    zIndex: 1,
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    fontSize: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: isDark ? "#60a5fa" : "#2563eb",
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: isDark ? "#60a5fa" : "#2563eb",
  },
  radioLabel: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: isDark ? "#374151" : "#e5e7eb",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: isDark ? "#374151" : "#f3f4f6",
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
  },
  resetButtonText: {
    color: isDark ? "#f9fafb" : "#374151",
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: "#2563eb",
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});