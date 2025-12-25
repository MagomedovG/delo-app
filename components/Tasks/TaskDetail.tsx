import { api } from '@/utils/api';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useColorScheme,
} from 'react-native';

interface OfferResponse {
  success: boolean;
  data: {
    id: string;
    price: number;
    description: string;
    estimatedTime: string;
    createdAt: string;
  };
  message?: string;
}

interface TaskDetailData {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: "fixed" | "hourly" | "range";
  priceMax?: number;
  deadline: string;
  location: string;
  locationCoords?: { lat: number; lng: number };
  status: "open" | "in_progress" | "completed";
  categoryName: string;
  categoryId: string;
  posterId:string;
  posterName: string;
  posterRating: number;
  posterAvatar: string;
  offersCount: number;
  budgetMax: string;
  budgetMin: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

interface TaskDetailProps {
  task?: TaskDetailData;
  taskId?: string;
  currentUserId: string;
  onBack: () => void;
}

export function TaskDetail({ task, taskId, currentUserId, onBack }: TaskDetailProps) {
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDescription, setOfferDescription] = useState("Описание должно содержать минимум 20 символов");
  const [offerTime, setOfferTime] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [localTask, setLocalTask] = useState(task);
  const [startingChat, setStartingChat] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const isAuthor = localTask?.posterId === currentUserId;

