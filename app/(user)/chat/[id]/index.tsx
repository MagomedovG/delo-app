// app/messages/chat/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  date: string;
  isRead: boolean;
}

interface ReplyToMessage {
  id: string;
  text: string;
  fromMe: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Вынесенный компонент медиа пикера
const MediaPicker = React.memo(({ 
  isVisible, 
  onClose, 
  onSelectMedia,
  isDark 
}: { 
  isVisible: boolean;
  onClose: () => void;
  onSelectMedia: (type: 'photo' | 'camera' | 'document' | 'location') => void;
  isDark: boolean;
}) => {
  const styles = getStyles(isDark);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.mediaPickerOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.mediaPickerContainer}>
              <View style={styles.mediaPickerHeader}>
                <Text allowFontScaling={false} style={styles.mediaPickerTitle}>Прикрепить</Text>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.mediaPickerCloseButton}
                >
                  <Ionicons name="close" size={24} color={isDark ? '#8E8E93' : '#C7C7CC'} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.mediaOptionsContainer}>
                <TouchableOpacity 
                  style={styles.mediaOption}
                  onPress={() => onSelectMedia('photo')}
                >
                  <View style={[styles.mediaOptionIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                    <Ionicons name="image-outline" size={28} color="#007AFF" />
                  </View>
                  <Text allowFontScaling={false} style={styles.mediaOptionText}>Фото и видео</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mediaOption}
                  onPress={() => onSelectMedia('camera')}
                >
                  <View style={[styles.mediaOptionIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                    <Ionicons name="camera-outline" size={28} color="#007AFF" />
                  </View>
                  <Text allowFontScaling={false} style={styles.mediaOptionText}>Камера</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mediaOption}
                  onPress={() => onSelectMedia('document')}
                >
                  <View style={[styles.mediaOptionIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                    <Ionicons name="document-text-outline" size={28} color="#007AFF" />
                  </View>
                  <Text allowFontScaling={false} style={styles.mediaOptionText}>Документ</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mediaOption}
                  onPress={() => onSelectMedia('location')}
                >
                  <View style={[styles.mediaOptionIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                    <Ionicons name="location-outline" size={28} color="#007AFF" />
                  </View>
                  <Text allowFontScaling={false} style={styles.mediaOptionText}>Местоположение</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

// Вынесенный компонент сообщения с поддержкой свайпа и удержания
const MessageItem = React.memo(({ 
  item, 
  onReply, 
  onLongPress,
  isDark,
  onPress
}: { 
  item: Message; 
  onReply: () => void;
  onLongPress: () => void;
  isDark: boolean;
  onPress: ()=> void
}) => {
  const styles = getStyles(isDark);
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  // Анимация для свайпа
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Более лояльная проверка: если горизонтальное движение больше вертикального
        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificantHorizontal = Math.abs(gestureState.dx) > 5;
        return isHorizontalSwipe && isSignificantHorizontal;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Не перехватываем жест на этом уровне
        return false;
      },
      onPanResponderMove: (_, gestureState) => {
        // Разрешаем свайп только влево
        if (gestureState.dx < 0) {
          // Ограничиваем максимальный свайп
          const maxSwipe = -100;
          const newX = Math.max(maxSwipe, gestureState.dx);
          translateX.setValue(newX);
          
          // Можно добавить визуальную подсказку (например, иконку ответа)
          // которая появляется при достаточном свайпе
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 10; // Порог для активации ответа
        const VELOCITY_THRESHOLD = 0.5; // Порог скорости
        
        // Проверяем дистанцию и скорость свайпа
        const hasSwipedEnough = gestureState.dx < -SWIPE_THRESHOLD;
        const hasEnoughVelocity = Math.abs(gestureState.vx) > VELOCITY_THRESHOLD;
        
        // Если свайпнули достаточно или была быстрая скорость свайпа
        if (hasSwipedEnough || (gestureState.dx < 0 && hasEnoughVelocity)) {
          // Анимация подтверждения свайпа
          Animated.timing(translateX, {
            toValue: -60, // Показываем иконку ответа
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            // Задержка перед сбросом и вызовом ответа
            setTimeout(() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }).start();
              onReply();
            }, 50);
          });
        } else {
          // Возвращаем на место если не дотянули
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Если жест был прерван (например, другим жестом)
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
      onPanResponderTerminationRequest: () => {
        // Разрешаем прерывание (например, при скролле списка)
        return true;
      },
    })
  ).current;

  // Анимация при удержании
  const handleLongPress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onLongPress();
  };

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        item.fromMe ? styles.myMessageContainer : styles.theirMessageContainer,
        {
          transform: [
            { translateX: translateX },
            { scale: scaleValue }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={handleLongPress}
        delayLongPress={300}
        onPress={onPress}
      >
        <View style={[
          styles.messageBubble,
          item.fromMe ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text allowFontScaling={false} style={[
            styles.messageText,
            item.fromMe ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.text}
          </Text>
          <View style={styles.messageMeta}>
            <Text allowFontScaling={false} style={[
              styles.messageTime,
              item.fromMe ? styles.myMessageTime : styles.theirMessageTime
            ]}>
              {item.time}
            </Text>
            {item.fromMe && (
              <Ionicons 
                name={item.isRead ? "checkmark-done" : "checkmark"} 
                size={16} 
                color={item.isRead ? '#fff' : '#fff'} 
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Компонент для отображения ответа на сообщение
const ReplyPreview = ({ replyTo, onCancel, isDark }: { 
  replyTo: ReplyToMessage | null; 
  onCancel: () => void;
  isDark: boolean;
}) => {
  const styles = getStyles(isDark);
  
  if (!replyTo) return null;
  
  return (
    <View style={styles.replyPreviewContainer}>
      <View style={styles.replyPreviewContent}>
        <View style={styles.replyPreviewLine} />
        <View style={styles.replyPreviewTextContainer}>
          <Text allowFontScaling={false} style={styles.replyPreviewAuthor}>
            {replyTo.fromMe ? 'Вы' : 'Дмитрий Иванов'}
          </Text>
          <Text allowFontScaling={false} style={styles.replyPreviewText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={styles.replyPreviewCancelButton}>
          <Ionicons name="close" size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChatPage = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insetBottom = useSafeAreaInsets().bottom
  const styles = getStyles(isDark, insetBottom);

  const [input, setInput] = useState('');
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      fromMe: false,
      text: 'Добрый день! Могу приехать завтра в 10:00. Вам удобно?',
      time: '12:30',
      date: '7 нояб.',
      isRead: true,
    },
    {
      id: '2',
      fromMe: true,
      text: 'Да, отлично! Буду ждать. Все инструменты с собой?',
      time: '12:32',
      date: '7 нояб.',
      isRead: true,
    },
    {
      id: '3',
      fromMe: false,
      text: 'Да, все необходимые инструменты будут. Также возьму шуруповерт и уровень.',
      time: '12:35',
      date: '7 нояб.',
      isRead: true,
    },
  ]);

  // Анимация клавиатуры с синхронизацией скорости
  useLayoutEffect(() => {
    let keyboardShowDuration = 150;
    let keyboardHideDuration = 150;
    
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        // Используем ту же длительность, что и клавиатура
        keyboardShowDuration = e.duration || 150;
        
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height - insetBottom,
          duration: keyboardShowDuration,
          useNativeDriver: false,
        }).start();

        // Закрываем медиа пикер при открытии клавиатуры
        setShowMediaPicker(false);

        // Прокрутка к низу при открытии клавиатуры
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        keyboardHideDuration = e.duration || 250;
        
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: keyboardHideDuration,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Обработка показа/скрытия медиа пикера
  useEffect(() => {
    if (showMediaPicker) {
      Keyboard.dismiss();
      Animated.timing(keyboardHeight, {
        toValue: 280, // Высота медиа пикера
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else if (!showMediaPicker && keyboardHeight.__getValue() > 0) {
      // Если закрываем медиа пикер, но клавиатура не открыта, возвращаем к нулю
      const currentHeight = keyboardHeight.__getValue();
      if (currentHeight > 0 && currentHeight < 100) {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [showMediaPicker]);

  // Настройка хедера
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerAvatar}>
            <Text allowFontScaling={false} style={styles.headerAvatarText}>Д</Text>
          </View>
          <View style={styles.headerUserInfo}>
            <Text allowFontScaling={false} style={styles.headerUserName} numberOfLines={1}>
              Дмитрий Иванов
            </Text>
            <Text allowFontScaling={false} style={styles.headerUserStatus}>был(а) недавно</Text>
          </View>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={isDark ? '#fff' : '#007AFF'} 
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons 
              name="videocam-outline" 
              size={24} 
              color={isDark ? '#fff' : '#007AFF'} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons 
              name="call-outline" 
              size={22} 
              color={isDark ? '#fff' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTitleAlign: 'center',
      headerBackTitleVisible: false,
    });
  }, [navigation, isDark]);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        fromMe: true,
        text: replyTo ? `Ответ на: "${replyTo.text}"\n${input.trim()}` : input.trim(),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        date: 'Сейчас',
        isRead: false,
      };
      setMessages([...messages, newMessage]);
      setInput('');
      setReplyTo(null);
      
      // Прокрутка к новому сообщению
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSelectMedia = (type: 'photo' | 'camera' | 'document' | 'location') => {
    setShowMediaPicker(false);
    // Здесь реализуйте логику выбора медиа
    console.log(`Выбран тип: ${type}`);
    // Например, вызов ImagePicker для фотографий
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyTo({
      id: message.id,
      text: message.text,
      fromMe: message.fromMe,
    });
    inputRef.current?.focus();
  };

  const handleMessageLongPress = (message: Message) => {
    // Показываем меню действий при долгом нажатии
    console.log('Long press on message:', message.id);
    // Можно реализовать контекстное меню с действиями: Ответить, Копировать, Удалить и т.д.
    handleReplyToMessage(message);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem
      item={item}
      onReply={() => handleReplyToMessage(item)}
      onLongPress={() => handleMessageLongPress(item)}
      isDark={isDark}
      onPress={Keyboard.dismiss}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text allowFontScaling={false} style={styles.taskTitle} numberOfLines={1}>Ремонт сантехники в ванной</Text>
            <Text allowFontScaling={false} style={styles.taskPrice}>₽5 000</Text>
          </View>
          <Text allowFontScaling={false} style={styles.taskDescription} numberOfLines={2}>
            Замена смесителя, прочистка канализационных труб
          </Text>
        </View>

        {/* Messages List */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (replyTo || keyboardHeight.__getValue() > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />
        </View>

        {/* Media Picker */}
        <MediaPicker
          isVisible={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelectMedia={handleSelectMedia}
          isDark={isDark}
        />

        {/* Preview ответа на сообщение */}
        <ReplyPreview
          replyTo={replyTo}
          onCancel={() => setReplyTo(null)}
          isDark={isDark}
        />

        {/* Input Area с анимированным отступом */}
        <Animated.View 
          style={[
            styles.inputContainer,
            {
              paddingBottom: Animated.add(
                keyboardHeight,
                new Animated.Value(Platform.OS === 'ios' ? 0 : 8)
              ),
            }
          ]}
        >
          <View style={styles.inputWrapper}>
            <TouchableOpacity 
              style={styles.attachButton}
              // onPress={() => setShowMediaPicker(!showMediaPicker)}
            >
              <Ionicons 
                name={showMediaPicker ? "close-circle-outline" : "add-circle-outline"} 
                size={28} 
                color={showMediaPicker ? '#007AFF' : (isDark ? '#8E8E93' : '#C7C7CC')} 
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={replyTo ? "Введите ответ..." : "Сообщение"}
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
              onFocus={() => {
                setShowMediaPicker(false);
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 50);
              }}
            />

            {input.trim() ? (
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendMessage}
              >
                <Ionicons 
                  name="send" 
                  size={14} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.mediaButtons}>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => handleSelectMedia('camera')}
                >
                  <Ionicons 
                    name="camera-outline" 
                    size={22} 
                    color={isDark ? '#8E8E93' : '#C7C7CC'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton}>
                  <Ionicons 
                    name="mic-outline" 
                    size={22} 
                    color={isDark ? '#8E8E93' : '#C7C7CC'} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
       
      </View>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (isDark: boolean, insetBottom?:number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    paddingBottom: insetBottom + 10
  },
  // Стили для правильного хедера
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: Platform.OS === 'ios' ? -50 : 0,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#3A3A3C' : '#E9E9EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
  },
  headerUserInfo: {
    flex: 1,
    maxWidth: 200,
  },
  headerUserName: {
    fontSize: 17,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 2,
  },
  headerUserStatus: {
    fontSize: 13,
    color: isDark ? '#8E8E93' : '#8E8E93',
    fontWeight: '400',
  },
  headerBackButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    gap: 8,
  },
  headerIconButton: {
    padding: 8,
  },
  // Карточка задания
  taskCard: {
    backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
    margin: 12,
    padding: 12,
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    flex: 1,
    marginRight: 8,
  },
  taskPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  taskDescription: {
    fontSize: 13,
    color: isDark ? '#8E8E93' : '#8E8E93',
    lineHeight: 16,
  },
  // Сообщения
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 8,
  },
  messageContainer: {
    marginBottom: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: isDark ? '#0A84FF' : '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: isDark ? '#FFFFFF' : '#000000',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  messageTime: {
    fontSize: 13,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: isDark ? '#8E8E93' : '#8E8E93',
  },
  // Инпут с анимацией
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: isDark ? '#38383A' : '#C6C6C8',

  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  attachButton: {
    padding: 4,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: isDark ? '#FFFFFF' : '#000000',
    maxHeight: 100,
    paddingVertical: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  mediaButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  mediaButton: {
    padding: 4,
  },
  // Media Picker
  mediaPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mediaPickerContainer: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: 400,
  },
  mediaPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? '#38383A' : '#C6C6C8',
  },
  mediaPickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
  },
  mediaPickerCloseButton: {
    padding: 4,
  },
  mediaOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  mediaOption: {
    width: (SCREEN_WIDTH - 80) / 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaOptionText: {
    fontSize: 12,
    color: isDark ? '#FFFFFF' : '#000000',
    textAlign: 'center',
  },
  // Reply Preview
  replyPreviewContainer: {
    backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: isDark ? '#38383A' : '#C6C6C8',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyPreviewLine: {
    width: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
    height: 40,
    marginRight: 8,
  },
  replyPreviewTextContainer: {
    flex: 1,
  },
  replyPreviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 13,
    color: isDark ? '#8E8E93' : '#8E8E93',
  },
  replyPreviewCancelButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ChatPage;