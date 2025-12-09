import {Platform, StyleSheet} from "react-native"
export const getStyles = (isDark: boolean, SCREEN_WIDTH:number, insetBottom?:number) => StyleSheet.create({
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
      height:68
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