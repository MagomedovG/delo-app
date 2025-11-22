import { mockTasks } from '@/data/mocktasks';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
interface TaskOffer {
  id: string;
  taskerId: string;
  taskerName: string;
  taskerAvatar?: string;
  taskerRating: number;
  taskerReviewsCount: number;
  taskerCompletedTasks: number;
  price: number;
  description: string;
  estimatedTime: string;
  createdAt: string;
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
  category: string;
  categoryName: string;
  postedDate: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRating: number;
  authorReviewsCount: number;
  offers: TaskOffer[];
  images?: string[]; // Добавил поле для изображений задачи
}

// Моковые данные с изображениями
const mockTaskDetail: any = {
//   id: "1",
//   title: "Сборка мебели IKEA",
//   description: "Нужно собрать шкаф-купе (3 метра) и две тумбочки. Все инструменты есть, но если у вас есть свои - будет быстрее. Мебель находится на 3 этаже без лифта. Желательно выполнить работу в выходные. Инструкции от IKEA прилагаются.",
//   price: 3000,
  priceType: "range",
  priceMax: 5000,
  deadline: "2025-10-25",
//   location: "Москва, Чертаново, ул. Чертановская 14",
  locationCoords: { lat: 55.6333, lng: 37.6000 },
  status: "open",
//   category: "repair",
  categoryName: "Ремонт и строительство",
  postedDate: "2025-10-19",
  authorId: "user1",
  authorName: "Анна Смирнова",
  authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  authorRating: 4.8,
  authorReviewsCount: 15,
//   images: [
//     "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
//     "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop",
//     "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&h=300&fit=crop"
//   ],
  offers: [
    // {
    //   id: "offer1",
    //   taskerId: "tasker1",
    //   taskerName: "Дмитрий Иванов",
    //   taskerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    //   taskerRating: 4.9,
    //   taskerReviewsCount: 47,
    //   taskerCompletedTasks: 52,
    //   price: 3500,
    //   description: "Здравствуйте! Соберу вашу мебель качественно и аккуратно. Есть опыт сборки мебели IKEA более 3 лет. Свои инструменты.",
    //   estimatedTime: "3-4 часа",
    //   createdAt: "2025-10-19T10:30:00"
    // },
    // {
    //   id: "offer2",
    //   taskerId: "tasker2",
    //   taskerName: "Сергей Петров",
    //   taskerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    //   taskerRating: 4.7,
    //   taskerReviewsCount: 23,
    //   taskerCompletedTasks: 28,
    //   price: 4000,
    //   description: "Добрый день! Могу приехать в субботу утром. Имею большой опыт сборки мебели.",
    //   estimatedTime: "4 часа",
    //   createdAt: "2025-10-19T14:20:00"
    // }
  ]
};

interface TaskDetailProps {
  taskId: string;
  currentUserId: string;
  onBack: () => void;
}

