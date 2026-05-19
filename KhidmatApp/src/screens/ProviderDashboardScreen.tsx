import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserData } from '../../App';
import { useTheme } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ProviderDashboard'>;
  user: UserData;
};

export default function ProviderDashboardScreen({ navigation, user }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Dashboard</Text>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.providerName}>{user.name}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online & Accepting Jobs</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="account-balance-wallet" size={28} color={colors.primary} />
            <Text style={styles.statValue}>Rs. 14,500</Text>
            <Text style={styles.statLabel}>Monthly Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="assignment-turned-in" size={28} color={colors.secondary} />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="star" size={28} color="#FFB300" />
            <Text style={styles.statValue}>4.9/5</Text>
            <Text style={styles.statLabel}>Customer Rating</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={28} color={colors.error} />
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>

        {/* Active Requests */}
        <Text style={styles.sectionTitle}>Active Requests (1)</Text>
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.requestUser}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={24} color={colors.onPrimary} />
              </View>
              <View>
                <Text style={styles.requestName}>Ahmed Raza</Text>
                <Text style={styles.requestDistance}>2.5 km away • G-11/3</Text>
              </View>
            </View>
            <Text style={styles.requestPrice}>Rs. 1,200</Text>
          </View>
          <View style={styles.requestBody}>
            <Text style={styles.requestDesc}>"Need an electrician to fix a short circuit in the main lounge."</Text>
            <View style={styles.timeTag}>
              <MaterialIcons name="schedule" size={14} color={colors.primary} />
              <Text style={styles.timeTagText}>Today, 04:00 PM</Text>
            </View>
          </View>
          <View style={styles.requestActions}>
            <TouchableOpacity style={styles.declineBtn}>
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn}>
              <Text style={styles.acceptBtnText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} }) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },
  main: { flex: 1, paddingHorizontal: 16 },
  
  welcomeSection: { marginTop: 24, marginBottom: 24 },
  welcomeText: { fontSize: 16, color: colors.onSurfaceVariant },
  providerName: { fontSize: 28, fontWeight: '800', color: colors.onSurface, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainer, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: colors.outlineVariant },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.onSurface },

  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'flex-start', elevation: 2 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  statLabel: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginTop: 16, marginBottom: 12 },
  
  requestCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.primary, elevation: 4 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  requestUser: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  requestName: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  requestDistance: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  requestPrice: { fontSize: 18, fontWeight: '700', color: colors.primary },
  
  requestBody: { marginBottom: 16 },
  requestDesc: { fontSize: 14, color: colors.onSurface, fontStyle: 'italic', marginBottom: 12 },
  timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryContainer, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  timeTagText: { fontSize: 12, fontWeight: '600', color: colors.onPrimaryContainer },
  
  requestActions: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.outline, alignItems: 'center' },
  declineBtnText: { fontSize: 14, fontWeight: '600', color: colors.onSurfaceVariant },
  acceptBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: colors.onPrimary },
});
