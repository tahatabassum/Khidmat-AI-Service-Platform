import { BASE_URL, getChatMessages, sendChatMessage } from './api';

export type ChatMessage = {
  id: number;
  booking_ref: string;
  sender_name: string;
  text: string;
  timestamp: string;
};

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function getWebSocketUrl(bookingRef: string): string {
  const wsBase = BASE_URL.replace(/^http/i, 'ws');
  return `${wsBase}/ws/chat/${encodeURIComponent(bookingRef)}`;
}

export function formatMessageTime(iso: string): string {
  try {
    const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export type ChatConnection = {
  socket: WebSocket;
  disconnect: () => void;
};

export function connectChatWebSocket(
  bookingRef: string,
  onMessage: (msg: ChatMessage) => void,
  onStatusChange: (status: ConnectionStatus) => void,
): ChatConnection {
  const url = getWebSocketUrl(bookingRef);
  onStatusChange('connecting');
  const socket = new WebSocket(url);

  socket.onopen = () => onStatusChange('connected');
  socket.onclose = () => onStatusChange('disconnected');
  socket.onerror = () => onStatusChange('disconnected');
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string) as ChatMessage;
      if (data.booking_ref && data.text) {
        onMessage(data);
      }
    } catch {
      // ignore malformed payloads
    }
  };

  return {
    socket,
    disconnect: () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    },
  };
}

export async function loadChatHistory(bookingRef: string): Promise<ChatMessage[]> {
  return getChatMessages(bookingRef);
}

export async function sendMessage(
  bookingRef: string,
  senderName: string,
  text: string,
  socket?: WebSocket | null,
): Promise<ChatMessage | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ sender_name: senderName, text: trimmed }));
    return null;
  }

  return sendChatMessage(bookingRef, { sender_name: senderName, text: trimmed });
}

export { getChatMessages, sendChatMessage };
