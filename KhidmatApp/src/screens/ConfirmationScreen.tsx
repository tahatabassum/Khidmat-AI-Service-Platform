import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { colors } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type ConfirmationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Confirmation'>;
type ConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'Confirmation'>;

interface Props {
  navigation: ConfirmationScreenNavigationProp;
  route: ConfirmationScreenRouteProp;
}

const timelineSteps = [
  { title: 'Confirmation Sent', subtitle: 'SMS & App notification delivered', done: true, active: false },
  { title: '1 Hour Warning', subtitle: 'Scheduled for reminder', done: false, active: true },
  { title: 'Provider En-route', subtitle: 'Real-time tracking link active', done: false, active: false },
  { title: 'Service Commencement', subtitle: 'Digital OTP verification', done: false, active: false },
  { title: 'Completion Receipt', subtitle: 'Invoice generated & archived', done: false, active: false },
];

export default function ConfirmationScreen({ navigation, route }: Props) {
  const { bookingRef, providerName, serviceType, slot } = route.params;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khidmat خدمت</Text>
        <View style={styles.avatarSmall}>
          <MaterialIcons name="person" size={18} color={colors.onSurfaceVariant} />
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* Big Green Checkmark */}
        <View style={styles.successSection}>
          <View style={styles.successCircle}>
            <MaterialIcons name="check-circle" size={48} color={colors.secondary} />
          </View>
          <Text style={styles.successTitle}>Booking Ho Gayi!</Text>
          <Text style={styles.successSubtitle}>Your service has been successfully scheduled and confirmed.</Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Booking Ref */}
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Booking Reference</Text>
            <Text style={styles.receiptRef}>{bookingRef}</Text>
          </View>
          <View style={styles.receiptDivider} />

          {/* Provider Info */}
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <MaterialIcons name="person" size={24} color={colors.onSurfaceVariant} />
            </View>
            <View>
              <Text style={styles.providerName}>{providerName}</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color={colors.tertiaryFixedDim} />
                <Text style={styles.ratingText}>4.9 • {serviceType}</Text>
              </View>
            </View>
          </View>

          {/* Slot & Service Type */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoCellLabel}>Slot</Text>
              <Text style={styles.infoCellValue}>{slot}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoCellLabel}>Service Type</Text>
              <Text style={styles.infoCellValue}>{serviceType}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>Rs. 1,350</Text>
          </View>
        </View>

        {/* Automation Roadmap */}
        <Text style={styles.roadmapTitle}>Automation Roadmap</Text>
        <View style={styles.timelineCard}>
          <View style={styles.timelineLine} />
          {timelineSteps.map((step, idx) => (
            <View key={idx} style={[styles.timelineStep, !step.done && !step.active && styles.timelineStepFaded]}>
              <View style={[
                styles.timelineNode,
                step.done && styles.timelineNodeDone,
                step.active && styles.timelineNodeActive,
                !step.done && !step.active && styles.timelineNodePending,
              ]}>
                {step.done && <MaterialIcons name="done" size={14} color={colors.onSecondary} />}
                {step.active && <View style={styles.timelineActiveDot} />}
              </View>
              <View>
                <Text style={[styles.timelineTitle, step.done && { fontWeight: '700' }]}>{step.title}</Text>
                <Text style={styles.timelineSub}>{step.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AgentTrace', { traceData: [] })}
        >
          <MaterialIcons name="analytics" size={24} color={colors.onPrimary} />
          <Text style={styles.primaryButtonText}>View Trace</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() =>
            navigation.navigate('Chat', {
              providerName,
              bookingRef,
            })
          }
        >
          <MaterialIcons name="chat" size={24} color={colors.primary} />
          <Text style={styles.chatButtonText}>Message Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <MaterialIcons name="calendar-month" size={24} color={colors.onSurface} />
          <Text style={styles.secondaryButtonText}>My Bookings</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>
          <MaterialIcons name="home" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive} onPress={() => navigation.navigate('MyBookings')}>
          <MaterialIcons name="calendar-month" size={24} color={colors.onPrimaryContainer} />
          <Text style={styles.navLabelActive}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} })
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.primary },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, paddingHorizontal: 16 },
  // Success
  successSection: { alignItems: 'center', paddingVertical: 24 },
  successCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center' },
  // Receipt
  receiptCard: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, elevation: 2, marginBottom: 24 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 },
  receiptLabel: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  receiptRef: { fontSize: 20, fontWeight: '600', color: colors.secondary },
  receiptDivider: { height: 1, backgroundColor: colors.outlineVariant, marginBottom: 12 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  providerAvatar: { width: 48, height: 48, borderRadius: 8, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  providerName: { fontSize: 20, fontWeight: '600', color: colors.onSurface },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant },
  infoGrid: { flexDirection: 'row', gap: 16, marginTop: 12 },
  infoCell: { flex: 1, backgroundColor: colors.surfaceContainerLow, padding: 12, borderRadius: 8 },
  infoCellLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant },
  infoCellValue: { fontSize: 14, fontWeight: '600', color: colors.onSurface, marginTop: 2 },
  priceDivider: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.outlineVariant, marginTop: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  totalLabel: { fontSize: 20, fontWeight: '600', color: colors.primary },
  totalPrice: { fontSize: 20, fontWeight: '600', color: colors.secondary },
  // Roadmap
  roadmapTitle: { fontSize: 20, fontWeight: '600', color: colors.onSurface, marginBottom: 16 },
  timelineCard: { backgroundColor: colors.surfaceContainerLow, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.outlineVariant, position: 'relative', marginBottom: 24 },
  timelineLine: { position: 'absolute', left: 28, top: 28, bottom: 28, width: 2, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: colors.secondary, opacity: 0.3 },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 24 },
  timelineStepFaded: { opacity: 0.6 },
  timelineNode: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timelineNodeDone: { backgroundColor: colors.secondary },
  timelineNodeActive: { borderWidth: 2, borderColor: colors.secondary, backgroundColor: colors.surface },
  timelineNodePending: { borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.surfaceContainer },
  timelineActiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary },
  timelineTitle: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  timelineSub: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant },
  // Buttons
  primaryButton: { height: 56, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 3, marginBottom: 12 },
  primaryButtonText: { fontSize: 20, fontWeight: '600', color: colors.onPrimary },
  chatButton: { height: 56, backgroundColor: colors.primaryContainer, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 12 },
  chatButtonText: { fontSize: 18, fontWeight: '600', color: colors.primary },
  secondaryButton: { height: 56, backgroundColor: colors.surfaceContainerHigh, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: colors.outlineVariant },
  secondaryButtonText: { fontSize: 20, fontWeight: '600', color: colors.onSurface },
  // Bottom Nav
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 64, backgroundColor: colors.surfaceContainer, borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8 },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: colors.primaryContainer, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 2 },
  navLabelActive: { fontSize: 10, fontWeight: '500', color: colors.onPrimaryContainer, marginTop: 2 },
});
