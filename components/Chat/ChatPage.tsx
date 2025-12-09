// app/messages/chat/[id].tsx
import { MediaPicker, MessageItem, ReplyPreview } from '@/components/Chat/ChatComponents';
import { getStyles } from '@/components/Chat/getStyles';
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


const ChatPage = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insetBottom = useSafeAreaInsets().bottom
  const styles = getStyles(isDark, SCREEN_WIDTH, insetBottom);

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



export default ChatPage;