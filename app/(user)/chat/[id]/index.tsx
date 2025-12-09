// // app/messages/chat/[id].tsx
// import { MediaPicker, ReplyPreview } from '@/components/Chat/ChatComponents';
// import { getStyles } from '@/components/Chat/getStyles';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useLocalSearchParams, useNavigation } from 'expo-router';
// import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
// import { api } from '@/utils/api';
// import {
//   Animated,
//     Dimensions,
//     Keyboard,
//     Platform,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     TouchableWithoutFeedback,
//     useColorScheme,
//     View
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { GiftedChat, Bubble, InputToolbar, Send, IMessage, Day } from 'react-native-gifted-chat';
// import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
// import { transformMessagesToChatFormat } from '@/types/giftedChat';
// import { Storage } from '@/utils/storage';

// interface ReplyToMessage {
//   id: string;
//   text: string;
//   fromMe: boolean;
// }
// interface Message {
//   id: string;
//   conversation_id: string;
//   sender_id: string;
//   content: string;
//   is_read: boolean;
//   created_at: string;
//   sender_name: string;
//   sender_avatar?: string;
// }

// interface ConversationDetails {
//   id: string;
//   task_id: string;
//   task_title: string;
//   poster_id: string;
//   tasker_id: string;
//   other_user_id: string;
//   other_user_name: string;
//   other_user_avatar?: string;
//   status: string;
// }

// interface MessagesResponse {
//   success: boolean;
//   data: Message[];
// }

