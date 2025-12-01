// app/messages/index.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Chat {
  id: string;
  userName: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  userInitial: string;
  role: string;
}

const MessagesPage = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  // Mock данные чатов
  const chats: Chat[] = [
    {
      id: '1',
      userName: 'Дмитрий Иванов',
      lastMessage: 'Добрый день! Могу приехать завтра в 10:00',
      time: '12:30',
      unreadCount: 2,
      isOnline: true,
      userInitial: 'Д',
      role: 'Исполнитель'
    },
    {
      id: '2',
      userName: 'Анна Петрова',
      lastMessage: 'Спасибо за выполненную работу!',
      time: 'Вчера',
      unreadCount: 0,
      isOnline: false,
      userInitial: 'А',
      role: 'Заказчик'
    },
    {
      id: '3',
      userName: 'Сергей Козлов',
      lastMessage: 'Когда сможете приступить к работе?',
      time: 'Пн',
      unreadCount: 1,
      isOnline: true,
      userInitial: 'С',
      role: 'Исполнитель'
    },
  ];

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => router.push(`/(user)/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userInitial}</Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        <Text style={styles.roleText}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Сообщения</Text>
      </View> */}

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    // display:'flex',
    // flexDirection:'column',
    // justifyContent:'flex-start',
    backgroundColor: isDark ? '#121212' : '#f8f9fa',
    // borderTopWidth: 1,
    // borderTopColor: "#ff0000",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    textAlign: 'center',
    
  },
  listContent: {
    padding: 16,
    
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
  },
  avatarContainer: {
    position: 'relative',
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
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: isDark ? '#1e1e1e' : '#fff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleText: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
  },
});

export default MessagesPage;