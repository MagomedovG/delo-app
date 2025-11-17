// components/MyProfile.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  StyleSheet 
} from "react-native";
import { 
  ArrowLeft, 
  Star, 
  User, 
  Edit, 
  Briefcase, 
  ClipboardList, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign 
} from "lucide-react-native";

interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  location: string;
  deadline: string;
  status: "active" | "in_progress" | "completed" | "cancelled";
  offersCount: number;
  createdAt: string;
}

interface Offer {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  myPrice: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  taskTitle: string;
  createdAt: string;
}

interface UserData {
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: "poster" | "tasker" | "both";
  location: string;
  memberSince: string;
  rating: number;
  reviewsCount: number;
  completedTasks: number;
}

// Моковые данные
const mockUserData: UserData = {
  userId: "user1",
  name: "Гамзат Магомедов",
  avatar: undefined,
  bio: "Профессиональный мастер по трате денег. Работаю более 5 лет.",
  role: "tasker",
  location: "Махачкала",
  memberSince: "2023-03-15",
  rating: 4.8,
  reviewsCount: 47,
  completedTasks: 52
};

const mockMyTasks: Task[] = [
  {
    id: "1",
    title: "Сборка мебели IKEA",
    category: "Ремонт и строительство",
    description: "Необходимо собрать шкаф и комод из IKEA",
    budget: 3500,
    location: "Москва, Чертаново",
    deadline: "2025-10-25",
    status: "active",
    offersCount: 8,
    createdAt: "2025-10-19T10:00:00"
  },
  {
    id: "2",
    title: "Уборка квартиры",
    category: "Уборка",
    description: "Генеральная уборка двухкомнатной квартиры",
    budget: 2500,
    location: "Москва, Тверская",
    deadline: "2025-10-22",
    status: "in_progress",
    offersCount: 5,
    createdAt: "2025-10-17T14:00:00"
  }
];

const mockMyOffers: Offer[] = [
  {
    id: "o1",
    taskId: "t1",
    taskTitle: "Доставка документов",
    taskCategory: "Доставка",
    myPrice: 500,
    status: "pending",
    createdAt: "2025-10-19T16:00:00"
  }
];

const mockMyReviews: Review[] = [
  {
    id: "r1",
    authorId: "a1",
    authorName: "Анна Смирнова",
    rating: 5,
    comment: "Отличный мастер! Собрал шкаф быстро и аккуратно.",
    taskTitle: "Сборка мебели IKEA",
    createdAt: "2025-10-15T14:30:00"
  }
];

interface MyProfileProps {
  onBack: () => void;
  onEditProfile: () => void;
  onTaskClick: (taskId: string) => void;
}

type TabType = "tasks" | "offers" | "reviews";

