import { StyleProp, ViewStyle } from 'react-native'

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface LeftRightStyle<T> {
  left?: StyleProp<T>
  right?: StyleProp<T>
}

type renderFunction = (x: unknown) => React.ReactNode

export interface User {
  _id: string | number
  name?: string
  avatar?: string | number | renderFunction
}

export interface Reply {
  title: string
  value: string
  messageId?: number | string
}

export interface QuickReplies {
  type: 'radio' | 'checkbox'
  values: Reply[]
  keepIt?: boolean
}

export interface IMessage {
  _id: string | number
  text: string
  createdAt: Date | number
  user: User
  image?: string
  video?: string
  audio?: string
  system?: boolean
  sent?: boolean
  received?: boolean
  pending?: boolean
  quickReplies?: QuickReplies
  location?: {
    latitude: number
    longitude: number
  }
}

export type IChatMessage = IMessage

export interface MessageVideoProps<TMessage extends IMessage> {
  currentMessage: TMessage
  containerStyle?: StyleProp<ViewStyle>
  videoStyle?: StyleProp<ViewStyle>
  videoProps?: object
}

export interface MessageAudioProps<TMessage extends IMessage> {
  currentMessage: TMessage
  containerStyle?: StyleProp<ViewStyle>
  audioStyle?: StyleProp<ViewStyle>
  audioProps?: object
}
export function transformMessagesToChatFormat(
    messages: any[], 
    currentUserId: string
  ): IMessage[] {
    // Если currentUserId не указан, предполагаем что sender_id "782dd693-311a-49a5-b724-c7aade8dfc4e" - это текущий пользователь
    const myUserId = currentUserId;
    
    return messages.map((message, index): IMessage => {
      const isMyMessage = message.sender_id === myUserId;
      
      const user: User = {
        _id: message.sender_id, // ID как число для простоты
        name: isMyMessage ? "Вы" : message.sender_name,
        // Если есть аватар, можно добавить
        ...(message.sender_avatar && { avatar: message.sender_avatar })
      };
      
      // Преобразуем дату
      const createdAt = new Date(message.created_at);
      
      // Определяем статусы отправки/получения на основе is_read
      const sent = true; // Предполагаем, что все сообщения отправлены
      const received = message.is_read;
      const pending = false; // Предполагаем, что нет ожидающих отправки
      
      // Проверяем, является ли сообщение системным (например, уведомление о входе)
      const system = false; // В ваших данных нет системных сообщений
      
      return {
        _id: message.id || String(index + 1),
        text: message.content,
        createdAt,
        user,
        sent,
        received,
        pending,
        system,
        // Дополнительные поля можно добавить при необходимости:
        // image: message.image_url,
        // video: message.video_url,
        // audio: message.audio_url,
        // quickReplies: message.quick_replies,
        // location: message.location,
      };
    });
  }