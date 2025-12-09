// Expo chat screens (no Tailwind)
// Split into components, using StyleSheet API

import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Dimensions, Modal, PanResponder, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { getStyles } from "./getStyles";
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
// -----------------------------------------
// Header
// -----------------------------------------
export const ReplyPreview = ({ replyTo, onCancel, isDark }: { 
  replyTo: ReplyToMessage | null; 
  onCancel: () => void;
  isDark: boolean;
}) => {
  const styles = getStyles(isDark, SCREEN_WIDTH);
  
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

// -----------------------------------------
// Message Bubble
// -----------------------------------------
export const MessageItem = React.memo(({ 
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

// -----------------------------------------
// Predefined Quick Buttons
// -----------------------------------------
export const MediaPicker = React.memo(({ 
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

// -----------------------------------------
// Main Chat Screen
// -----------------------------------------


// -----------------------------------------
// Styles
// -----------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backBtn: {
    fontSize: 16,
    color: '#555',
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  bubbleMe: {
    backgroundColor: '#FF6600',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#F2F2F2',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    textAlign: 'right',
  },
  quickContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },
  quickBtn: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  quickText: {
    fontSize: 14,
    color: '#333',
  },
});
