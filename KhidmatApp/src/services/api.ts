import axios from 'axios';
import { Platform } from 'react-native';

// Use local network IP so phone on same WiFi can reach backend
// Change this to your PC's IP if it changes
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.89:8000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 120000, // 120s to allow multiple AI agent calls to complete (each ~10-25s)
});

export const getStats = async () => {
    const res = await api.get('/stats');
    return res.data;
};

export const orchestrateRequest = async (userMessage: string, userName: string = "User", userPhone: string = "03000000000", imageBase64?: string) => {
    const res = await api.post('/agents/orchestrate', {
        user_message: userMessage,
        user_name: userName,
        user_phone: userPhone,
        ...(imageBase64 ? { image_base64: imageBase64 } : {})
    });
    return res.data;
};

export const createBooking = async (payload: any) => {
    const res = await api.post('/bookings/', payload);
    return res.data;
};

export const getUserBookings = async (phone: string) => {
    const res = await api.get(`/bookings/user/${phone}`);
    return res.data;
};

export const completeBooking = async (ref: string) => {
    const res = await api.post(`/bookings/${ref}/complete`);
    return res.data;
};

export const rateBooking = async (ref: string, ratingData: { user_rating?: number, provider_rating?: number }) => {
    const res = await api.post(`/bookings/${ref}/rate`, ratingData);
    return res.data;
};

export const createDispute = async (payload: any) => {
    const res = await api.post('/disputes/', payload);
    return res.data;
};

export const getTrace = async (bookingRef: string) => {
    const res = await api.get(`/traces/${bookingRef}`);
    return res.data;
};

export const getChatMessages = async (bookingRef: string) => {
    const res = await api.get(`/chat/${encodeURIComponent(bookingRef)}`);
    return res.data;
};

export const sendChatMessage = async (
    bookingRef: string,
    payload: { sender_name: string; text: string },
) => {
    const res = await api.post(`/chat/${encodeURIComponent(bookingRef)}`, payload);
    return res.data;
};

/** WebSocket base URL derived from API host (http → ws). */
export const getWebSocketBaseUrl = (): string => BASE_URL.replace(/^http/i, 'ws');

export const registerProvider = async (payload: {
    name: string;
    phone: string;
    service_type: string;
    area: string;
    city: string;
    experience_years: number;
    price_per_hour: number;
    skill_level: string;
}) => {
    const res = await api.post('/providers/register', payload);
    return res.data;
};

export const signup = async (name: string, phone: string, email: string, password: string, city: string) => {
    const res = await api.post('/auth/signup', { name, phone: phone || undefined, email: email || undefined, password, city });
    return res.data;
};

export const login = async (identifier: string, password: string, method: 'phone' | 'email') => {
    const payload = method === 'phone' ? { phone: identifier, password } : { email: identifier, password };
    const res = await api.post('/auth/login', payload);
    return res.data;
};

export default api;
