import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserData } from '../../App';
import { colors } from '../constants/colors';
import { getUserBookings, rateBooking } from '../services/api';
import { Booking } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

type MyBookingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyBookings'>;

interface Props {
  navigation: MyBookingsScreenNavigationProp;
  user: UserData;
}

export default function MyBookingsScreen({ navigation, user }: Props) {
  const [phone, setPhone] = useState(user.phone);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);

  // Auto-fetch on mount with default phone
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await getUserBookings(phone);
      setBookings(res);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (id: number) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const submitRating = async () => {
    if (!selectedBookingForRating) return;
    try {
      await rateBooking(selectedBookingForRating, { provider_rating: ratingValue });
      alert("Rating submitted successfully!");
      setRatingModalVisible(false);
      setSelectedBookingForRating(null);
      fetchBookings();
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: colors.secondaryContainer, text: colors.onSecondaryContainer, icon: 'check-circle' as const };
      case 'completed': return { bg: '#e3f2fd', text: '#1565c0', icon: 'done-all' as const };
      case 'cancelled': return { bg: colors.errorContainer, text: colors.onErrorContainer, icon: 'cancel' as const };
      default: return { bg: '#fff3e0', text: '#e65100', icon: 'schedule' as const };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="phone" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter phone number"
            placeholderTextColor={colors.outline}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={fetchBookings}>
          <MaterialIcons name="search" size={22} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : (
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        style={styles.main}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searched ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <MaterialIcons name="event-busy" size={56} color={colors.outlineVariant} />
              </View>
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptyText}>Aap ne abhi tak koi booking nahi ki. Search karein aur apna first booking karein!</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
                <MaterialIcons name="search" size={18} color={colors.onPrimary} />
                <Text style={styles.emptyBtnText}>Search Services</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
        renderItem={({ item: b }) => {
          const statusStyle = getStatusStyle(b.status);
          return (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.refContainer}>
                  <MaterialIcons name="receipt-long" size={16} color={colors.primary} />
                  <Text style={styles.bookingRef}>{b.booking_ref}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <MaterialIcons name={statusStyle.icon} size={12} color={statusStyle.text} />
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {b.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.bookingDetailRow}>
                  <MaterialIcons name="build" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>{b.service_type}</Text>
                </View>
                <View style={styles.bookingDetailRow}>
                  <MaterialIcons name="schedule" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>{b.slot}</Text>
                </View>
                <View style={styles.bookingDetailRow}>
                  <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>{b.location || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.bookingFooter}>
                <Text style={styles.bookingPrice}>Rs. {b.quoted_price?.toLocaleString()}</Text>
                <View style={styles.actionsRow}>
                  {(b.status === 'confirmed' || b.status === 'pending') && (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtnOutline}
                        onPress={() => navigation.navigate('Chat', {
                          providerName: b.provider?.name || `Provider · ${b.booking_ref}`,
                          bookingRef: b.booking_ref,
                        })}
                      >
                        <MaterialIcons name="chat" size={14} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.primary }]}>Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtnOutlineError} onPress={() => handleCancelBooking(b.id)}>
                        <MaterialIcons name="cancel" size={14} color={colors.error} />
                        <Text style={[styles.actionText, { color: colors.error }]}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {b.status === 'completed' && !b.provider_rating && (
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => {
                        setSelectedBookingForRating(b.booking_ref);
                        setRatingValue(5);
                        setRatingModalVisible(true);
                      }}
                    >
                      <MaterialIcons name="star" size={14} color={colors.primary} />
                      <Text style={[styles.actionText, { color: colors.primary }]}>Rate Provider</Text>
                    </TouchableOpacity>
                  )}
                  {b.status === 'confirmed' && (
                    <TouchableOpacity style={styles.actionBtnOutlineError} onPress={() => navigation.navigate('Dispute', { bookingRef: b.booking_ref })}>
                      <MaterialIcons name="report-problem" size={14} color={colors.error} />
                      <Text style={[styles.actionText, { color: colors.error }]}>Report</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="home" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="calendar-month" size={24} color={colors.onPrimaryContainer} />
          <Text style={styles.navLabelActive}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="person" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={ratingModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Rate Your Provider</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map(val => (
                <TouchableOpacity key={val} onPress={() => setRatingValue(val)}>
                  <MaterialIcons name={ratingValue >= val ? "star" : "star-border"} size={40} color={colors.secondary} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.outline, alignItems: 'center' }} onPress={() => setRatingModalVisible(false)}>
                <Text style={{ fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center' }} onPress={submitRating}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} }) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },
  // Search
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.onSurface },
  searchBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: colors.onSurfaceVariant },
  main: { flex: 1, paddingHorizontal: 16 },
  // Booking Card
  bookingCard: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  refContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookingRef: { fontSize: 14, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  // Booking Details
  bookingDetails: { gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  bookingDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookingDetailText: { fontSize: 14, color: colors.onSurface },
  // Footer
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, flexWrap: 'wrap', gap: 8 },
  bookingPrice: { fontSize: 22, fontWeight: '700', color: colors.secondary },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
  actionBtnOutlineError: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.error },
  actionText: { fontSize: 11, fontWeight: '600' },
  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, elevation: 2 },
  emptyBtnText: { fontSize: 15, fontWeight: '600', color: colors.onPrimary },
  // Bottom Nav
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 64, backgroundColor: colors.surfaceContainer, borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8 },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: colors.primaryContainer, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 2 },
  navLabelActive: { fontSize: 10, fontWeight: '500', color: colors.onPrimaryContainer, marginTop: 2 },
});