export function TaskDetail({ taskId, currentUserId, onBack }: TaskDetailProps) {
  const [taski] = useState<TaskDetailData>(mockTaskDetail);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerTime, setOfferTime] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const taskItem = mockTasks.find((t)=> t.id === taskId)
  const task = {...taskItem, ...mockTaskDetail}
  const isAuthor = task.authorId === currentUserId;

  const getStatusBadge = (status: TaskDetailData["status"]) => {
    switch (status) {
      case "open":
        return <View style={[styles.badge, styles.openBadge]}><Text style={styles.openBadgeText}>Открыта</Text></View>;
      case "in_progress":
        return <View style={[styles.badge, styles.inProgressBadge]}><Text style={styles.inProgressBadgeText}>В работе</Text></View>;
      case "completed":
        return <View style={[styles.badge, styles.completedBadge]}><Text style={styles.completedBadgeText}>Выполнена</Text></View>;
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

  const formatOfferDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Только что";
    if (diffHours < 24) return `${diffHours} ч. назад`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн. назад`;
  };

  const handleSubmitOffer = () => {
    console.log("Submitting offer:", { price: offerPrice, description: offerDescription, time: offerTime });
    setIsOfferDialogOpen(false);
    Alert.alert("Успех", "Ваш отклик отправлен!");
  };

  const openMapLink = async () => {
    if (task.locationCoords) {
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
    if (task.images) {
      setSelectedImageIndex((prev) => 
        prev === task.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (task.images) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? task.images!.length - 1 : prev - 1
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Task Images */}
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
                  <Text style={styles.imageIndicatorText}>
                    {selectedImageIndex + 1} / {task.images.length}
                  </Text>
                </View>
              </>
            )}
            
            {/* Thumbnails */}
            {task.images.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailsContainer}
              >
                {task.images.map((image, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image 
                      source={{ uri: image }}
                      style={[
                        styles.thumbnail,
                        index === selectedImageIndex && styles.thumbnailActive
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Task Header */}
        <View style={styles.card}>
          <View style={styles.taskHeader}>
            <Text style={styles.title}>{task.title}</Text>
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, styles.categoryBadge]}>
                <Text style={styles.categoryBadgeText}>{task.categoryName}</Text>
              </View>
              {getStatusBadge(task.status)}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Price and Deadline */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="money" size={20} color="#2563eb" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Бюджет</Text>
                <Text style={styles.price}>
                  {task.priceType === "range"
                    ? `₽${task.price.toLocaleString()} - ₽${task.priceMax?.toLocaleString()}`
                    : `₽${task.price.toLocaleString()}`}
                </Text>
                <Text style={styles.priceType}>
                  {task.priceType === "fixed" && "фиксированная цена"}
                  {task.priceType === "hourly" && "за час работы"}
                  {task.priceType === "range" && "диапазон"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar" size={20} color="#2563eb" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Срок выполнения</Text>
                <Text style={styles.deadline}>{formatDate(task.deadline)}</Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="location" size={20} color="#2563eb" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Локация</Text>
              <View style={styles.locationRow}>
                <Text style={styles.location}>{task.location}</Text>
                {task.locationCoords && (
                  <TouchableOpacity style={styles.mapButton} onPress={openMapLink}>
                    <Ionicons name="open-outline" size={16} color="#2563eb" />
                    <Text style={styles.mapButtonText}>Карта</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Описание задачи</Text>
          <Text style={styles.description}>{task.description}</Text>
          <View style={styles.postedDate}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.postedDateText}>Опубликовано {formatDate(task.postedDate)}</Text>
          </View>
        </View>

        {/* Author Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Заказчик</Text>
          <View style={styles.authorInfo}>
            {task.authorAvatar ? (
              <Image 
                source={{ uri: task.authorAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#2563eb" />
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{task.authorName}</Text>
              <View style={styles.authorStats}>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.ratingText}>{task.authorRating}</Text>
                </View>
                <Text style={styles.statSeparator}>•</Text>
                <Text style={styles.reviews}>{task.authorReviewsCount} отзывов</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Offers Section */}
        {/* {isAuthor && task.offers.length > 0 && (
          <View style={styles.card}>
            <View style={styles.offersHeader}>
              <Text style={styles.sectionTitle}>Отклики ({task.offers.length})</Text>
            </View>
            <View style={styles.offersList}>
              {task.offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerAuthor}>
                      {offer.taskerAvatar ? (
                        <Image 
                          source={{ uri: offer.taskerAvatar }}
                          style={styles.avatarImageSmall}
                        />
                      ) : (
                        <View style={styles.avatarSmall}>
                          <Ionicons name="person" size={16} color="#2563eb" />
                        </View>
                      )}
                      <View style={styles.offerAuthorInfo}>
                        <Text style={styles.offerAuthorName}>{offer.taskerName}</Text>
                        <View style={styles.offerStats}>
                          <View style={styles.rating}>
                            <Ionicons name="star" size={14} color="#f59e0b" />
                            <Text style={styles.ratingText}>{offer.taskerRating}</Text>
                          </View>
                          <Text style={styles.statSeparator}>•</Text>
                          <Text style={styles.offerStat}>{offer.taskerReviewsCount} отзывов</Text>
                          <Text style={styles.statSeparator}>•</Text>
                          <Text style={styles.offerStat}>{offer.taskerCompletedTasks} задач</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.offerPrice}>
                      <Text style={styles.offerPriceText}>₽{offer.price.toLocaleString()}</Text>
                      <Text style={styles.offerTime}>{offer.estimatedTime}</Text>
                    </View>
                  </View>
                  <Text style={styles.offerDescription}>{offer.description}</Text>
                  <View style={styles.offerFooter}>
                    <Text style={styles.offerDate}>{formatOfferDate(offer.createdAt)}</Text>
                    <View style={styles.offerActions}>
                      <TouchableOpacity style={[styles.button, styles.outlineButton]}>
                        <Ionicons name="chatbubble-outline" size={16} color="#2563eb" />
                        <Text style={styles.outlineButtonText}>Написать</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                        <Text style={styles.primaryButtonText}>Принять</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )} */}
      </ScrollView>

      {/* Action Button for non-authors */}
      {!isAuthor && task.status === "open" && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setIsOfferDialogOpen(true)}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text style={styles.submitButtonText}>Откликнуться на задачу</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Offer Dialog */}
      {isOfferDialogOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Отклик на задачу</Text>
            <Text style={styles.modalDescription}>
              Предложите свою цену и расскажите, как вы выполните эту задачу
            </Text>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ваша цена (₽)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3000"
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Время выполнения</Text>
                <TextInput
                  style={styles.input}
                  placeholder="например: 3-4 часа"
                  value={offerTime}
                  onChangeText={setOfferTime}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Комментарий</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Расскажите о своём опыте и подходе к выполнению задачи..."
                  value={offerDescription}
                  onChangeText={setOfferDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsOfferDialogOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitModalButton]}
                onPress={handleSubmitOffer}
              >
                <Text style={styles.submitModalButtonText}>Отправить отклик</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  // Стили для изображений
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
  // Стили для аватаров
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
    color: '#1f2937',
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
    borderColor: '#2563eb',
  },
  categoryBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  openBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
  },
  inProgressBadge: {
    backgroundColor: '#dbeafe',
  },
  inProgressBadgeText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#f3f4f6',
  },
  completedBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
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
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: '700',
  },
  priceType: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deadline: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 16,
    color: '#1f2937',
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
    color: '#2563eb',
    fontSize: 14,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
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
    color: '#6b7280',
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
    color: '#1f2937',
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
    color: '#6b7280',
  },
  statSeparator: {
    color: '#6b7280',
  },
  reviews: {
    fontSize: 14,
    color: '#6b7280',
  },
  offersHeader: {
    marginBottom: 16,
  },
  offersList: {
    gap: 12,
  },
  offerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  offerAuthor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  offerAuthorInfo: {
    flex: 1,
  },
  offerAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  offerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  offerStat: {
    fontSize: 12,
    color: '#6b7280',
  },
  offerPrice: {
    alignItems: 'flex-end',
  },
  offerPriceText: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '700',
  },
  offerTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  offerDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  outlineButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  modalContent: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
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
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  submitModalButton: {
    backgroundColor: '#2563eb',
  },
  submitModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});