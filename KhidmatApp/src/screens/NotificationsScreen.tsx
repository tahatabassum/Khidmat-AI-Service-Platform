import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useTheme } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

export default function NotificationsScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const notifications = [
    { id: 1, type: 'booking', title: 'Booking Confirmed!', desc: 'Ali Khan (Electrician) is scheduled for Today at 04:00 PM.', time: '10m ago', unread: true, icon: 'check-circle' },
    { id: 2, type: 'promo', title: '20% OFF on Deep Cleaning 🧹', desc: 'Use promo code CLEAN20 for your next booking.', time: '2h ago', unread: true, icon: 'local-offer' },
    { id: 3, type: 'system', title: 'Welcome to Khidmat', desc: 'Your account has been created successfully.', time: '1d ago', unread: false, icon: 'waving-hand' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="done-all" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {notifications.map((item) => (
          <View key={item.id} style={[styles.notificationCard, item.unread && styles.unreadCard]}>
            <View style={[styles.iconBox, item.unread ? styles.iconBoxUnread : null]}>
              <MaterialIcons 
                name={item.icon as any} 
                size={24} 
                color={item.unread ? colors.onPrimary : colors.primary} 
              />
            </View>
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, item.unread && styles.titleUnread]}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
        ))}
        
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-paused" size={48} color={colors.outline} />
          <Text style={styles.emptyStateText}>You're all caught up!</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} }) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },
  main: { flex: 1 },
  
  notificationCard: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, alignItems: 'center', backgroundColor: colors.surface },
  unreadCard: { backgroundColor: isDark ? 'rgba(76,175,80,0.05)' : colors.primaryContainer },
  
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconBoxUnread: { backgroundColor: colors.primary },
  
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '500', color: colors.onSurface },
  titleUnread: { fontWeight: '700' },
  time: { fontSize: 12, color: colors.onSurfaceVariant },
  desc: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary, marginLeft: 12 },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 48 },
  emptyStateText: { fontSize: 16, color: colors.onSurfaceVariant, marginTop: 12 },
});
