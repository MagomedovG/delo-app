import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch, TextInput } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

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

// Функция для сравнения объектов фильтров
const areFiltersEqual = (filters1: Filters, filters2: Filters): boolean => {
  return (
    JSON.stringify(filters1.status) === JSON.stringify(filters2.status) &&
    JSON.stringify(filters1.budgetType) === JSON.stringify(filters2.budgetType) &&
    filters1.priceMin === filters2.priceMin &&
    filters1.priceMax === filters2.priceMax &&
    JSON.stringify(filters1.category) === JSON.stringify(filters2.category) &&
    filters1.location === filters2.location &&
    filters1.sortBy === filters2.sortBy &&
    filters1.withResponses === filters2.withResponses &&
    filters1.urgent === filters2.urgent
  );
};

export default function TaskListSearchHeader({totalTasks}:{totalTasks:number}) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const router = useRouter();
    
    // Получаем все параметры из URL
    const searchParams = useLocalSearchParams();
    const searchQuery = searchParams.search || '';
    
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

    // useRef для хранения предыдущих параметров
    const previousParamsRef = useRef<string>('');

    // Функция для парсинга параметров URL в объект фильтров
    const parseUrlParams = (params: any): Filters => {
      const defaultFilters: Filters = {
        status: ['open'],
        budgetType: [],
        priceMin: undefined,
        priceMax: undefined,
        category: [],
        location: '',
        sortBy: 'newest',
        withResponses: false,
        urgent: false
      };

      try {
        // Статус
        if (params.status) {
          defaultFilters.status = Array.isArray(params.status) 
            ? params.status 
            : params.status.split(',');
        }

        // Тип бюджета
        if (params.budget_type) {
          defaultFilters.budgetType = Array.isArray(params.budget_type)
            ? params.budget_type
            : params.budget_type.split(',');
        }

        // Цена
        if (params.price_min) {
          defaultFilters.priceMin = parseInt(params.price_min as string);
        }
        if (params.price_max) {
          defaultFilters.priceMax = parseInt(params.price_max as string);
        }

        // Категории
        if (params.category) {
          defaultFilters.category = Array.isArray(params.category)
            ? params.category
            : params.category.split(',');
        }

        // Локация
        if (params.location) {
          defaultFilters.location = params.location as string;
        }

        // Сортировка
        if (params.sort) {
          defaultFilters.sortBy = params.sort as string;
        }

        // Дополнительные фильтры
        if (params.with_responses === 'true') {
          defaultFilters.withResponses = true;
        }
        if (params.urgent === 'true') {
          defaultFilters.urgent = true;
        }

        return defaultFilters;
      } catch (error) {
        console.error('Error parsing URL params:', error);
        return defaultFilters;
      }
    };

    // Парсим параметры URL и устанавливаем в фильтры только при реальном изменении
    useEffect(() => {
      const currentParamsString = JSON.stringify(searchParams);
      
      // Проверяем, действительно ли параметры изменились
      if (currentParamsString !== previousParamsRef.current) {
        const parsedFilters = parseUrlParams(searchParams);
        
        // Проверяем, отличаются ли новые фильтры от текущих
        if (!areFiltersEqual(parsedFilters, filters)) {
          setFilters(parsedFilters);
        }
        
        previousParamsRef.current = currentParamsString;
      }
    }, [searchParams, filters]);

    const buildQueryParams = (filters: Filters): Record<string, string> => {
      const params: Record<string, string> = {};

      // Добавляем поисковый запрос из URL, если он есть
      // if (searchQuery) {
      //   params.search = searchQuery as string;
      // }

      // Статус
      if (filters.status.length > 0 && !(filters.status.length === 1 && filters.status[0] === 'open')) {
        params.status = filters.status.join(',');
      }

      // Тип бюджета
      if (filters.budgetType.length > 0) {
        params.budget_type = filters.budgetType.join(',');
      }

      // Цена
      if (filters.priceMin) {
        params.price_min = filters.priceMin.toString();
      }
      if (filters.priceMax) {
        params.price_max = filters.priceMax.toString();
      }

      // Категории
      if (filters.category.length > 0) {
        params.category = filters.category.join(',');
      }

      // Локация
      if (filters.location) {
        params.location = filters.location;
      }

      // Сортировка
      if (filters.sortBy && filters.sortBy !== 'newest') {
        params.sort = filters.sortBy;
      }

      // Дополнительные фильтры
      if (filters.withResponses) {
        params.with_responses = 'true';
      }
      if (filters.urgent) {
        params.urgent = 'true';
      }

      return params;
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
      const resetFiltersState: Filters = {
        status: ['open'],
        budgetType: [],
        priceMin: undefined,
        priceMax: undefined,
        category: [],
        location: '',
        sortBy: 'newest',
        withResponses: false,
        urgent: false
      };
      
      setFilters(resetFiltersState);
      
      // Сбрасываем фильтры, оставляя только поисковый запрос
      const params: Record<string, string> = {};
      // if (searchQuery) {
      //   params.search = searchQuery as string;
      // }
      
      router.setParams(params);
      setShowFilters(false);
    };

    const applyFilters = () => {
      const params = buildQueryParams(filters);
      console.log('Отправили параметры с фильтра', params)
      
      // Обновляем URL с фильтрами через setParams
      router.setParams(params);
      
      setShowFilters(false);
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

    
    const handleBack = () => {
      router.back();
    };

    // Функция для получения отображаемого текста статуса
    const getStatusDisplayText = (status: string) => {
      switch (status) {
        case 'open': return 'Открытые';
        case 'in_progress': return 'В работе';
        case 'completed': return 'Завершенные';
        default: return status;
      }
    };

    // Функция для получения отображаемого текста типа бюджета
    const getBudgetTypeDisplayText = (type: string) => {
      switch (type) {
        case 'fixed': return 'Фиксированная цена';
        case 'hourly': return 'Почасовая оплата';
        case 'range': return 'Диапазон цен';
        case 'negotiable': return 'По договоренности';
        default: return type;
      }
    };
  
    return (
      <>
        <View style={[styles.taskListHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={isDark ? "#f9fafb" : "black"} />
          </TouchableOpacity>
    
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.title}>
              {searchQuery ? `Поиск: "${searchQuery}"` : 'Найденные задания'}
            </Text>
            <Text style={styles.subtitle}>Найдено заданий: {totalTasks}</Text>
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
          onRequestClose={() => setShowFilters(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? "#1f2937" : "white" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? "#f9fafb" : "#1f2937" }]}>
                Фильтры {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color={isDark ? "#f9fafb" : "#374151"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
                      {getStatusDisplayText(status)}
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
                      {getBudgetTypeDisplayText(type)}
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
                  Применить
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </>
    );
}


// Стили остаются такими же как в предыдущем примере
const getStyles = (isDark: boolean) => StyleSheet.create({
  // ... все стили из предыдущего примера
  taskListHeader: { 
    flexDirection: "row" as const, 
    alignItems: "center" as const, 
    padding: 16, 
    borderBottomWidth: 1, 
    borderColor: isDark ? "#374151" : "#E5E7EB", 
    backgroundColor: isDark ? "#1f2937" : "#fff" 
  },
  backBtn: { padding: 6 },
  title: { 
    fontSize: 18, 
    fontWeight: "600" as const,
    color: isDark ? "#f9fafb" : "#1f2937"
  },
  subtitle: { 
    color: isDark ? "#9ca3af" : "#6B7280", 
    fontSize: 12 
  },
  filterBtn: { 
    marginLeft: "auto", 
    backgroundColor: isDark ? "#1e40af" : "#EFF6FF", 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    flexDirection: "row" as const, 
    alignItems: "center" as const,
    position: 'relative' 
  },
  filterText: { 
    marginLeft: 6, 
    color: isDark ? "#93c5fd" : "#1D4ED8", 
    fontSize: 12 
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
});