  const getStatusBadge = (status: TaskDetailData["status"]) => {
    switch (status) {
      case "open":
        return <View style={[styles.badge, styles.openBadge]}><Text allowFontScaling={false} style={styles.openBadgeText}>Открыта</Text></View>;
      case "in_progress":
        return <View style={[styles.badge, styles.inProgressBadge]}><Text allowFontScaling={false} style={styles.inProgressBadgeText}>В работе</Text></View>;
      case "completed":
        return <View style={[styles.badge, styles.completedBadge]}><Text allowFontScaling={false} style={styles.completedBadgeText}>Выполнена</Text></View>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const validateOffer = () => {
    const errors: string[] = [];

    if (!offerPrice || parseInt(offerPrice) <= 0) {
      errors.push("Цена должна быть больше 0");
    }

    if (!offerDescription || offerDescription.length < 20) {
      errors.push("Описание должно содержать минимум 20 символов");
    }

    if (!offerTime) {
      errors.push("Укажите время выполнения");
    }

    return errors;
  };
  const handleStartChat = async () => {
    if (!task) return;
    
    setStartingChat(true);
    try {
      // Сначала проверяем, есть ли уже переписка
      const response = await api.request(`/chat/tasks/${task?.id}/conversations`, {
        method: "POST",
        body: JSON.stringify({
          taskerId: currentUserId
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.id) {
          router.push(`/(user)/chat/${data.data.id}`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Не удалось начать переписку");
      }
    } catch (err) {
      console.error("Ошибка при создании чата:", err);
      alert("Ошибка при создании чата");
    } finally {
      setStartingChat(false);
    }
  };
  const handleSubmitOffer = async () => {
    const validationErrors = validateOffer();
    if (validationErrors.length > 0) {
      setOfferError(validationErrors.join(", "));
      return;
    }

    setSubmitting(true);
    setOfferError(null);

    try {
      const response = await api.request(`/tasks/${task?.id}/offers`, {
        method: "POST",
        body: JSON.stringify({
          price: parseInt(offerPrice),
          description: offerDescription.trim(),
          estimated_time: offerTime.trim()
        })
      });

      if (response.status === 201) {
        const result: OfferResponse = await response.json();
        
        if (result.success) {
          setOfferSuccess(true);
          setIsOfferDialogOpen(false);
          setOfferPrice("");
          setOfferDescription("");
          setOfferTime("");
          
          Alert.alert("Успех", "Ваш отклик успешно отправлен!");
          
          if (localTask) {
            setLocalTask({
              ...localTask,
              offersCount: localTask.offersCount + 1
            });
          }
        } else {
          setOfferError(result.error || "Ошибка при отправке отклика");
        }
      } else {
        const errorData = await response.json();
        console.log(errorData)

        setOfferError(errorData.error || `Ошибка сервера: ${response.status}`);
      }
    } catch (err) {
      console.error("Ошибка при отправке отклика:", err);
      setOfferError("Ошибка сети. Проверьте подключение к интернету.");
    } finally {
      setSubmitting(false);
    }
  };

  const openMapLink = async () => {
    if (task?.locationCoords) {
      const url = `https://www.google.com/maps?q=${task.locationCoords.lat},${task.locationCoords.lng}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Ошибка", "Не удалось открыть карты");
      }
    }
  };

  const nextImage = () => {
    if (task?.images && task.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === task.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (task?.images && task.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? task.images!.length - 1 : prev - 1
      );
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text allowFontScaling={false} style={[styles.title, { textAlign: 'center' }]}>Задача не найдена</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {task.images && task.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Image 
              source={{ uri: task.images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {task.images.length > 1 && (
              <>
                <TouchableOpacity style={[styles.imageNavButton, styles.prevButton]} onPress={prevImage}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.imageNavButton, styles.nextButton]} onPress={nextImage}>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.imageIndicator}>
                  <Text allowFontScaling={false} style={styles.imageIndicatorText}>
                    {selectedImageIndex + 1} / {task.images.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Task Header */}
        <View style={styles.card}>
          <View style={styles.taskHeader}>
            <Text allowFontScaling={false} style={styles.title}>{task.title}</Text>
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, styles.categoryBadge]}>
                <Text allowFontScaling={false} style={styles.categoryBadgeText}>{task.categoryName || 'Другое'}</Text>
              </View>
              {getStatusBadge(task.status)}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Price and Deadline */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="money" size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
              </View>
              <View style={styles.detailContent}>
                <Text allowFontScaling={false} style={styles.detailLabel}>Бюджет</Text>
                <Text allowFontScaling={false} style={styles.price}>
                  {task.budgetMin && task.budgetMax && task.budgetMax === task.budgetMin
                    ? `${task.budgetMin} руб.` :
                    task.budgetMin && task.budgetMax 
                    ? `${task.budgetMin} - ${task.budgetMax} руб.`
                    : task.budgetMin 
                    ? `${task.budgetMin} руб.`
                    : task.budgetMax
                    ? `₽${task.budgetMax} руб.`
                    : 'По договоренности'}
                </Text>
                <Text allowFontScaling={false} style={styles.priceType}>
                  {task.priceType === "fixed" && "фиксированная цена"}
                  {task.priceType === "hourly" && "за час работы"}
                  {task.priceType === "range" && "диапазон цен"}
                  {task.priceType === "negotiable" && "по договоренности"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar" size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
              </View>
              <View style={styles.detailContent}>
                <Text allowFontScaling={false} style={styles.detailLabel}>Срок выполнения</Text>
                <Text allowFontScaling={false} style={styles.deadline}>{formatDate(task.deadline)}</Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="location" size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
            </View>
            <View style={styles.detailContent}>
              <Text allowFontScaling={false} style={styles.detailLabel}>Локация</Text>
              <View style={styles.locationRow}>
                <Text allowFontScaling={false} style={styles.location}>{task.location}</Text>
                {task.locationCoords && (
                  <TouchableOpacity style={styles.mapButton} onPress={openMapLink}>
                    <Ionicons name="open-outline" size={16} color={isDark ? "#93c5fd" : "#2563eb"} />
                    <Text allowFontScaling={false} style={styles.mapButtonText}>Карта</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>Описание задачи</Text>
          <Text allowFontScaling={false} style={styles.description}>{task.description}</Text>
          <View style={styles.postedDate}>
            <Ionicons name="time-outline" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
            <Text allowFontScaling={false} style={styles.postedDateText}>Опубликовано {formatDate(task.createdAt)}</Text>
          </View>
        </View>

        {/* Author Info */}
        <View style={styles.card}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>Заказчик</Text>
          <View style={styles.authorInfo}>
            {task.posterAvatar ? (
              <Image 
                source={{ uri: task.posterAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text allowFontScaling={false} style={styles.authorName}>{task.posterName || 'Неизвестный'}</Text>
              <View style={styles.authorStats}>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text allowFontScaling={false} style={styles.ratingText}>{task.posterRating || 0}</Text>
                </View>
                <Text allowFontScaling={false} style={styles.statSeparator}>•</Text>
                <Text allowFontScaling={false} style={styles.reviews}>{task.offersCount || 0} откликов</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Compact Action Button */}
      {!isAuthor && task.status === "open" ? (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setIsOfferDialogOpen(true)}
          >
            {/* <Ionicons name="send" size={18} color="white" /> */}
            <Text allowFontScaling={false} style={styles.submitButtonText}>Откликнуться</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleStartChat}
            disabled={startingChat}
          >
            {/* <Ionicons name="send" size={18} color="white" /> */}
            <Text allowFontScaling={false} style={styles.submitButtonText}>Написать</Text>
          </TouchableOpacity>
        </View> 
      ) : 
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, {width:'96%'}]}
            onPress={() => router.push({
              pathname: '/(user)/create-task',
              params: { taskId: task.id },
            })}
          >
            {/* <Ionicons name="send" size={18} color="white" /> */}
            <Text allowFontScaling={false} style={styles.submitButtonText}>Редактировать</Text>
          </TouchableOpacity>
        </View>
    }

      {/* Offer Dialog */}
      {isOfferDialogOpen && (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      style={styles.modalOverlay}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback>
        <View style={styles.modal}>
          <Text allowFontScaling={false} style={styles.modalTitle}>Отклик на задачу</Text>
          <Text allowFontScaling={false} style={styles.modalDescription}>
            Предложите свою цену и расскажите, как вы выполните эту задачу
          </Text>
          
          {offerError && (
            <View style={styles.errorContainer}>
              <Text allowFontScaling={false} style={styles.errorText}>{offerError}</Text>
            </View>
          )}
          
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.inputLabel}>Ваша цена (₽)</Text>
              <TextInput
                style={styles.input}
                placeholder="3000"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={offerPrice}
                onChangeText={setOfferPrice}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.inputLabel}>Время выполнения</Text>
              <TextInput
                style={styles.input}
                placeholder="например: 3-4 часа"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={offerTime}
                onChangeText={setOfferTime}
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.inputLabel}>Комментарий</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Расскажите о своём опыте и подходе к выполнению задачи..."
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={offerDescription}
                onChangeText={setOfferDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                blurOnSubmit={true}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsOfferDialogOpen(false)}
            >
              <Text allowFontScaling={false} style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitModalButton]}
              onPress={handleSubmitOffer}
              disabled={submitting}
            >
              <Text allowFontScaling={false} style={styles.submitModalButtonText}>
                {submitting ? "Отправка..." : "Отправить отклик"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
)}
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? "#111827" : "#f9fafb",
  },
  scrollView: {
    flex: 1,
    paddingTop:15,
  },
  imagesContainer: {
    position: 'relative',
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  imageIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#2563eb',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? "#1e40af" : "#eff6ff",
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: isDark ? "#1f2937" : "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: isDark ? "#60a5fa" : "#2563eb",
  },
  categoryBadgeText: {
    color: isDark ? "#60a5fa" : "#2563eb",
    fontSize: 12,
    fontWeight: '500',
  },
  openBadge: {
    backgroundColor: isDark ? "#065f46" : "#dcfce7",
  },
  openBadgeText: {
    color: isDark ? "#34d399" : "#166534",
    fontSize: 12,
    fontWeight: '500',
  },
  inProgressBadge: {
    backgroundColor: isDark ? "#1e40af" : "#dbeafe",
  },
  inProgressBadgeText: {
    color: isDark ? "#93c5fd" : "#1e40af",
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: isDark ? "#374151" : "#f3f4f6",
  },
  completedBadgeText: {
    color: isDark ? "#d1d5db" : "#374151",
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: isDark ? "#374151" : "#e5e7eb",
    marginVertical: 16,
  },
  detailsGrid: {
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? "#1e40af" : "#eff6ff",
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    color: isDark ? "#60a5fa" : "#2563eb",
    fontWeight: '700',
  },
  priceType: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#9ca3af",
  },
  deadline: {
    fontSize: 16,
    color: isDark ? "#f9fafb" : "#1f2937",
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 16,
    color: isDark ? "#f9fafb" : "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapButtonText: {
    color: isDark ? "#93c5fd" : "#2563eb",
    fontSize: 14,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  description: {
    fontSize: 16,
    color: isDark ? "#d1d5db" : "#4b5563",
    lineHeight: 24,
    marginBottom: 12,
  },
  postedDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postedDateText: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  authorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  statSeparator: {
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  reviews: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  footer: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 12,
    backgroundColor: isDark ? "#1f2937" : "white",
    borderTopWidth: 1,
    borderTopColor: isDark ? "#374151" : "#e5e7eb",
  },
  submitButton: {
    width:'48%',
    backgroundColor: "#2563eb",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: isDark ? "#1f2937" : "white",
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  modalDescription: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
    marginBottom: 20,
  },
  modalContent: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
    marginBottom:15
  },
  inputLabel: {
    fontSize: 14,
    color: isDark ? "#f9fafb" : "#374151",
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: isDark ? "#374151" : "white",
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: isDark ? "#374151" : "#f3f4f6",
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
  },
  cancelButtonText: {
    color: isDark ? "#f9fafb" : "#374151",
    fontSize: 16,
    fontWeight: '500',
  },
  submitModalButton: {
    backgroundColor: "#2563eb",
  },
  submitModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
    borderWidth: 1,
    borderColor: isDark ? "#991b1b" : "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: isDark ? "#fca5a5" : "#dc2626",
    fontSize: 14,
    textAlign: 'center',
  },
});