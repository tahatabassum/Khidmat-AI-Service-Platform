import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, UserData } from '../../App';
import { useTheme } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import {
  ChatMessage,
  ConnectionStatus,
  connectChatWebSocket,
  formatMessageTime,
  loadChatHistory,
  sendMessage,
} from '../services/chatService';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Props {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
  user: UserData;
}

type UiMessage = ChatMessage & { isMe: boolean; timeLabel: string };

export default function ChatScreen({ navigation, route, user }: Props) {
  const { providerName, bookingRef } = route.params;
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const disconnectRef = useRef<(() => void) | null>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [loadError, setLoadError] = useState<string | null>(null);

  const toUiMessage = useCallback(
    (msg: ChatMessage): UiMessage => ({
      ...msg,
      isMe: msg.sender_name === user.name,
      timeLabel: formatMessageTime(msg.timestamp),
    }),
    [user.name],
  );

  const appendMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, toUiMessage(msg)];
      });
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [toUiMessage],
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const history = await loadChatHistory(bookingRef);
      setMessages(history.map(toUiMessage));
    } catch {
      setLoadError('Could not load messages. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [bookingRef, toUiMessage]);

  const connectWs = useCallback(() => {
    disconnectRef.current?.();
    const { socket, disconnect } = connectChatWebSocket(
      bookingRef,
      appendMessage,
      setConnectionStatus,
    );
    socketRef.current = socket;
    disconnectRef.current = disconnect;
  }, [bookingRef, appendMessage]);

  useEffect(() => {
    fetchHistory();
    connectWs();
    return () => {
      disconnectRef.current?.();
      socketRef.current = null;
    };
  }, [fetchHistory, connectWs]);

  const handleRetry = () => {
    fetchHistory();
    connectWs();
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setMessage('');
    try {
      const saved = await sendMessage(bookingRef, user.name, trimmed, socketRef.current);
      if (saved) {
        appendMessage(saved);
      }
    } catch {
      setMessage(trimmed);
      setLoadError('Failed to send message. Tap retry or try again.');
    } finally {
      setSending(false);
    }
  };

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Connected'
      : connectionStatus === 'connecting'
        ? 'Connecting…'
        : 'Offline — messages via REST';

  const statusColor =
    connectionStatus === 'connected' ? '#4CAF50' : connectionStatus === 'connecting' ? colors.tertiary : colors.outline;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={20} color={colors.onPrimary} />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle} numberOfLines={1}>{providerName}</Text>
            <Text style={[styles.onlineStatus, { color: statusColor }]}>{statusLabel}</Text>
            <Text style={styles.refSubtitle}>{bookingRef}</Text>
          </View>
        </View>
      </View>

      {loadError ? (
        <TouchableOpacity style={styles.errorBanner} onPress={handleRetry}>
          <MaterialIcons name="wifi-off" size={18} color={colors.error} />
          <Text style={styles.errorText}>{loadError}</Text>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      ) : null}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 24}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <Text style={styles.emptyHint}>No messages yet. Say hello to your provider.</Text>
            ) : (
              messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[styles.messageWrapper, msg.isMe ? styles.messageWrapperRight : styles.messageWrapperLeft]}
                >
                  {!msg.isMe && <Text style={styles.senderName}>{msg.sender_name}</Text>}
                  <View style={[styles.messageBubble, msg.isMe ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
                    <Text style={[styles.messageText, msg.isMe ? styles.messageTextRight : styles.messageTextLeft]}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>{msg.timeLabel}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.outline}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!message.trim() || sending || loading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || sending || loading}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <MaterialIcons name="send" size={20} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 60,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
      backgroundColor: colors.surface,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    backBtn: { marginRight: 8 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextBlock: { marginLeft: 12, flex: 1 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
    onlineStatus: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    refSubtitle: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 1 },

    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.errorContainer,
    },
    errorText: { flex: 1, fontSize: 13, color: colors.onErrorContainer },
    retryText: { fontSize: 13, fontWeight: '700', color: colors.error },

    chatContainer: { flex: 1 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    messagesList: { flex: 1, backgroundColor: isDark ? colors.background : '#F5F7FA' },
    messagesContent: { padding: 16, flexGrow: 1 },
    emptyHint: { textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 40, fontSize: 14 },

    messageWrapper: { marginBottom: 16, maxWidth: '80%' },
    messageWrapperLeft: { alignSelf: 'flex-start' },
    messageWrapperRight: { alignSelf: 'flex-end' },
    senderName: { fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 4, marginLeft: 8 },

    messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    messageBubbleLeft: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    messageBubbleRight: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },

    messageText: { fontSize: 15, lineHeight: 22 },
    messageTextLeft: { color: colors.onSurface },
    messageTextRight: { color: colors.onPrimary },

    messageTime: { fontSize: 11, color: colors.outline, marginTop: 4, marginHorizontal: 8, alignSelf: 'flex-end' },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      maxHeight: 100,
      fontSize: 15,
      color: colors.onSurface,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      marginRight: 8,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.5 },
  });
