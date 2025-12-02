// components/MyProfile.tsx
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import {
    Briefcase,
    Calendar,
    CheckCircle,
    ClipboardList,
    Clock,
    DollarSign,
    Edit,
    MapPin,
    MessageSquare,
    Star,
    User,
    XCircle
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";

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
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "poster" | "tasker" | "both";
  avatar?: string;
  bio?: string;
  location: string;
  rating: number;
  reviewsCount: number;
  completedTasks: number;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthMeResponse {
  success: boolean;
  data: UserData;
}

// Моковые данные для fallback
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
  }
];

const mockMyOffers: Offer[] = [];
const mockMyReviews: Review[] = [];

interface MyProfileProps {
  onBack: () => void;
  onEditProfile: () => void;
  onTaskClick: (taskId: string) => void;
}

type TabType = "tasks" | "offers" | "reviews";

export function MyProfile({ onBack, onEditProfile, onTaskClick }: MyProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [myTasks] = useState<Task[]>(mockMyTasks);
  const [myOffers] = useState<Offer[]>(mockMyOffers);
  const [myReviews] = useState<Review[]>(mockMyReviews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {logout} = useAuth()
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const { accessToken } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("Требуется авторизация");
      }

      const response = await api.request('/auth/me');

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const data: AuthMeResponse = await response.json();
      
      if (data.success) {
        setUserData(data.data);
      } else {
        throw new Error("Не удалось загрузить данные пользователя");
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await logout()
    } catch (err) {
      console.error("Ошибка при выходе", err);
    } 
  };

  const getStatusBadge = (status: Task["status"]) => {
    const config = {
      active: { color: isDark ? "#60a5fa" : "#2563eb", bg: isDark ? "#1e40af" : "#dbeafe", icon: Clock },
      in_progress: { color: isDark ? "#fbbf24" : "#d97706", bg: isDark ? "#92400e" : "#fef3c7", icon: Briefcase },
      completed: { color: isDark ? "#34d399" : "#059669", bg: isDark ? "#065f46" : "#d1fae5", icon: CheckCircle },
      cancelled: { color: isDark ? "#9ca3af" : "#6b7280", bg: isDark ? "#374151" : "#f3f4f6", icon: XCircle },
    }[status];

    const IconComponent = config.icon;
    
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <IconComponent size={14} color={config.color} />
        <Text allowFontScaling={false} style={[styles.badgeText, { color: config.color }]}>
          {status === "active" ? "Активна" : 
           status === "in_progress" ? "В работе" :
           status === "completed" ? "Завершена" : "Отменена"}
        </Text>
      </View>
    );
  };

  const getOfferStatusBadge = (status: Offer["status"]) => {
    const config = {
      pending: { color: isDark ? "#fbbf24" : "#d97706", bg: isDark ? "#92400e" : "#fef3c7", icon: Clock },
      accepted: { color: isDark ? "#34d399" : "#059669", bg: isDark ? "#065f46" : "#d1fae5", icon: CheckCircle },
      rejected: { color: isDark ? "#9ca3af" : "#6b7280", bg: isDark ? "#374151" : "#f3f4f6", icon: XCircle },
    }[status];

    const IconComponent = config.icon;
    
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <IconComponent size={14} color={config.color} />
        <Text allowFontScaling={false} style={[styles.badgeText, { color: config.color }]}>
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

  const getMemberDuration = (memberSince: string) => {
    const memberDate = new Date(memberSince);
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
      {userData?.avatar ? (
        <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
      ) : (
        <User size={32} color={isDark ? "#60a5fa" : "#2563eb"} />
      )}
    </View>
  );

  const renderReviewAvatar = (review: Review) => (
    <View style={styles.reviewAvatar}>
      {review.authorAvatar ? (
        <Image source={{ uri: review.authorAvatar }} style={styles.avatarImage} />
      ) : (
        <User size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
      )}
    </View>
  );

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          color={i < rating ? "#fbbf24" : isDark ? "#4b5563" : "#d1d5db"}
          fill={i < rating ? "#fbbf24" : "transparent"}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text allowFontScaling={false} style={[styles.loadingText, { color: isDark ? "#d1d5db" : "#6b7280" }]}>
            Загрузка профиля...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text allowFontScaling={false} style={[styles.errorText, { color: isDark ? "#fca5a5" : "#dc2626" }]}>
            {error || "Не удалось загрузить данные"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text allowFontScaling={false} style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logOut} style={[styles.retryButton, {marginTop: 16}]}>
            <Text allowFontScaling={false} style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileMain}>
            {/* Аватар и основная информация в одной строке */}
            <View style={styles.profileTop}>
              {renderAvatar()}
              
              <View style={styles.nameSection}>
                <Text allowFontScaling={false} style={styles.profileName}>{userData.name}</Text>
                <View style={styles.roleBadge}>
                  <Text allowFontScaling={false} style={styles.roleText}>{getRoleLabel(userData.role)}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.editButton}
                onPress={onEditProfile}
              >
                <Edit size={18} color={isDark ? "#60a5fa" : "#2563eb"} />
              </TouchableOpacity>
            </View>

            {/* Био */}
            {userData.bio && (
              <Text allowFontScaling={false} style={styles.bio}>{userData.bio}</Text>
            )}

            {/* Основные метрики */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <View style={styles.metricValueContainer}>
                  <Star size={20} color="#fbbf24" fill="#fbbf24" />
                  <Text allowFontScaling={false} style={styles.metricValue}>{userData.rating}</Text>
                </View>
                <Text allowFontScaling={false} style={styles.metricLabel}>{userData.reviewsCount} отзывов</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <View style={styles.metricValueContainer}>
                  <CheckCircle size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
                  <Text allowFontScaling={false} style={styles.metricValue}>{userData.completedTasks}</Text>
                </View>
                <Text allowFontScaling={false} style={styles.metricLabel}>выполнено задач</Text>
              </View>
            </View>

            {/* Дополнительная информация */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <MapPin size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
                <Text allowFontScaling={false} style={styles.infoText}>{userData.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
                <Text allowFontScaling={false} style={styles.infoText}>{getMemberDuration(userData.memberSince)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <ClipboardList size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
            </View>
            <Text allowFontScaling={false} style={styles.statNumber}>{myTasks.length}</Text>
            <Text allowFontScaling={false} style={styles.statLabel}>Мои задачи</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Briefcase size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
            </View>
            <Text allowFontScaling={false} style={styles.statNumber}>{myOffers.length}</Text>
            <Text allowFontScaling={false} style={styles.statLabel}>Мои отклики</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MessageSquare size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
            </View>
            <Text allowFontScaling={false} style={styles.statNumber}>{myReviews.length}</Text>
            <Text allowFontScaling={false} style={styles.statLabel}>Отзывы</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsCard}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "tasks" && styles.activeTab]}
              onPress={() => setActiveTab("tasks")}
            >
              <Text allowFontScaling={false} style={[styles.tabText, activeTab === "tasks" && styles.activeTabText]}>
                Мои задачи ({myTasks.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === "offers" && styles.activeTab]}
              onPress={() => setActiveTab("offers")}
            >
              <Text allowFontScaling={false} style={[styles.tabText, activeTab === "offers" && styles.activeTabText]}>
                Мои отклики ({myOffers.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text allowFontScaling={false} style={[styles.tabText, activeTab === "reviews" && styles.activeTabText]}>
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
                      <Text allowFontScaling={false} style={styles.taskTitle}>{task.title}</Text>
                      <View style={styles.categoryBadge}>
                        <Text allowFontScaling={false} style={styles.categoryText}>{task.category}</Text>
                      </View>
                    </View>
                    {getStatusBadge(task.status)}
                  </View>

                  <Text allowFontScaling={false} style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>

                  <View style={styles.taskFooter}>
                    <View style={styles.taskMeta}>
                      <View style={styles.metaItem}>
                        <DollarSign size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
                        <Text allowFontScaling={false} style={styles.metaText}>₽{task.budget.toLocaleString()}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MapPin size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
                        <Text allowFontScaling={false} style={styles.metaText}>{task.location}</Text>
                      </View>
                    </View>
                    <View style={styles.offersBadge}>
                      <Text allowFontScaling={false} style={styles.offersText}>{task.offersCount} откликов</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {myTasks.length === 0 && (
                <View style={styles.emptyState}>
                  <Text allowFontScaling={false} style={styles.emptyStateText}>У вас пока нет задач</Text>
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
                      <Text allowFontScaling={false} style={styles.offerTitle}>{offer.taskTitle}</Text>
                      <View style={styles.categoryBadge}>
                        <Text allowFontScaling={false} style={styles.categoryText}>{offer.taskCategory}</Text>
                      </View>
                    </View>
                    {getOfferStatusBadge(offer.status)}
                  </View>

                  <View style={styles.offerFooter}>
                    <View style={styles.priceContainer}>
                      <DollarSign size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
                      <Text allowFontScaling={false} style={styles.priceText}>₽{offer.myPrice.toLocaleString()}</Text>
                    </View>
                    <Text allowFontScaling={false} style={styles.offerDate}>
                      {formatDate(offer.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}

              {myOffers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text allowFontScaling={false} style={styles.emptyStateText}>У вас пока нет откликов</Text>
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
                        <Text allowFontScaling={false} style={styles.authorName}>{review.authorName}</Text>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                    <Text allowFontScaling={false} style={styles.reviewDate}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>

                  <Text allowFontScaling={false} style={styles.reviewComment}>{review.comment}</Text>
                  
                  <View style={styles.reviewTaskBadge}>
                    <Text allowFontScaling={false} style={styles.reviewTaskText}>{review.taskTitle}</Text>
                  </View>
                </View>
              ))}

              {myReviews.length === 0 && (
                <View style={styles.emptyState}>
                  <Text allowFontScaling={false} style={styles.emptyStateText}>У вас пока нет отзывов</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={logOut} style={styles.logoutContainer}>
          <Text allowFontScaling={false} style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: isDark ? "#2563eb" : "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: isDark ? "#1f2937" : "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.1,
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
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: isDark ? "#374151" : "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "500",
    color: isDark ? "#d1d5db" : "#4b5563",
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? "#374151" : "#f8fafc",
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  bio: {
    fontSize: 15,
    color: isDark ? "#d1d5db" : "#6b7280",
    lineHeight: 22,
    textAlign: "left",
  },
  metricsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#374151" : "#f8fafc",
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
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  metricLabel: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
    textAlign: "center",
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: isDark ? "#4b5563" : "#e5e7eb",
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
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: isDark ? "#1e40af" : "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: isDark ? "#1f2937" : "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? "#1e40af" : "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    backgroundColor: isDark ? "#1f2937" : "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? "#1e40af" : "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  tabsCard: {
    backgroundColor: isDark ? "#1f2937" : "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#374151" : "#e5e7eb",
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
    color: isDark ? "#9ca3af" : "#6b7280",
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
    backgroundColor: isDark ? "#374151" : "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#e5e7eb",
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
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
    color: isDark ? "#9ca3af" : "#6b7280",
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
    color: isDark ? "#d1d5db" : "#6b7280",
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
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  offersBadge: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offersText: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  offerCard: {
    backgroundColor: isDark ? "#374151" : "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#e5e7eb",
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
    color: isDark ? "#f9fafb" : "#1f2937",
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
    color: isDark ? "#60a5fa" : "#2563eb",
  },
  offerDate: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  reviewCard: {
    backgroundColor: isDark ? "#374151" : "#f9fafb",
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
    color: isDark ? "#f9fafb" : "#1f2937",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  reviewComment: {
    fontSize: 14,
    color: isDark ? "#d1d5db" : "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewTaskBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reviewTaskText: {
    fontSize: 10,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  logoutContainer:{
    // backgroundColor: "#2563eb",
    borderWidth:1,
    borderColor:isDark ? "#60a5fa" : "#2563eb",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginHorizontal: 16,
    marginBottom:16
  },
  logoutText: {
    color:isDark ? 'white' : 'red',
    fontSize: 16,
    fontWeight: '600',
  },
});