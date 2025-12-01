// components/TaskItem.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Task } from './TaskList';

interface TaskItemProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  variant?: 'list' | 'grid';
  swipeEnabled?: boolean;
}

// Моковые изображения для демонстрации
const mockImages = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
];

export function TaskItem({ 
  task, 
  onTaskClick, 
  variant = 'list',
  swipeEnabled = true 
}: TaskItemProps) {
  const swipeableRef = React.useRef<Swipeable>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  // Получаем случайное изображение для демонстрации
  const taskImage = mockImages[parseInt(task.id) % mockImages.length];

  const handleHidePress = () => {
    Alert.alert(
      'Скрыть задание',
      'Выберите причину скрытия:',
      [
        {
          text: 'Не показывать эту категорию',
          onPress: () => console.log('Скрыть категорию:', task.category),
        },
        {
          text: 'Не интересует это задание',
          onPress: () => console.log('Скрыть задание:', task.id),
        },
        {
          text: 'Не подходит город или регион',
          onPress: () => console.log('Скрыть по региону:', task.location),
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
    swipeableRef.current?.close();
    setShowMenu(false);
  };

  const handleSavePress = () => {
    console.log('Сохранено задание:', task.id);
    swipeableRef.current?.close();
    setShowMenu(false);
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const renderRightActions = () => {
    if (variant === 'grid') return null;
    
    return (
      <View style={styles.verticalActions}>
        <TouchableOpacity 
          style={[styles.verticalActionButton, styles.saveButton]} 
          onPress={handleSavePress}
        >
          <Ionicons name="bookmark-outline" size={20} color="white" />
          <Text style={styles.verticalActionButtonText}>Сохранить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.verticalActionButton, styles.hideButton]} 
          onPress={handleHidePress}
        >
          <Ionicons name="eye-off-outline" size={20} color="white" />
          <Text style={styles.verticalActionButtonText}>Скрыть</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getStatusColor = (s: Task['status']) => {
    if (isDark) {
      return s === 'open' ? '#22C55E' : s === 'in_progress' ? '#60a5fa' : '#9CA3AF';
    }
    return s === 'open' ? '#22C55E' : s === 'in_progress' ? '#3B82F6' : '#9CA3AF';
  };

  // const formatPrice = (price: number, priceType: string) => {
  //   return `₽${price.toLocaleString()}${priceType === 'hourly' ? '/ч' : ''}`;
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays}д`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  const { budgetMin, budgetMax, budgetType } = task;

  const renderPrice = () => {
    
    switch (budgetType) {
      case 'fixed':
        return `${budgetMin !== budgetMax ? `${budgetMin} - ${formatPrice(budgetMax)}` : formatPrice(budgetMin)}`;
      
      case 'hourly':
        return `${formatPrice(task.hourlyRate)}/ч`;
      
      case 'range':
        if (budgetMin === budgetMax) {
          return `${formatPrice(budgetMin)}`;
        }
        return `${formatPrice(budgetMin)} - ${formatPrice(budgetMax)}`;
      
      case 'negotiable':
        return 'Договорная';
      
      default:
        return `${formatPrice(budgetMin)}`;
    }
  };

  // Функция для форматирования числа в денежный формат
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };
  // Контент для grid варианта (упрощенный)
  const GridCardContent = () => {
    // Функция для форматирования цены в зависимости от типа бюджета
    
  
    return (
      <TouchableOpacity 
        style={styles.gridCard}
        onPress={() => onTaskClick(task.id)}
        activeOpacity={0.7}
      >
        {/* Изображение */}
        <View style={styles.imageContainer}>
          <Image 
            source={{uri:task?.images?.[0] || 'https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'}} 
            style={styles.taskImage}
            resizeMode="cover"
          />
        </View>
  
        {/* Контент */}
        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {task.title}
          </Text>
          
          <Text style={styles.gridDescription} numberOfLines={2}>
            {task.description}
          </Text>
          <View style={styles.gridPrice}>
              <Text style={styles.gridPriceText}>
                {renderPrice()}
              </Text>
              {/* Можно добавить иконку типа бюджета */}
              {/* {budgetType === 'hourly' && (
                <Ionicons name="time-outline" size={12} color={isDark ? "#9ca3af" : "#6B7280"} />
              )}
              {budgetType === 'negotiable' && (
                <Ionicons name="chatbubble-outline" size={12} color={isDark ? "#9ca3af" : "#6B7280"} />
              )} */}
            </View>
          <View style={styles.gridFooter}>
            <View style={styles.gridDate}>
              <Ionicons name="calendar-outline" size={12} color={isDark ? "#9ca3af" : "#6B7280"} />
              <Text style={styles.gridDateText}>{formatDate(task.deadline)}</Text>
            </View>
            <View style={styles.gridLocation}>
              <Ionicons name="location-outline" size={12} color={isDark ? "#9ca3af" : "#6B7280"} />
              <Text style={styles.gridLocationText} numberOfLines={1}>
                {task.location.split(',')[0]}
              </Text>
            </View>
            {/* <View style={styles.gridOffers}>
              <Ionicons name="chatbubble-outline" size={12} color={isDark ? "#9ca3af" : "#6B7280"} />
              <Text style={styles.gridOffersText}>{task.offersCount}</Text>
            </View> */}
          </View>
        </View>
        
        <Text numberOfLines={1} style={styles.gridCategoryName}>
          {task.categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  // Контент для list варианта (полный)
  const ListCardContent = () => (
    <Pressable 
      style={[styles.listCard, { borderLeftColor: isDark ? "#60a5fa" : "#2563EB" }]}
      onPress={() => onTaskClick(task.id)}
    >
      <View style={styles.listHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.listTitle}>{task.title}</Text>
          <Text style={[styles.listStatus, { color: getStatusColor(task.status) }]}>
            {task.status === 'open' ? 'Открыта' : task.status === 'in_progress' ? 'В работе' : 'Выполнена'}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.listPrice}>{renderPrice()}</Text>
          <Text style={styles.listPriceType}>
            {task.priceType === 'fixed' ? 'за задание' : 'в час'}
          </Text>
        </View>
      </View>

      <Text style={styles.listDescription} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.listMeta}>
        <View style={styles.listMetaItem}>
          <Ionicons name="location-outline" size={14} color={isDark ? "#9ca3af" : "#6B7280"} />
          <Text style={styles.listMetaText}>{task.location}</Text>
        </View>

        <View style={styles.listMetaItem}>
          <Ionicons name="chatbubbles-outline" size={14} color={isDark ? "#9ca3af" : "#6B7280"} />
          <Text style={styles.listMetaText}>{task.offersCount} откликов</Text>
        </View>

        <View style={styles.listMetaItem}>
          <Ionicons name="calendar-outline" size={14} color={isDark ? "#9ca3af" : "#6B7280"} />
          <Text style={styles.listMetaText}>{formatDate(task.deadline)}</Text>
        </View>
      </View>
    </Pressable>
  );

  // Для list варианта с свайпом
  if (variant === 'list' && swipeEnabled) {
    return (
      <GestureHandlerRootView>
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          friction={2}
          rightThreshold={50}
          containerStyle={styles.swipeableContainer}
        >
          <ListCardContent />
        </Swipeable>
      </GestureHandlerRootView>
    );
  }

  // Для grid варианта
  if (variant === 'grid') {
    return <GridCardContent />;
  }

  // Для list варианта без свайпа
  return <ListCardContent />;
}

const { width } = Dimensions.get('window');

const getStyles = (isDark: boolean) => StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  // Стили для Grid варианта
  gridCard: {
    backgroundColor: isDark ? "#1f2937" : "white",
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.1 : 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    flex: 1, 
    marginHorizontal: 3, 
    minHeight: 280, 
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  taskImage: {
    width: '50%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  gridMenuButton: {
    position:'absolute',
    top:5,
    right:5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 3,
    borderRadius: 4,
  },
  gridDropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 8,
    backgroundColor: isDark ? "#374151" : "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.2 : 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
    minWidth: 140,
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#1F2937",
    marginBottom: 4,
    lineHeight: 18,
    minHeight:36
  },
  gridDescription: {
    fontSize: 12,
    color: isDark ? "#9ca3af" : "#6B7280",
    marginBottom: 8,
    lineHeight: 16,
  },
  gridCategoryName: {
    color: isDark ? "#9ca3af" : "#6B7280",
    marginBottom: 0,
    lineHeight: 16,
    fontSize:10, 
    textAlign:'center'
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridPrice: {
    flex: 1,
  },
  gridPriceText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom:8,
    color: isDark ? "#60a5fa" : "#2563EB",
  },
  gridLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth:'45%'
  },
  gridLocationText: {
    fontSize: 11,
    color: isDark ? "#9ca3af" : "#6B7280",
    marginLeft: 4,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDateText: {
    fontSize: 11,
    color: isDark ? "#9ca3af" : "#6B7280",
    marginLeft: 4,
  },
  gridOffers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridOffersText: {
    fontSize: 11,
    color: isDark ? "#9ca3af" : "#6B7280",
    marginLeft: 4,
  },
  // Стили для List варианта
  listCard: {
    backgroundColor: isDark ? "#1f2937" : "white",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  listStatus: {
    fontWeight: '500',
    marginVertical: 4,
  },
  listPrice: {
    color: isDark ? "#60a5fa" : "#2563EB",
    fontSize: 18,
    fontWeight: '700',
  },
  listPriceType: {
    color: isDark ? "#9ca3af" : "#6B7280",
    fontSize: 12,
  },
  listDescription: {
    color: isDark ? "#d1d5db" : "#4B5563",
    marginVertical: 8,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  listMetaText: {
    color: isDark ? "#9ca3af" : "#6B7280",
    marginLeft: 4,
    fontSize: 12,
  },
  // Общие стили для действий
  verticalActions: {
    width: 100,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  verticalActionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  verticalActionButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  hideButton: {
    backgroundColor: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});