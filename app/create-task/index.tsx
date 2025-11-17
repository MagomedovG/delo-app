import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const categories = [
  { id: "repair", name: "Ремонт и строительство" },
  { id: "delivery", name: "Доставка" },
  { id: "courier", name: "Курьерские поручения" },
  { id: "cleaning", name: "Уборка" },
  { id: "education", name: "Репетиторы и обучение" },
  { id: "it", name: "IT и цифровые услуги" },
  { id: "beauty", name: "Красота и здоровье" },
  { id: "media", name: "Фото / Видео / Дизайн" },
  { id: "auto", name: "Автоуслуги" },
  { id: "legal", name: "Юридические и финансовые" },
  { id: "other", name: "Прочее" }
];

interface CreateTaskProps {
  onBack: () => void;
  onSubmit: (taskData: any) => void;
}

export function CreateTask({ onBack, onSubmit }: CreateTaskProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState<"fixed" | "negotiable">("fixed");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Введите название задачи";
    }
    if (!category) {
      newErrors.category = "Выберите категорию";
    }
    if (!description.trim()) {
      newErrors.description = "Добавьте описание";
    } else if (description.length < 50) {
      newErrors.description = "Описание должно быть не менее 50 символов";
    }
    if (budgetType === "fixed" && !budgetAmount) {
      newErrors.budget = "Укажите бюджет";
    }
    if (!deadline) {
      newErrors.deadline = "Выберите срок выполнения";
    }
    if (!location.trim()) {
      newErrors.location = "Укажите локацию";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const taskData = {
        title,
        category,
        description,
        budgetType,
        budgetAmount: budgetType === "fixed" ? parseInt(budgetAmount) : null,
        deadline,
        location
      };
      console.log("Task data:", taskData);
      onSubmit(taskData);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Создание задачи</Text>
          <Text style={styles.headerSubtitle}>Заполните все поля</Text>
        </View>
      </View>

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
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Категория <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.category && styles.inputError]}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
              >
                <Picker.Item label="Выберите категорию" value="" />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>
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

          {/* Budget */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Бюджет <Text style={styles.required}>*</Text>
            </Text>
            
            {/* Budget Type Radio Buttons */}
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
                onPress={() => setBudgetType('negotiable')}
              >
                <View style={styles.radioCircle}>
                  {budgetType === 'negotiable' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>По договорённости</Text>
              </TouchableOpacity>
            </View>

            {budgetType === "fixed" && (
              <View style={styles.budgetInputContainer}>
                <View style={styles.currencySymbol}>
                  <Text style={styles.currencyText}>₽</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.budgetInput, errors.budget && styles.inputError]}
                  placeholder="5000"
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  keyboardType="numeric"
                />
                {errors.budget && (
                  <Text style={styles.errorText}>{errors.budget}</Text>
                )}
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
              <Ionicons name="calendar" size={20} color="#6b7280" />
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
              <Ionicons name="location" size={20} color="#6b7280" style={styles.locationIcon} />
              <TextInput
                style={[styles.input, styles.locationInput, errors.location && styles.inputError]}
                placeholder="Москва, улица Ленина 10"
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
              onPress={onBack}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Опубликовать задачу</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
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
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: 'white',
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
    borderColor: '#2563eb',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
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
    color: '#6b7280',
  },
  budgetInput: {
    paddingLeft: 32,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
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
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 13,
    color: '#374151',
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
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});