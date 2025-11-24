import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { useCategories } from '@/api/categories/getCategories';

interface TaskFormData {
  title: string;
  category_id: string;
  description: string;
  budget_type: "fixed" | "hourly" | "range" | "negotiable";
  budget_min?: number;
  budget_max?: number;
  hourly_rate?: number;
  deadline: string;
  location: string;
}

interface CreateTaskResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

export default function CreateTaskScreen() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState<"fixed" | "hourly" | "range" | "negotiable">("fixed");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Новые состояния для модального окна категорий
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { accessToken } = useAuth();

  // Фильтрация категорий по поисковому запросу
  const filteredCategories = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Получение названия выбранной категории
  const selectedCategoryName = categories?.find(cat => cat.id === category)?.name || "Выберите категорию";

  const goBack = () => {
    router.back()
  }

  // Очистка полей бюджета при смене типа
  useEffect(() => {
    if (budgetType === "negotiable") {
      setBudgetMin("");
      setBudgetMax("");
      setHourlyRate("");
    } else if (budgetType === "hourly") {
      setBudgetMin("");
      setBudgetMax("");
    } else if (budgetType === "fixed") {
      setBudgetMax("");
      setHourlyRate("");
    } else if (budgetType === "range") {
      setHourlyRate("");
    }
  }, [budgetType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Валидация названия
    if (!title.trim()) {
      newErrors.title = "Введите название задачи";
    } else if (title.trim().length < 5) {
      newErrors.title = "Название должно содержать минимум 5 символов";
    } else if (title.trim().length > 200) {
      newErrors.title = "Название не должно превышать 200 символов";
    }

    // Валидация категории
    if (!category) {
      newErrors.category = "Выберите категорию";
    }

    // Валидация описания
    if (!description.trim()) {
      newErrors.description = "Добавьте описание";
    } else if (description.trim().length < 50) {
      newErrors.description = "Описание должно содержать минимум 50 символов";
    }

    // Валидация бюджета в зависимости от типа
    if (budgetType === "fixed") {
      if (!budgetMin) {
        newErrors.budgetMin = "Укажите бюджет";
      } else if (parseInt(budgetMin) <= 0) {
        newErrors.budgetMin = "Бюджет должен быть больше 0";
      }
    } else if (budgetType === "hourly") {
      if (!hourlyRate) {
        newErrors.hourlyRate = "Укажите почасовую ставку";
      } else if (parseInt(hourlyRate) <= 0) {
        newErrors.hourlyRate = "Ставка должна быть больше 0";
      }
    } else if (budgetType === "range") {
      if (!budgetMin) {
        newErrors.budgetMin = "Укажите минимальный бюджет";
      } else if (parseInt(budgetMin) <= 0) {
        newErrors.budgetMin = "Минимальный бюджет должен быть больше 0";
      }
      
      if (!budgetMax) {
        newErrors.budgetMax = "Укажите максимальный бюджет";
      } else if (parseInt(budgetMax) <= parseInt(budgetMin || "0")) {
        newErrors.budgetMax = "Максимальный бюджет должен быть больше минимального";
      }
    }

    // Валидация срока
    if (!deadline) {
      newErrors.deadline = "Выберите срок выполнения";
    } else if (deadline < new Date()) {
      newErrors.deadline = "Срок выполнения должен быть в будущем";
    }

    // Валидация локации
    if (!location.trim()) {
      newErrors.location = "Укажите локацию";
    } else if (location.trim().length < 5) {
      newErrors.location = "Локация должна содержать минимум 5 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    if (!accessToken) {
      setErrors({ submit: "Требуется авторизация. Пожалуйста, войдите в систему." });
      setIsLoading(false);
      return;
    }
    
    try {
      // Формируем данные в зависимости от типа бюджета
      const taskData: TaskFormData = {
        title: title.trim(),
        category_id: category,
        description: description.trim(),
        budget_type: budgetType,
        deadline: deadline.toISOString(),
        location: location.trim(),
      };

      // Добавляем специфичные поля бюджета
      if (budgetType === "fixed") {
        taskData.budget_min = parseInt(budgetMin);
        taskData.budget_max = parseInt(budgetMin);
      } else if (budgetType === "hourly") {
        taskData.hourly_rate = parseInt(hourlyRate);
      } else if (budgetType === "range") {
        taskData.budget_min = parseInt(budgetMin);
        taskData.budget_max = parseInt(budgetMax);
      }

      console.log("Отправляемые данные:", JSON.stringify(taskData, null, 2));

      // Отправка запроса на создание задачи
      const response = await api.request(`/tasks`, {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      const data: CreateTaskResponse = await response.json();
      console.log(data)
      if (response.status === 201 && data.success) {
        Alert.alert("Успех", "Задача успешно создана!");
        goBack()
      } else {
        // Обработка ошибок валидации
        if (data.message && data.message.includes("валидации") && data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ submit: data.message || "Произошла ошибка при создании задачи" });
        }
      }
    } catch (error) {
      console.error("Ошибка при создании задачи:", error);
      setErrors({ submit: "Ошибка сети. Проверьте подключение к интернету." });
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setCategory(categoryId);
    setShowCategoryModal(false);
    setSearchQuery("");
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        category === item.id && styles.categoryItemSelected
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[
        styles.categoryItemText,
        category === item.id && styles.categoryItemTextSelected
      ]}>
        {item.name}
      </Text>
      {category === item.id && (
        <Ionicons name="checkmark" size={20} color="#2563eb" />
      )}
    </TouchableOpacity>
  );

  if (categoriesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text style={styles.loadingText}>Загрузка категорий...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Название задачи <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Например: Сборка мебели IKEA"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          {/* Category - Новая версия с модальным окном */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Категория <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.categorySelector, errors.category && styles.inputError]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[
                styles.categorySelectorText,
                !category && styles.categorySelectorPlaceholder
              ]}>
                {selectedCategoryName}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={isDark ? "#9ca3af" : "#6b7280"} 
              />
            </TouchableOpacity>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Описание задачи <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Подробно опишите, что нужно сделать, какие требования к исполнителю, есть ли особые условия..."
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Минимум 50 символов. Чем подробнее описание, тем больше откликов.
            </Text>
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Budget Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Тип бюджета <Text style={styles.required}>*</Text>
            </Text>
            
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setBudgetType('fixed')}
              >
                <View style={styles.radioCircle}>
                  {budgetType === 'fixed' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Фиксированная сумма</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setBudgetType('hourly')}
              >
                <View style={styles.radioCircle}>
                  {budgetType === 'hourly' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Почасовая оплата</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setBudgetType('range')}
              >
                <View style={styles.radioCircle}>
                  {budgetType === 'range' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Диапазон цен</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setBudgetType('negotiable')}
              >
                <View style={styles.radioCircle}>
                  {budgetType === 'negotiable' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>По договорённости</Text>
              </TouchableOpacity>
            </View>

            {/* Budget Inputs */}
            {budgetType === "fixed" && (
              <View style={styles.budgetInputContainer}>
                <View style={styles.currencySymbol}>
                  <Text style={styles.currencyText}>₽</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.budgetInput, errors.budgetMin && styles.inputError]}
                  placeholder="5000"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="numeric"
                />
                {errors.budgetMin && (
                  <Text style={styles.errorText}>{errors.budgetMin}</Text>
                )}
              </View>
            )}

            {budgetType === "hourly" && (
              <View style={styles.budgetInputContainer}>
                <View style={styles.currencySymbol}>
                  <Text style={styles.currencyText}>₽</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.budgetInput, errors.hourlyRate && styles.inputError]}
                  placeholder="1000"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="numeric"
                />
                <Text style={styles.helperText}>за час работы</Text>
                {errors.hourlyRate && (
                  <Text style={styles.errorText}>{errors.hourlyRate}</Text>
                )}
              </View>
            )}

            {budgetType === "range" && (
              <View style={styles.rangeInputsContainer}>
                <View style={styles.rangeInputWrapper}>
                  <View style={styles.currencySymbol}>
                    <Text style={styles.currencyText}>₽</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.rangeInput, errors.budgetMin && styles.inputError]}
                    placeholder="1000"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="numeric"
                  />
                  <Text style={styles.rangeLabel}>от</Text>
                </View>
                <View style={styles.rangeInputWrapper}>
                  <View style={styles.currencySymbol}>
                    <Text style={styles.currencyText}>₽</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.rangeInput, errors.budgetMax && styles.inputError]}
                    placeholder="5000"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="numeric"
                  />
                  <Text style={styles.rangeLabel}>до</Text>
                </View>
              </View>
            )}
          </View>

          {/* Deadline */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Срок выполнения <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.dateButton, errors.deadline && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              <Text style={styles.dateButtonText}>
                {deadline ? formatDate(deadline) : "Выберите дату"}
              </Text>
            </TouchableOpacity>
            {errors.deadline && (
              <Text style={styles.errorText}>{errors.deadline}</Text>
            )}
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Локация <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.locationInputContainer}>
              <Ionicons name="location" size={20} color={isDark ? "#9ca3af" : "#6b7280"} style={styles.locationIcon} />
              <TextInput
                style={[styles.input, styles.locationInput, errors.location && styles.inputError]}
                placeholder="Москва, улица Ленина 10"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <Text style={styles.helperText}>
              Укажите точный адрес или район
            </Text>
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* Submit Error */}
          {errors.submit && (
            <View style={styles.submitErrorContainer}>
              <Text style={styles.submitErrorText}>{errors.submit}</Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>💡 Советы для успешной публикации:</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Используйте понятное и конкретное название</Text>
              <Text style={styles.infoItem}>• Подробно опишите задачу и требования</Text>
              <Text style={styles.infoItem}>• Укажите реальный бюджет для привлечения исполнителей</Text>
              <Text style={styles.infoItem}>• Будьте на связи для ответов на вопросы</Text>
            </View>
          </View>

          {/* Submit Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={goBack}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  {/* <Ionicons name="send" size={20} color="white" /> */}
                  <Text style={styles.submitButtonText}>Опубликовать</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Модальное окно выбора категории */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Заголовок модального окна */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите категорию</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCategoryModal(false);
                setSearchQuery("");
              }}
            >
              <Ionicons name="close" size={24} color={isDark ? "#f9fafb" : "#374151"} />
            </TouchableOpacity>
          </View>

          {/* Поиск категорий */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={isDark ? "#9ca3af" : "#6b7280"} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск категорий..."
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Список категорий */}
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            style={styles.categoriesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? "Категории не найдены" : "Нет доступных категорий"}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={deadline}
            mode="date"
            display="inline"
            onChange={onDateChange}
            minimumDate={new Date()}
            style={styles.datePicker}
          />
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.datePickerButtonText}>Готово</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? "#111827" : "#f9fafb",
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: isDark ? "#1f2937" : "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#374151",
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: isDark ? "#374151" : "white",
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: isDark ? "#9ca3af" : "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  
  // Стили для выбора категории
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: isDark ? "#374151" : "white",
  },
  categorySelectorText: {
    fontSize: 16,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  categorySelectorPlaceholder: {
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  
  // Стили для модального окна категорий
  modalContainer: {
    flex: 1,
    backgroundColor: isDark ? "#1f2937" : "white",
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
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    position: 'relative',
    margin: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: isDark ? "#374151" : "white",
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#374151" : "#f3f4f6",
  },
  categoryItemSelected: {
    backgroundColor: isDark ? "#1e40af" : "#eff6ff",
  },
  categoryItemText: {
    fontSize: 16,
    color: isDark ? "#f9fafb" : "#374151",
  },
  categoryItemTextSelected: {
    color: isDark ? "#60a5fa" : "#2563eb",
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: isDark ? "#9ca3af" : "#6b7280",
    fontSize: 16,
  },
  
  // Стили для DatePicker
  datePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDark ? "#1f2937" : "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  datePicker: {
    height: 200,
  },
  datePickerButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Остальные стили остаются без изменений
  textArea: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: isDark ? "#374151" : "white",
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  radioGroup: {
    gap: 12,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: isDark ? "#60a5fa" : "#2563eb",
    marginRight: 8,
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
    color: isDark ? "#f9fafb" : "#374151",
  },
  budgetInputContainer: {
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  currencyText: {
    fontSize: 16,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  budgetInput: {
    paddingLeft: 32,
  },
  rangeInputsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  rangeInput: {
    paddingLeft: 32,
  },
  rangeLabel: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
    fontSize: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: isDark ? "#374151" : "white",
  },
  dateButtonText: {
    fontSize: 16,
    color: isDark ? "#f9fafb" : "#374151",
    marginLeft: 8,
  },
  locationInputContainer: {
    position: 'relative',
  },
  locationIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  locationInput: {
    paddingLeft: 40,
  },
  submitErrorContainer: {
    backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
    borderWidth: 1,
    borderColor: isDark ? "#991b1b" : "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  submitErrorText: {
    color: isDark ? "#fca5a5" : "#dc2626",
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: isDark ? "#1e3a8a" : "#eff6ff",
    borderWidth: 1,
    borderColor: isDark ? "#3730a3" : "#dbeafe",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? "#dbeafe" : "#1e40af",
    marginBottom: 8,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 13,
    color: isDark ? "#e5e7eb" : "#374151",
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: isDark ? "#374151" : "#f3f4f6",
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
  },
  cancelButtonText: {
    color: isDark ? "#f9fafb" : "#374151",
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: "#2563eb",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});