// interface ConversationResponse {
//   success: boolean;
//   data: ConversationDetails;
// }

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const ChatPage = () => {
//   const { id } = useLocalSearchParams();
//   const navigation = useNavigation();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const insetBottom = useSafeAreaInsets().bottom;
//   const styles = getStyles(isDark, SCREEN_WIDTH, insetBottom);
//   // const keyboardHeight = useRef(new Animated.Value(0));
//   const [showMediaPicker, setShowMediaPicker] = useState(false);
//   const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);

//   const [messagess, setMessagess] = useState<Message[]>([]);
//   const [conversation, setConversation] = useState<ConversationDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [currentUserId, setCurrentUserId] = useState<string>("");

//   const [messages, setMessages] = useState<IMessage[]>([
//     {
//       _id: '1',
//       text: 'Добрый день! Могу приехать завтра в 10:00. Вам удобно?',
//       createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
//       user: {
//         _id: 2,
//         name: 'Дмитрий Иванов',
//       },
//     },
//     {
//       _id: '2',
//       text: 'Да, отлично! Буду ждать. Все инструменты с собой?',
//       createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
//       user: {
//         _id: 1,
//         name: 'Вы',
//       },
//     },
//     {
//       _id: '3',
//       text: 'Да, все необходимые инструменты будут. Также возьму шуруповерт и уровень.',
//       createdAt: new Date(),
//       user: {
//         _id: 2,
//         name: 'Дмитрий Иванов',
//       },
//     },
//   ]);

//   const keyboardHeight = useKeyboardHeight();
  
  

//   const fetchConversation = async () => {
//     try {
//       const response = await api.request(`/chat/conversations/${id}`);
//       if (response.ok) {
//         const data: ConversationResponse = await response.json();
//         if (data.success) {
//           setConversation(data.data);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching conversation:", err);
//     }
//   };
//   const getCurrentUserId = async () => {
//     try {
//       const token = await Storage.getToken('accessToken');
//       if (token) {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         setCurrentUserId(payload.userId || payload.id);
//       }
//     } catch (e) {
//       console.error("Error getting user ID:", e);
//     }
//   };
//   // Загрузить сообщения
//   const fetchMessages = async () => {
//     try {
//       setError(null);
//       const response = await api.request(`/chat/conversations/${id}/messages`);
      
//       if (response.ok) {
//         const data: MessagesResponse = await response.json();
//         if (data.success) {
//           const formatMessages = transformMessagesToChatFormat(data.data, currentUserId)
//           setMessages(formatMessages) 
//         }
//       } else {
//         throw new Error(`Ошибка загрузки: ${response.status}`);
//       }
//     } catch (err: any) {
//       console.error("Error fetching messages:", err);
//       if (err.message !== 'Требуется авторизация') {
//         setError(err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Отметить как прочитанные
//   const markAsRead = async () => {
//     try {
//       await api.request(`/chat/conversations/${id}/read`, {
//         method: "POST"
//       });
//     } catch (err) {
//       console.error("Error marking as read:", err);
//     }
//   };
//   useEffect(() => {
//     if (id) {
//       getCurrentUserId()
//       fetchConversation();
//       fetchMessages();
//       markAsRead();
      
//       // Периодически обновлять сообщения
//       const interval = setInterval(() => {
//         fetchMessages();
//       }, 5000);
      
//       return () => clearInterval(interval);
//     }
//   }, [id]);
//   // Обработка медиа пикера
//   useEffect(() => {
//     if (showMediaPicker) {
//       Keyboard.dismiss();
//     }
//   }, [showMediaPicker]);

//   // Настройка хедера
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerShown: true,
  //     headerTitle: () => (
  //       <View style={styles.headerTitleContainer}>
  //         <View style={styles.headerAvatar}>
  //           <Text allowFontScaling={false} style={styles.headerAvatarText}>Д</Text>
  //         </View>
  //         <View style={styles.headerUserInfo}>
  //           <Text allowFontScaling={false} style={styles.headerUserName} numberOfLines={1}>
  //           {/* userId  conversation?.other_user_id */}
  //             {conversation?.other_user_name}
  //           </Text>
  //           <Text allowFontScaling={false} style={styles.headerUserStatus}>был(а) недавно</Text>
  //         </View>
  //       </View>
  //     ),
  //     headerLeft: () => (
  //       <TouchableOpacity 
  //         style={styles.headerBackButton}
  //         onPress={() => router.back()}
  //       >
  //         <Ionicons 
  //           name="chevron-back" 
  //           size={24} 
  //           color={isDark ? '#fff' : '#007AFF'} 
  //         />
  //       </TouchableOpacity>
  //     ),
  //     headerRight: () => (
  //       <View style={styles.headerRightContainer}>
  //         <TouchableOpacity style={styles.headerIconButton}>
  //           <Ionicons 
  //             name="videocam-outline" 
  //             size={24} 
  //             color={isDark ? '#fff' : '#007AFF'} 
  //           />
  //         </TouchableOpacity>
  //         <TouchableOpacity style={styles.headerIconButton}>
  //           <Ionicons 
  //             name="call-outline" 
  //             size={22} 
  //             color={isDark ? '#fff' : '#007AFF'} 
  //           />
  //         </TouchableOpacity>
  //       </View>
  //     ),
  //     headerStyle: {
  //       backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
  //       shadowColor: 'transparent',
  //       elevation: 0,
  //     },
  //     headerTitleAlign: 'center',
  //     headerBackTitleVisible: false,
  //   });
  // }, [navigation,conversation, isDark]);

//   const onReply = (context: any, message: IMessage) => {
//     setReplyTo(message);
//     // Фокусировка на инпуте
//     // giftedChatRef.current?.focus();
//   };

//   // Отправка сообщения
//   const onSend = useCallback((messages = []) => {
//     const messagesWithReply = messages.map(msg => ({
//       ...msg,
//       replyTo: replyTo ? {
//         _id: replyTo._id,
//         text: replyTo.text,
//         user: replyTo.user
//       } : null
//     }));
    
//     setMessages(previousMessages => 
//       GiftedChat.append(previousMessages, messagesWithReply)
//     );
    
//     setReplyTo(null); // очистить после отправки
//   }, [replyTo]);

//   const handleSelectMedia = (type: 'photo' | 'camera' | 'document' | 'location') => {
//     setShowMediaPicker(false);
//     console.log(`Выбран тип: ${type}`);
//   };

//   // Кастомный InputToolbar - УПРОЩЕННАЯ ВЕРСИЯ
  // const renderInputToolbar = (props: any) => {
  //   return (
  //     <View>
  //       {replyTo && (
  //         <View style={styles.replyPreview}>
  //           <Text>Ответ на: {replyTo.text}</Text>
  //           <Button onPress={() => setReplyTo(null)} title="×" />
  //         </View>
  //       )}
  //       <InputToolbar
  //         {...props}
  //         containerStyle={{
  //           backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
  //           borderTopWidth: 1,
  //           borderTopColor: isDark ? '#38383A' : '#E5E5EA',
  //           // paddingBottom: Platform.OS === 'ios' ? insetBottom : 8,
  //         }}
  //         primaryStyle={{
  //           flexDirection: 'row',
  //           alignItems: 'flex-end',
  //           paddingHorizontal: 12,
  //           paddingVertical: 8,
  //         }}
  //       />
  //     </View>

  //   );
  // };

//   // Кастомная кнопка отправки
//   const renderSend = (props: any) => {
//     if (props.text && props.text.trim().length > 0) {
//       return (
//         <Send {...props} containerStyle={giftedStyles.sendButtonContainer}>
//           <View style={giftedStyles.sendButton}>
//             <Ionicons name="send" size={14} color="#FFFFFF" />
//           </View>
//         </Send>
//       );
//     }
//     return (
//       <View style={giftedStyles.mediaButtonsContainer}>
//         <TouchableOpacity 
//           style={giftedStyles.mediaButton}
//           onPress={() => handleSelectMedia('camera')}
//         >
//           <Ionicons 
//             name="camera-outline" 
//             size={22} 
//             color={isDark ? '#8E8E93' : '#C7C7CC'} 
//           />
//         </TouchableOpacity>
//         <TouchableOpacity style={giftedStyles.mediaButton}>
//           <Ionicons 
//             name="mic-outline" 
//             size={22} 
//             color={isDark ? '#8E8E93' : '#C7C7CC'} 
//           />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // Кастомный Bubble (пузырь сообщения)
//   const renderBubble = (props: any) => {
//     if (props.currentMessage.replyTo) {
//       return (
//         <View>
//           {/* Превью ответа в сообщении */}
//           <Text style={styles.replyText}>
//             Ответ на: {props.currentMessage.replyTo.text}
//           </Text>
//           <Bubble
//         {...props}
//         wrapperStyle={{
//           left: {
//             backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
//             borderRadius: 18,
//             borderBottomLeftRadius: 4,
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//             marginVertical: 2,
//           },
//           right: {
//             backgroundColor: '#007AFF',
//             borderRadius: 18,
//             borderBottomRightRadius: 4,
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//             marginVertical: 2,
//           },
//         }}
//         textStyle={{
//           left: {
//             color: isDark ? '#FFFFFF' : '#000000',
//             fontSize: 16,
//             lineHeight: 20,
//           },
//           right: {
//             color: '#FFFFFF',
//             fontSize: 16,
//             lineHeight: 20,
//           },
//         }}
//         timeTextStyle={{
//           left: {
//             color: isDark ? '#8E8E93' : '#8E8E93',
//             fontSize: 11,
//           },
//           right: {
//             color: 'rgba(255, 255, 255, 0.7)',
//             fontSize: 11,
//           },
//         }}
//       />
//         </View>
//       );
//     }
//     return (
//       <Bubble
//         {...props}
//         wrapperStyle={{
//           left: {
//             backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
//             borderRadius: 18,
//             borderBottomLeftRadius: 4,
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//             marginVertical: 2,
//           },
//           right: {
//             backgroundColor: '#007AFF',
//             borderRadius: 18,
//             borderBottomRightRadius: 4,
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//             marginVertical: 2,
//           },
//         }}
//         textStyle={{
//           left: {
//             color: isDark ? '#FFFFFF' : '#000000',
//             fontSize: 16,
//             lineHeight: 20,
//           },
//           right: {
//             color: '#FFFFFF',
//             fontSize: 16,
//             lineHeight: 20,
//           },
//         }}
//         timeTextStyle={{
//           left: {
//             color: isDark ? '#8E8E93' : '#8E8E93',
//             fontSize: 11,
//           },
//           right: {
//             color: 'rgba(255, 255, 255, 0.7)',
//             fontSize: 11,
//           },
//         }}
//       />
//     );
//   };

//   // Кастомный Day (отображение даты)
//   const renderDay = (props: any) => {
//     return (
//       <Day
//         {...props}
//         textStyle={{
//           color: isDark ? '#8E8E93' : '#8E8E93',
//           fontSize: 13,
//           fontWeight: '500',
//         }}
//       />
//     );
//   };

//   // Кастомный компонент для attach button
//   const renderActions = (props: any) => {
//     return (
//       <TouchableOpacity 
//         style={giftedStyles.attachButton}
//         onPress={() => setShowMediaPicker(!showMediaPicker)}
//       >
//         <Ionicons 
//           name={showMediaPicker ? "close-circle-outline" : "add-circle-outline"} 
//           size={28} 
//           color={showMediaPicker ? '#007AFF' : (isDark ? '#8E8E93' : '#C7C7CC')} 
//         />
//       </TouchableOpacity>
//     );
//   };

//   // Компонент для верхней карточки задачи
  // const renderTaskCard = () => (
  //   <TouchableOpacity style={styles.taskCard} onPress={()=>router.push(`/(user)/task/${conversation?.task_id}`)}>
  //     <View style={styles.taskHeader}>
  //       <Text allowFontScaling={false} style={styles.taskTitle} numberOfLines={1}>
  //         {conversation?.task_title}
  //       </Text>
  //       <Text allowFontScaling={false} style={styles.taskPrice}>₽5 000</Text>
  //     </View>
  //     <Text allowFontScaling={false} style={styles.taskDescription} numberOfLines={2}>
  //       Замена смесителя, прочистка канализационных труб
  //     </Text>
  //   </TouchableOpacity>
  // );
//   const  keyboardTopToolbarHeight  =  Platform . select ( {  ios : 44 ,  default : 0  } ) 
//   useEffect(()=>{
//     console.log(keyboardHeight)
//   },[keyboardHeight])
//   const  keyboardVerticalOffset  =  insetBottom   +  keyboardTopToolbarHeight + 110 //keyboardHeight1
//   return (
//     <View style={styles.container}>
//       {/* Карточка задачи */}
//       {renderTaskCard()}

//       {/* GiftedChat компонент - ОСНОВНОЙ КОНТЕЙНЕР */}
//       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{
//           _id: currentUserId,
//         }}
//         // onLongPress={onReply}
//         isInverted={false}
//         renderAvatar={null}
//         renderUsernameOnMessage={false}
//         renderBubble={renderBubble}
//         renderInputToolbar={renderInputToolbar}
//         renderSend={renderSend}
//         renderDay={renderDay}
//         renderActions={renderActions}
//         alwaysShowSend
//         scrollToBottom
//         scrollToBottomComponent={() => null}
//         keyboardShouldPersistTaps="handled"
//         // keyboardAvoidingViewProps={}
//         // Важные пропсы для корректной работы с клавиатурой
//         isKeyboardInternallyHandled={true}
//         bottomOffset={Platform.OS === 'ios' ? insetBottom : 0}
//         minComposerHeight={Platform.OS === 'ios' ? 36 : 40}
//         minInputToolbarHeight={Platform.OS === 'ios' ? 52 : 60}
//         keyboardAvoidingViewProps = { { keyboardVerticalOffset } } 
//         listViewProps={{
//           style: {
//             backgroundColor: isDark ? '#000000' : '#FFFFFF',
//             flex: 1,
//           },
//           contentContainerStyle: {
//             paddingBottom: 20,
//           },
//           showsVerticalScrollIndicator: false,
//         }}
        
//         textInputProps={{
//           style: {
//             backgroundColor: isDark ? '#3A3A3C' : '#F2F2F7',
//             borderRadius: 18,
//             paddingHorizontal: 16,
//             paddingVertical: Platform.OS === 'ios' ? 8 : 10,
//             fontSize: 16,
//             color: isDark ? '#FFFFFF' : '#000000',
//             maxHeight: 100,
//             flex: 1,
//           },
//           placeholderTextColor: isDark ? '#8E8E93' : '#C7C7CC',
//           placeholder: replyTo ? "Введите ответ..." : "Сообщение",
//         }}
        
//         composerHeight={Platform.OS === 'ios' ? 36 : 40}
//       />

//       {/* Media Picker */}
//       <MediaPicker
//         isVisible={showMediaPicker}
//         onClose={() => setShowMediaPicker(false)}
//         onSelectMedia={handleSelectMedia}
//         isDark={isDark}
//       />

//       {/* Preview ответа на сообщение */}
//       <ReplyPreview
//         replyTo={replyTo}
//         onCancel={() => setReplyTo(null)}
//         isDark={isDark}
//       />
//     </View>
//   );
// };

// export default ChatPage;

// // Стили для GiftedChat компонентов
const giftedStyles = StyleSheet.create({
  sendButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: Platform.OS === 'ios' ? 4 : 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: Platform.OS === 'ios' ? 4 : 6,
  },
  mediaButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: Platform.OS === 'ios' ? 4 : 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical:100,
    backgroundColor: 'transparent',
    transform: [{ scaleY: -1 }],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { SafeAreaView,StyleSheet,  View, Text, Button, ActivityIndicator, useColorScheme, Platform, TouchableOpacity, Dimensions } from "react-native";
import { GiftedChat, Bubble, Day, InputToolbar, Send } from "react-native-gifted-chat";
import { api } from "@/utils/api";
import {Storage} from "@/utils/storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import SwipeableMessage from "@/components/Chat/GiftedSwipeableMessage";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "@/components/Chat/getStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { MessageCircle } from "lucide-react-native";
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const colorScheme = useColorScheme()
  const navigation = useNavigation();
  const isDark = colorScheme === 'dark';
  const insetBottom = useSafeAreaInsets().bottom;

  const styles = getStyles(isDark, SCREEN_WIDTH, insetBottom);

  const headerHeight = useHeaderHeight();
  useLayoutEffect(() => {
    // console.log('Header height:', headerHeight);
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerAvatar}>
            <Text allowFontScaling={false} style={styles.headerAvatarText}>Д</Text>
          </View>
          <View style={styles.headerUserInfo}>
            <Text allowFontScaling={false} style={styles.headerUserName} numberOfLines={1}>
            {/* userId  conversation?.other_user_id */}
              {conversation?.other_user_name}
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
  }, [navigation,conversation, isDark]);
 
  // ---- 1) Получить текущего юзера ----
  const getCurrentUserId = async () => {
    try {
      const token = await Storage.getToken("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.userId || payload.id);
      }
    } catch (e) {
      console.error("Error getting user ID:", e);
    }
  };

  // ---- 2) Получить инфу о диалоге ----
  const fetchConversation = async () => {
    try {
      const response = await api.request(`/chat/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) setConversation(data.data);
      }
    } catch (err) {
      console.error("Error fetching conversation:", err);
    }
  };

  // ---- 3) Преобразовать сообщения под GiftedChat ----
  const transformMessagesToChatFormat = (msgs, userId) => {
    return msgs
      .map((m) => ({
        _id: m.id,
        text: m.content,
        createdAt: new Date(m.created_at),
        user: {
          _id: m.sender_id,
          name: m.sender_name,
          avatar: m.sender_avatar || undefined,
        },
      }))
      .sort((a, b) => b.createdAt - a.createdAt); // GiftedChat любит сортировку по убыванию
  };

  // ---- 4) Загрузить сообщения ----
  const fetchMessages = async () => {
    try {
      const response = await api.request(`/chat/conversations/${id}/messages`);

      if (!response.ok) throw new Error(response.status);

      const json = await response.json();
      if (json.success) {
        const formatted = transformMessagesToChatFormat(json.data, currentUserId);
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- 5) Отметить как прочитанные ----
  const markAsRead = async () => {
    try {
      await api.request(`/chat/conversations/${id}/read`, { method: "POST" });
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  // ---- 6) Отправка сообщения ----
  const onSend = useCallback(
    async (newMessages = []) => {
      const msg = newMessages[0];

      // локально добавляем сразу (мгновенный UI)
      setMessages((prev) => GiftedChat.append(prev, newMessages));

      try {
        await api.request(`/chat/conversations/${id}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: msg.text,
          }),
        });
      } catch (err) {
        console.error("Error sending:", err);
      }
    },
    [id]
  );
  const handleReply = (msg) => {
    // setReplyTo
    // console.log({
    //   id: msg?._id,
    //   text: msg?.text,
    //   fromMe: msg?.user._id === currentUserId,
    // });
    console.log(msg)
  };
  // ---- INIT ----
  useEffect(() => {
    (async () => {
      await getCurrentUserId();
    })();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchConversation();
    fetchMessages();
    markAsRead();
  }, [currentUserId]);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#2D79FF", // синий как на скрине
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 12,
        },
        left: {
          backgroundColor: "#2A2A2A",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 12,
        },
      }}
      textStyle={{
        right: { color: "white" },
        left: { color: "white" },
      }}
    />
  );

  // ---- Кастомизация блока даты ----
  const renderDay = (props) => (
    <Day
      {...props}
      textStyle={{
        color: "#a1a1a1",
        backgroundColor: "#000",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
      }}
    />
  );
    const renderInputToolbar = (props: any) => {
    return (
      <View>
        {replyTo && (
          <View style={styles.replyPreview}>
            <Text>Ответ на: {replyTo.text}</Text>
            <Button onPress={() => setReplyTo(null)} title="×" />
          </View>
        )}
        <InputToolbar
          {...props}
          containerStyle={{
            // backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',

            borderRadius:50,
            width:'95%',
            alignSelf: 'center',
          }}
          primaryStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        />
      </View>

    );
  };
    const renderSend = (props: any) => {
    if (props.text && props.text.trim().length > 0) {
      return (
        <Send {...props} containerStyle={giftedStyles.sendButtonContainer}>
          <View style={giftedStyles.sendButton}>
            <Ionicons name="send" size={14} color="#FFFFFF" />
          </View>
        </Send>
      );
    }
    return (
      <View style={giftedStyles.mediaButtonsContainer}>
        <TouchableOpacity 
          style={giftedStyles.mediaButton}
          onPress={() => console.log('camera')}
        >
          <Ionicons 
            name="camera-outline" 
            size={22} 
            color={isDark ? '#8E8E93' : '#C7C7CC'} 
          />
        </TouchableOpacity>
        {/* <TouchableOpacity style={giftedStyles.mediaButton}>
          <Ionicons 
            name="mic-outline" 
            size={22} 
            color={isDark ? '#8E8E93' : '#C7C7CC'} 
          />
        </TouchableOpacity> */}
      </View>
    );
  };
    const renderActions = (props: any) => {
    return (
      <TouchableOpacity 
        style={giftedStyles.attachButton}
        onPress={() => console.log('!showMediaPicker')}
      >
        <Ionicons 
          name={!'showMediaPicker' ? "close-circle-outline" : "add-circle-outline"} 
          size={28} 
          color={!'showMediaPicker' ? '#007AFF' : (isDark ? '#8E8E93' : '#C7C7CC')} 
        />
      </TouchableOpacity>
    );
  };

  const emptyChatScreen = () => {
    return (
      <View style={giftedStyles.emptyContainer}>
        <MessageCircle size={64} color={isDark ? '#4b5563' : '#d1d5db'} />
        <Text style={[giftedStyles.emptyTitle, { color: isDark ? '#fff' : '#000' }]}>
          Начните диалог
        </Text>
        <Text style={[giftedStyles.emptySubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          Напишите первое сообщение, чтобы начать общение
        </Text>
      </View>
    );
  };

  const renderTaskCard = () => (
    <TouchableOpacity style={styles.taskCard} onPress={()=>router.push(`/(user)/task/${conversation?.task_id}`)}>
      <View style={styles.taskHeader}>
        <Text allowFontScaling={false} style={styles.taskTitle} numberOfLines={1}>
          {conversation?.task_title}
        </Text>
        <Text allowFontScaling={false} style={styles.taskPrice}>₽5 000</Text>
      </View>
      <Text allowFontScaling={false} style={styles.taskDescription} numberOfLines={2}>
        Замена смесителя, прочистка канализационных труб
      </Text>
    </TouchableOpacity>
  );
  // ---- UI ----
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  
  const keyboardVerticalOffset = headerHeight + 10 + 68 + 24
  return (
    <SafeAreaView style={{flex:1}}>
      {/* <ChatHeader/> */}
      {/* <View style={{height:100}}/> */}
      {renderTaskCard()}
      <GiftedChat
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
        messages={messages}
        onSend={onSend}
        user={{ _id: currentUserId }}
        renderBubble={renderBubble}
        renderDay={renderDay}
        renderSend={renderSend}
        renderActions={renderActions}
        renderInputToolbar={renderInputToolbar}
        alwaysShowSend
        placeholder="Сообщение"
        onLongPressMessage={handleReply}
        isTyping={false}
        renderChatEmpty={emptyChatScreen}
        isInverted={!!messages.length}
      //   shouldUpdateMessage={() => false}
      // keyboardShouldPersistTaps="handled"
      // extraData={{ shouldNotUpdate: true }}
        // bottomOffset={Platform.OS === 'ios' ? insetBottom : 0}
        messagesContainerStyle={{
          flex: 1,
          backgroundColor: isDark ? '#000' : '#fff',
        }}
        listViewProps={{
          style: {
            flex: 1,
            backgroundColor: isDark ? '#000' : '#fff',
          },
          contentContainerStyle: {
            flexGrow: 1,
            backgroundColor: isDark ? '#000' : '#fff',
          },
        }}
        textInputProps={{
            style: {
              // backgroundColor: isDark ? '#3A3A3C' : '#F2F2F7',
              borderRadius: 18,
              paddingHorizontal: 16,
              // paddingVertical: Platform.OS === 'ios' ? 8 : 10,
              fontSize: 16,
              color: isDark ? '#FFFFFF' : '#000000',
              // maxHeight: 100,
              flex: 1,
            },
            placeholderTextColor: isDark ? '#8E8E93' : '#C7C7CC',
            placeholder: replyTo ? "Введите ответ..." : "Сообщение",
          }}

      />

    </SafeAreaView>

    //       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{
//           _id: currentUserId,
//         }}
//         // onLongPress={onReply}
//         isInverted={false}
//         renderAvatar={null}
//         renderUsernameOnMessage={false}
//         renderBubble={renderBubble}
//         renderInputToolbar={renderInputToolbar}
//         renderSend={renderSend}
//         renderDay={renderDay}
//         renderActions={renderActions}
//         alwaysShowSend
//         scrollToBottom
//         scrollToBottomComponent={() => null}
//         keyboardShouldPersistTaps="handled"
//         // keyboardAvoidingViewProps={}
//         // Важные пропсы для корректной работы с клавиатурой
//         isKeyboardInternallyHandled={true}
//         bottomOffset={Platform.OS === 'ios' ? insetBottom : 0}
//         minComposerHeight={Platform.OS === 'ios' ? 36 : 40}
//         minInputToolbarHeight={Platform.OS === 'ios' ? 52 : 60}
//         keyboardAvoidingViewProps = { { keyboardVerticalOffset } } 
//         listViewProps={{
//           style: {
//             backgroundColor: isDark ? '#000000' : '#FFFFFF',
//             flex: 1,
//           },
//           contentContainerStyle: {
//             paddingBottom: 20,
//           },
//           showsVerticalScrollIndicator: false,
//         }}
        
//         textInputProps={{
//           style: {
//             backgroundColor: isDark ? '#3A3A3C' : '#F2F2F7',
//             borderRadius: 18,
//             paddingHorizontal: 16,
//             paddingVertical: Platform.OS === 'ios' ? 8 : 10,
//             fontSize: 16,
//             color: isDark ? '#FFFFFF' : '#000000',
//             maxHeight: 100,
//             flex: 1,
//           },
//           placeholderTextColor: isDark ? '#8E8E93' : '#C7C7CC',
//           placeholder: replyTo ? "Введите ответ..." : "Сообщение",
//         }}
        
//         composerHeight={Platform.OS === 'ios' ? 36 : 40}
//       />
  );
}
