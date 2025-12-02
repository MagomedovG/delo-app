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
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  date: string;
  isRead: boolean;
  replyTo?: ReplyToMessage;
}

interface ReplyToMessage {
  id: string;
  text: string;
  fromMe: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MediaPicker = React.memo(({ isVisible, onClose, onSelectMedia, isDark }: { isVisible: boolean; onClose: () => void; onSelectMedia: (type: 'photo' | 'camera' | 'document' | 'location') => void; isDark: boolean }) => {
  const styles = getStyles(isDark);
  if (!isVisible) return null;
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.mediaPickerOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.mediaPickerContainer}>
              <View style={styles.mediaPickerHeader}>
                <Text allowFontScaling={false} style={styles.mediaPickerTitle}>Прикрепить</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={isDark ? '#8E8E93' : '#C7C7CC'} />
                </TouchableOpacity>
              </View>
              <View style={styles.mediaOptionsContainer}>
                {['photo', 'camera', 'document', 'location'].map((type) => (
                  <TouchableOpacity key={type} style={styles.mediaOption} onPress={() => onSelectMedia(type as any)}>
                    <View style={[styles.mediaOptionIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                      <Ionicons
                        name={
                          type === 'photo'
                            ? 'image-outline'
                            : type === 'camera'
                            ? 'camera-outline'
                            : type === 'document'
                            ? 'document-text-outline'
                            : 'location-outline'
                        }
                        size={28}
                        color="#007AFF"
                      />
                    </View>
                    <Text allowFontScaling={false} style={styles.mediaOptionText}>
                      {type === 'photo'
                        ? 'Фото и видео'
                        : type === 'camera'
                        ? 'Камера'
                        : type === 'document'
                        ? 'Документ'
                        : 'Местоположение'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const MessageItem = React.memo(({ item, onReply, onSelect, isDark, isSelected, handleLongPress }: { item: Message; onReply: () => void; onSelect: () => void; isDark: boolean; isSelected: boolean; handleLongPress:(item: Message, ref: React.RefObject<View>) }) => {
  const styles = getStyles(isDark);
  const ref = useRef<View>(null);
  const renderReplyPreview = () => {
    if (!item.replyTo) return null;
    return (
      <TouchableOpacity style={[styles.replyPreviewBubble, item.fromMe ? styles.myReplyPreview : styles.theirReplyPreview]} activeOpacity={0.7}>
        <View style={[styles.replyPreviewLine, item.fromMe ? styles.myReplyPreviewLine : styles.theirReplyPreviewLine]} />
        <View style={styles.replyPreviewTextContainer}>
          <Text allowFontScaling={false} style={[styles.replyPreviewAuthor, item.fromMe ? styles.myReplyPreviewAuthor : styles.theirReplyPreviewAuthor]}>
            {item.replyTo.fromMe ? 'Вы' : 'Дмитрий Иванов'}
          </Text>
          <Text allowFontScaling={false} style={[styles.replyPreviewText, item.fromMe ? styles.myReplyPreviewText : styles.theirReplyPreviewText]} numberOfLines={2}>
            {item.replyTo.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      ref={ref}
      // onLongPress={onSelect}
      onLongPress={() => handleLongPress(item, ref)}
      style={[
        styles.messageContainer,
        item.fromMe ? styles.myMessageContainer : styles.theirMessageContainer,
        isSelected && styles.selectedMessageContainer,
      ]}
    >
      <View  style={[styles.messageBubble, item.fromMe ? styles.myMessageBubble : styles.theirMessageBubble, isSelected && styles.selectedMessageBubble]}>
        {renderReplyPreview()}
        <Text allowFontScaling={false} style={[styles.messageText, item.fromMe ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
        <View style={styles.messageMeta}>
          <Text allowFontScaling={false} style={[styles.messageTime, item.fromMe ? styles.myMessageTime : styles.theirMessageTime]}>{item.time}</Text>
          {item.fromMe && <Ionicons name={item.isRead ? 'checkmark-done' : 'checkmark'} size={16} color="#fff" />}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const ReplyPreview = ({ replyTo, onCancel, isDark }: { replyTo: ReplyToMessage | null; onCancel: () => void; isDark: boolean }) => {
  const styles = getStyles(isDark);
  if (!replyTo) return null;
  return (
    <View style={styles.replyPreviewContainer}>
      <View style={styles.replyPreviewContent}>
        <View style={styles.replyPreviewLine} />
        <View style={styles.replyPreviewTextContainer}>
          <Text allowFontScaling={false} style={styles.replyPreviewAuthor}>{replyTo.fromMe ? 'Вы' : 'Дмитрий Иванов'}</Text>
          <Text allowFontScaling={false} style={styles.replyPreviewText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChatPage = () => {
  const [layout, setLayout] = useState<{ y: number; height: number } | null>(null);



  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

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
    // {
    //   id: '4',
    //   fromMe: false,
    //   text: 'Кстати, нужны ли какие-то дополнительные материалы?',
    //   time: '12:40',
    //   date: '7 нояб.',
    //   isRead: true,
    //   replyTo: {
    //     id: '2',
    //     text: 'Да, отлично! Буду ждать. Все инструменты с собой?',
    //     fromMe: true,
    //   },
    // },
  ]);

  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [messagePosition, setMessagePosition] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleAlign: 'center',
      headerBackTitleVisible: false,
      headerStyle: { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', shadowColor: 'transparent', elevation: 0 },
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerAvatar}>
            <Text allowFontScaling={false} style={styles.headerAvatarText}>Д</Text>
          </View>
          <View style={styles.headerUserInfo}>
            <Text allowFontScaling={false} style={styles.headerUserName}>Дмитрий Иванов</Text>
            <Text allowFontScaling={false} style={styles.headerUserStatus}>был(а) недавно</Text>
          </View>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#007AFF'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="videocam-outline" size={24} color={isDark ? '#fff' : '#007AFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="call-outline" size={22} color={isDark ? '#fff' : '#007AFF'} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isDark]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(keyboardHeight, { toValue: e.endCoordinates.height, duration: 250, useNativeDriver: false }).start();
      setShowMediaPicker(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardHeight, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      fromMe: true,
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      date: 'Сейчас',
      isRead: false,
      replyTo: replyTo || undefined,
    };
    setMessages([...messages, newMsg]);
    setInput('');
    setReplyTo(null);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSelectMedia = (type: 'photo' | 'camera' | 'document' | 'location') => {
    setShowMediaPicker(false);
    console.log('Выбран тип:', type);
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyTo({ id: message.id, text: message.text, fromMe: message.fromMe });
    inputRef.current?.focus();
  };

  const handleLongPress = (item: Message, ref: React.RefObject<View>) => {
    // меряем позицию на экране
    ref.current?.measure((fx, fy, width, height, px, py) => {
      setMessagePosition({ x: px, y: py, width, height });
      setSelectedMessage(item);
    });
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setSelectedMessage(null);
        setShowMessageActions(false);
      }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              onReply={() => handleReplyToMessage(item)}
              onSelect={() => {
                setSelectedMessage(item);
                setShowMessageActions(true);
              }}
              isDark={isDark}
              isSelected={selectedMessage?.id === item.id}
              setLayout={setLayout}
            />
          )}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        />

        {/* Reply Preview */}
        <ReplyPreview replyTo={replyTo} onCancel={() => setReplyTo(null)} isDark={isDark} />

        {/* Media Picker */}
        <MediaPicker isVisible={showMediaPicker} onClose={() => setShowMediaPicker(false)} onSelectMedia={handleSelectMedia} isDark={isDark} />

        {/* Selected Message Actions */}
        {showMessageActions && selectedMessage && (
          <View style={{
            position: 'absolute',
            top: messagePosition?.y ?? 100,
            left: messagePosition?.x ?? 20,
            width: messagePosition?.width ?? 200,
            backgroundColor: '#FFF',
            borderRadius: 12,
            padding: 8,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 }
          }}>
            <View style={styles.messageActionsContainer}>
              <View style={styles.messageActionsContent}>
                <View style={[styles.selectedMessagePreview, selectedMessage.fromMe ? styles.mySelectedPreview : styles.theirSelectedPreview]}>
                  <Text allowFontScaling={false} style={styles.selectedMessagePreviewText} numberOfLines={3}>
                    {selectedMessage.text}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.messageActionButton}
                  onPress={() => {
                    handleReplyToMessage(selectedMessage);
                    setShowMessageActions(false);
                    setSelectedMessage(null);
                  }}
                >
                  <Ionicons name="arrow-undo" size={24} color="#007AFF" />
                  <Text allowFontScaling={false} style={styles.messageActionText}>Ответить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.messageActionButton, styles.deleteActionButton]}
                  onPress={() => {
                    setMessages(messages.filter((m) => m.id !== selectedMessage.id));
                    setSelectedMessage(null);
                    setShowMessageActions(false);
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  <Text allowFontScaling={false} style={[styles.messageActionText, styles.deleteActionText]}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Input */}
        <Animated.View style={[styles.inputContainer, { paddingBottom: keyboardHeight }]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity onPress={() => setShowMediaPicker(!showMediaPicker)}>
              <Ionicons name={showMediaPicker ? 'close-circle-outline' : 'add-circle-outline'} size={28} color={isDark ? '#8E8E93' : '#C7C7CC'} />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={replyTo ? 'Введите ответ...' : 'Сообщение'}
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              value={input}
              onChangeText={setInput}
              multiline
              onFocus={() => setShowMediaPicker(false)}
            />
            {input.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={14} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#000' : '#FFF' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: -50 },
    headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? '#3A3A3C' : '#E9E9EB', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    headerAvatarText: { fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#000' },
    headerUserInfo: { flex: 1, maxWidth: 200 },
    headerUserName: { fontSize: 17, fontWeight: '600', color: isDark ? '#fff' : '#000', marginBottom: 2 },
    headerUserStatus: { fontSize: 13, color: isDark ? '#8E8E93' : '#8E8E93' },
    headerBackButton: { paddingLeft: 8, paddingRight: 16, paddingVertical: 8 },
    headerRightContainer: { flexDirection: 'row', alignItems: 'center', paddingRight: 8, gap: 8 },
    headerIconButton: { padding: 8 },
    messagesContainer: { flex: 1 },
    messageContainer: { marginBottom: 8 },
    myMessageContainer: { alignItems: 'flex-end' },
    theirMessageContainer: { alignItems: 'flex-start' },
    messageBubble: { maxWidth: '80%', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18 },
    myMessageBubble: { backgroundColor: isDark ? '#0A84FF' : '#007AFF', borderBottomRightRadius: 4 },
    theirMessageBubble: { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 20, marginBottom: 2 },
    myMessageText: { color: '#fff' },
    theirMessageText: { color: isDark ? '#fff' : '#000' },
    messageMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4 },
    messageTime: { fontSize: 11 },
    myMessageTime: { color: '#fff' },
    theirMessageTime: { color: isDark ? '#8E8E93' : '#8E8E93' },
    replyPreviewContainer: { paddingHorizontal: 12, paddingBottom: 4 },
    replyPreviewContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderRadius: 12, padding: 8 },
    replyPreviewLine: { width: 2, height: '100%', backgroundColor: '#007AFF', marginRight: 6 },
    replyPreviewTextContainer: { flex: 1 },
    replyPreviewAuthor: { fontWeight: '600', color: '#007AFF', fontSize: 13 },
    replyPreviewText: { fontSize: 13, color: isDark ? '#fff' : '#000' },
    mediaPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    mediaPickerContainer: { backgroundColor: isDark ? '#1C1C1E' : '#FFF', paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    mediaPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#3A3A3C' : '#E9E9EB' },
    mediaPickerTitle: { fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#000' },
    mediaOptionsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 },
    mediaOption: { alignItems: 'center' },
    mediaOptionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    mediaOptionText: { fontSize: 12, color: isDark ? '#fff' : '#000' },
    inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 12, backgroundColor: isDark ? '#1C1C1E' : '#FFF', paddingTop: 6, borderTopWidth: 1, borderTopColor: isDark ? '#3A3A3C' : '#E9E9EB' },
    inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    textInput: { flex: 1, fontSize: 16, maxHeight: 120, paddingVertical: 6, color: isDark ? '#fff' : '#000' },
    sendButton: { backgroundColor: '#007AFF', borderRadius: 16, padding: 8, justifyContent: 'center', alignItems: 'center' },
    messageActionsOverlay: { position: 'absolute', left: 0, right: 0, backgroundColor: 'transparent' },
    messageActionsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12 },
    messageActionsContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderRadius: 16, padding: 8, gap: 8 },
    messageActionButton: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
    messageActionText: { fontSize: 12, color: '#007AFF', marginTop: 2 },
    deleteActionButton: {},
    deleteActionText: { color: '#FF3B30' },
    selectedMessagePreview: { maxWidth: SCREEN_WIDTH * 0.4, padding: 6, borderRadius: 12 },
    mySelectedPreview: { backgroundColor: '#007AFF' },
    theirSelectedPreview: { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
    selectedMessagePreviewText: { color: '#fff', fontSize: 14 },
    // Выделенное сообщение
selectedMessageContainer: {
  backgroundColor: isDark ? 'rgba(120,120,128,0.2)' : 'rgba(120,120,128,0.1)',
  borderRadius: 8,
  marginHorizontal: -4,
  paddingHorizontal: 4,
},
selectedMessageBubble: {
  opacity: 0.95,
},

// Превью ответа в сообщении
replyPreviewBubble: {
  flexDirection: 'row',
  marginBottom: 6,
  padding: 6,
  borderRadius: 8,
  overflow: 'hidden',
},
myReplyPreview: {
  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,122,255,0.1)',
},
theirReplyPreview: {
  backgroundColor: isDark ? 'rgba(120,120,128,0.2)' : 'rgba(120,120,128,0.1)',
},

// Линия слева в превью ответа
myReplyPreviewLine: {
  backgroundColor: isDark ? '#64D2FF' : '#007AFF',
},
theirReplyPreviewLine: {
  backgroundColor: isDark ? '#8E8E93' : '#8E8E93',
},

// Текст и автор в превью ответа
myReplyPreviewAuthor: {
  color: isDark ? '#64D2FF' : '#007AFF',
  fontSize: 13,
  fontWeight: '600',
  marginBottom: 2,
},
theirReplyPreviewAuthor: {
  color: isDark ? '#8E8E93' : '#8E8E93',
  fontSize: 13,
  fontWeight: '600',
  marginBottom: 2,
},
myReplyPreviewText: {
  color: isDark ? '#FFFFFF' : '#000000',
  opacity: 0.8,
  fontSize: 13,
},
theirReplyPreviewText: {
  color: isDark ? '#FFFFFF' : '#000000',
  opacity: 0.8,
  fontSize: 13,
},

  });

export default ChatPage;
