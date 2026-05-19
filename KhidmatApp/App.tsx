import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/constants/colors';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import BookingScreen from './src/screens/BookingScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import AgentTraceScreen from './src/screens/AgentTraceScreen';
import DisputeScreen from './src/screens/DisputeScreen';
import ProviderRegisterScreen from './src/screens/ProviderRegisterScreen';
import ProviderDashboardScreen from './src/screens/ProviderDashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ChatScreen from './src/screens/ChatScreen';

export type RootStackParamList = {
  Home: undefined;
  Results: { userMessage: string, imageBase64?: string };
  Booking: { providerId: number, slot: string, quotedPrice: number };
  Confirmation: { bookingRef: string, providerName: string, serviceType: string, slot: string };
  MyBookings: undefined;
  AgentTrace: { traceData: any[] };
  Dispute: { bookingRef: string };
  ProviderRegister: undefined;
  ProviderDashboard: undefined;
  Profile: undefined;
  Notifications: undefined;
  Chat: { providerName: string, bookingRef: string };
};

export type UserData = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  isProvider?: boolean;
};

const Stack = createStackNavigator<RootStackParamList>();

const USER_STORAGE_KEY = '@khidmat_user';

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  // Check stored session on mount
  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then(data => {
      if (data) {
        try { setUser(JSON.parse(data)); } catch {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAuth = async (userData: any) => {
    const u: UserData = { id: userData.id, name: userData.name, phone: userData.phone || '', email: userData.email || '', city: userData.city, isProvider: userData.isProvider || false };
    setUser(u);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  };

  const handleUpdateUser = async (updates: Partial<UserData>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const handleLogout = async () => {
    setUser(null);
    setAuthScreen('login');
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  if (loading) return null;

  // Auth gate — must login/signup first
  if (!user) {
    return (
      <SafeAreaProvider>
        {authScreen === 'login' ? (
          <LoginScreen onLogin={handleAuth} onGoToSignup={() => setAuthScreen('signup')} />
        ) : (
          <SignupScreen onSignup={handleAuth} onGoToLogin={() => setAuthScreen('login')} />
        )}
      </SafeAreaProvider>
    );
  }

  // Logged in — show app
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home">
              {props => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Results">
              {props => <ResultsScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Booking">
              {props => <BookingScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="MyBookings">
              {props => <MyBookingsScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="AgentTrace" component={AgentTraceScreen} />
            <Stack.Screen name="Dispute" component={DisputeScreen} />
            <Stack.Screen name="ProviderRegister">
              {props => <ProviderRegisterScreen {...props} user={user} onUpdateUser={handleUpdateUser} />}
            </Stack.Screen>
            <Stack.Screen name="ProviderDashboard">
              {props => <ProviderDashboardScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Chat">
              {props => <ChatScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {props => <ProfileScreen {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