export function MyProfile({ onBack, onEditProfile, onTaskClick }: MyProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [userData] = useState<UserData>(mockUserData);
  const [myTasks] = useState<Task[]>(mockMyTasks);
  const [myOffers] = useState<Offer[]>(mockMyOffers);
  const [myReviews] = useState<Review[]>(mockMyReviews);

  const getStatusBadge = (status: Task["status"]) => {
    const config = {
      active: { color: "#2563eb", bg: "#dbeafe", icon: Clock },
      in_progress: { color: "#d97706", bg: "#fef3c7", icon: Briefcase },
      completed: { color: "#059669", bg: "#d1fae5", icon: CheckCircle },
      cancelled: { color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
    }[status];

    const IconComponent = config.icon;
    
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <IconComponent size={14} color={config.color} />
        <Text style={[styles.badgeText, { color: config.color }]}>
          {status === "active" ? "Активна" : 
           status === "in_progress" ? "В работе" :
           status === "completed" ? "Завершена" : "Отменена"}
        </Text>
      </View>
    );
  };

  const getOfferStatusBadge = (status: Offer["status"]) => {
    const config = {
      pending: { color: "#d97706", bg: "#fef3c7", icon: Clock },
      accepted: { color: "#059669", bg: "#d1fae5", icon: CheckCircle },
      rejected: { color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
    }[status];

    const IconComponent = config.icon;
    
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <IconComponent size={14} color={config.color} />
        <Text style={[styles.badgeText, { color: config.color }]}>
          {status === "pending" ? "Ожидает" : 
           status === "accepted" ? "Принят" : "Отклонен"}
        </Text>
      </View>
    );
  };

  const getRoleLabel = (role: UserData["role"]) => {
    return role === "poster" ? "Заказчик" : 
           role === "tasker" ? "Исполнитель" : "Заказчик и Исполнитель";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getMemberDuration = () => {
    const memberDate = new Date(userData.memberSince);
    const now = new Date();
    const months = Math.floor(
      (now.getTime() - memberDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      return `${years} ${years === 1 ? "год" : years < 5 ? "года" : "лет"} на платформе`;
    }
    return `${months} ${months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев"} на платформе`;
  };

  const renderAvatar = () => (
    <View style={styles.avatar}>
      {userData.avatar ? (
        <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
      ) : (
        <User size={32} color="#2563eb" />
      )}
    </View>
  );

  const renderReviewAvatar = (review: Review) => (
    <View style={styles.reviewAvatar}>
      {review.authorAvatar ? (
        <Image source={{ uri: review.authorAvatar }} style={styles.avatarImage} />
      ) : (
        <User size={20} color="#2563eb" />
      )}
    </View>
  );

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          color={i < rating ? "#fbbf24" : "#d1d5db"}
          fill={i < rating ? "#fbbf24" : "transparent"}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мой профиль</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
            <View style={styles.profileMain}>
                {/* Аватар и основная информация в одной строке */}
                <View style={styles.profileTop}>
                {renderAvatar()}
                
                <View style={styles.nameSection}>
                    <Text style={styles.profileName}>{userData.name}</Text>
                    <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{getRoleLabel(userData.role)}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={onEditProfile}
                >
                    <Edit size={18} color="#2563eb" />
                </TouchableOpacity>
                </View>

                {/* Био */}
                {userData.bio && (
                <Text style={styles.bio}>{userData.bio}</Text>
                )}

                {/* Основные метрики */}
                <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                    <View style={styles.metricValueContainer}>
                    <Star size={20} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.metricValue}>{userData.rating}</Text>
                    </View>
                    <Text style={styles.metricLabel}>{userData.reviewsCount} отзывов</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                    <View style={styles.metricValueContainer}>
                    <CheckCircle size={20} color="#2563eb" />
                    <Text style={styles.metricValue}>{userData.completedTasks}</Text>
                    </View>
                    <Text style={styles.metricLabel}>выполнено задач</Text>
                </View>
                </View>

                {/* Дополнительная информация */}
                <View style={styles.additionalInfo}>
                <View style={styles.infoItem}>
                    <MapPin size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{userData.location}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{getMemberDuration()}</Text>
                </View>
                </View>
            </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <ClipboardList size={24} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>{myTasks.length}</Text>
            <Text style={styles.statLabel}>Мои задачи</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Briefcase size={24} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>{myOffers.length}</Text>
            <Text style={styles.statLabel}>Мои отклики</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MessageSquare size={24} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>{myReviews.length}</Text>
            <Text style={styles.statLabel}>Отзывы обо мне</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsCard}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "tasks" && styles.activeTab]}
              onPress={() => setActiveTab("tasks")}
            >
              <Text style={[styles.tabText, activeTab === "tasks" && styles.activeTabText]}>
                Мои задачи ({myTasks.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === "offers" && styles.activeTab]}
              onPress={() => setActiveTab("offers")}
            >
              <Text style={[styles.tabText, activeTab === "offers" && styles.activeTabText]}>
                Мои отклики ({myOffers.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text style={[styles.tabText, activeTab === "reviews" && styles.activeTabText]}>
                Отзывы ({myReviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <View style={styles.tabContent}>
              {myTasks.map((task) => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskCard}
                  onPress={() => onTaskClick(task.id)}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{task.category}</Text>
                      </View>
                    </View>
                    {getStatusBadge(task.status)}
                  </View>

                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>

                  <View style={styles.taskFooter}>
                    <View style={styles.taskMeta}>
                      <View style={styles.metaItem}>
                        <DollarSign size={16} color="#6b7280" />
                        <Text style={styles.metaText}>₽{task.budget.toLocaleString()}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MapPin size={16} color="#6b7280" />
                        <Text style={styles.metaText}>{task.location}</Text>
                      </View>
                    </View>
                    <View style={styles.offersBadge}>
                      <Text style={styles.offersText}>{task.offersCount} откликов</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {myTasks.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>У вас пока нет задач</Text>
                </View>
              )}
            </View>
          )}

          {/* Offers Tab */}
          {activeTab === "offers" && (
            <View style={styles.tabContent}>
              {myOffers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerTitleContainer}>
                      <Text style={styles.offerTitle}>{offer.taskTitle}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{offer.taskCategory}</Text>
                      </View>
                    </View>
                    {getOfferStatusBadge(offer.status)}
                  </View>

                  <View style={styles.offerFooter}>
                    <View style={styles.priceContainer}>
                      <DollarSign size={20} color="#2563eb" />
                      <Text style={styles.priceText}>₽{offer.myPrice.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.offerDate}>
                      {formatDate(offer.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}

              {myOffers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>У вас пока нет откликов</Text>
                </View>
              )}
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <View style={styles.tabContent}>
              {myReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAuthor}>
                      {renderReviewAvatar(review)}
                      <View>
                        <Text style={styles.authorName}>{review.authorName}</Text>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>

                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  
                  <View style={styles.reviewTaskBadge}>
                    <Text style={styles.reviewTaskText}>{review.taskTitle}</Text>
                  </View>
                </View>
              ))}

              {myReviews.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>У вас пока нет отзывов</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileMain: {
    gap: 16,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  nameSection: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  bio: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
    textAlign: "left",
  },
  metricsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: -4,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
  },
  // Обновленный стиль для аватара
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  statsRow: {
    gap: 12,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  reviewsCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  completedTasks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  completedTasksText: {
    fontSize: 14,
    color: "#6b7280",
  },
  metaInfo: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  tabsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#2563eb",
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
    color: "#6b7280",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  taskDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskMeta: {
    flexDirection: "row",
    gap: 16,
  },
  offersBadge: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offersText: {
    fontSize: 12,
    color: "#6b7280",
  },
  offerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  offerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  offerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
  },
  offerDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  reviewCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewAuthor: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  reviewComment: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewTaskBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reviewTaskText: {
    fontSize: 10,
    color: "#6b7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
  },
});