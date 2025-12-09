// app/messages/index.tsx
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { api } from '@/utils/api';


interface Conversation {
  id: string;
  task_id: string;
  task_title: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  status: string;
  created_at: string;
}

interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.request('/chat/conversations');
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      const data: ConversationsResponse = await response.json();
      
      if (data.success) {
        setConversations(data.data || []);
      } else {
        throw new Error("Не удалось загрузить переписки");
      }
    } catch (err: any) {
      console.error("Ошибка при загрузке переписок:", err);
      if (err.message !== 'Требуется авторизация') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString("ru-RU", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }).replace(':', '.');
    } else if (diffDays === 1) {
      return "Вчера";
    } else if (diffDays < 7) {
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString("ru-RU", { 
        day: "numeric", 
        month: "short" 
      }).replace(' г.', '');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  const filteredConversations = conversations.filter(conv => 
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.task_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        {item.other_user_avatar ? (
          <View style={styles.avatarImageContainer}>
            {/* Здесь можно использовать Image из react-native */}
            <View style={[styles.avatar, styles.avatarWithImage]}>
              <Text allowFontScaling={false} style={styles.avatarText}>
                {getInitials(item.other_user_name)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.avatar}>
            <Text allowFontScaling={false} style={styles.avatarText}>
              {getInitials(item.other_user_name)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.userInfo}>
            <Text allowFontScaling={false} style={styles.taskTitle} numberOfLines={1}>
              {item.task_title}
            </Text>
            <Text allowFontScaling={false} style={styles.userName} numberOfLines={1}>
              {item.other_user_name}
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.timeText}>
            {formatTime(item.last_message_at)}
          </Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text allowFontScaling={false} 
            style={[
              styles.lastMessage,
              item.unread_count > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {item.last_message || "Нет сообщений"}
          </Text>
          
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text allowFontScaling={false} style={styles.unreadCount}>
                {item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle 
        size={64} 
        color={isDark ? '#4b5563' : '#d1d5db'} 
      />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? "Ничего не найдено" : "Нет сообщений"}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? "Попробуйте изменить поисковый запрос" 
          : "Начните переписку, откликнувшись на задачу или написав исполнителю"
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchConversations}
      >
        <Text style={styles.retryButtonText}>Попробовать снова</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        {/* <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Сообщения</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? "Загрузка..." : `${totalUnread} непрочитанных`}
            </Text>
          </View>
        </View> */}

        {/* Search */}
        {/* <View style={styles.searchContainer}>
          <TextInput
            placeholder="Поиск по чатам..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View> */}
      </View>

      {/* Content */}
      {error && !loading ? (
        renderErrorState()
      ) : loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#2563eb"} />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredConversations.length === 0 && styles.emptyListContent
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDark ? "#3b82f6" : "#2563eb"]}
              tintColor={isDark ? "#3b82f6" : "#2563eb"}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#f8f9fa',
  },
  header: {
    // paddingHorizontal: 16,
    // paddingTop: 16,
    // paddingBottom: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: isDark ? '#333' : '#e5e5e5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginTop: 2,
  },
  searchContainer: {
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: isDark ? '#fff' : '#000',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex:1,
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: isDark ? '#000' : '#6b7280',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWithImage: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  avatarImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 10,
    color: isDark ? '#9ca3af' : '#6b7280',
    // backgroundColor: isDark ? '#374151' : '#f3f4f6',
    // paddingHorizontal: 6,
    paddingBottom: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
    flexShrink: 0,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: isDark ? '#fff' : '#000',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: isDark ? '#fca5a5' : '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    borderRadius: 8,
  },
  retryButtonText: {
    color: isDark ? '#3b82f6' : '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MessagesPage;