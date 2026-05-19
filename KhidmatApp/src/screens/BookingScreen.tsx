import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, UserData } from '../../App';
import { colors } from '../constants/colors';
import { createBooking } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type BookingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Booking'>;
type BookingScreenRouteProp = RouteProp<RootStackParamList, 'Booking'>;

interface Props {
  navigation: BookingScreenNavigationProp;
  route: BookingScreenRouteProp;
  user: UserData;
}

export default function BookingScreen({ navigation, route, user }: Props) {
  const { providerId, slot, quotedPrice } = route.params;
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to auto-fill your address.');
        setLocationLoading(false);
        return;
      }
      
      const locationInfo = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: locationInfo.coords.latitude,
        longitude: locationInfo.coords.longitude
      });
      
      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const formattedAddress = [address.street, address.district, address.city, address.region].filter(Boolean).join(', ');
        setLocation(formattedAddress || `${locationInfo.coords.latitude}, ${locationInfo.coords.longitude}`);
      } else {
        setLocation(`${locationInfo.coords.latitude}, ${locationInfo.coords.longitude}`);
      }
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch your current location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!name || !phone || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const payload = { provider_id: providerId, slot, user_name: name, user_phone: phone, location, quoted_price: quotedPrice };
      const res = await createBooking(payload);
      navigation.navigate('Confirmation', {
        bookingRef: res.booking_ref,
        providerName: res.provider?.name || "Provider",
        serviceType: res.service_type || "Service",
        slot: res.slot
      });
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        Alert.alert('Slot Taken', 'This slot is no longer available.');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to create booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryCellLabel}>Slot</Text>
              <Text style={styles.summaryCellValue}>{slot}</Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryCellLabel}>Quoted Price</Text>
              <Text style={styles.summaryCellValue}>Rs. {quotedPrice.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor={colors.onSurfaceVariant} value={name} onChangeText={setName} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="03001234567" placeholderTextColor={colors.onSurfaceVariant} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>Full Address</Text>
          <View style={styles.locationInputContainer}>
            <TextInput 
              style={[styles.input, styles.locationInputBox]} 
              placeholder="e.g. G-13/1, Islamabad" 
              placeholderTextColor={colors.onSurfaceVariant} 
              value={location} 
              onChangeText={setLocation} 
            />
            <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} disabled={locationLoading}>
              {locationLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialIcons name="my-location" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={loading || locationLoading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : (
            <>
              <MaterialIcons name="check-circle" size={24} color={colors.onPrimary} />
              <Text style={styles.confirmButtonText}>Confirm & Book</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: colors.primary },
  main: { flex: 1, paddingHorizontal: 16 },
  summaryCard: { backgroundColor: colors.aiInsight, borderWidth: 1, borderColor: colors.secondaryContainer, borderRadius: 12, padding: 16, marginTop: 24, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', gap: 16 },
  summaryCell: { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', padding: 12, borderRadius: 8 },
  summaryCellLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant },
  summaryCellValue: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 2 },
  form: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: colors.onSurface, letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, padding: 16, fontSize: 16, color: colors.onSurface, marginBottom: 16 },
  locationInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  locationInputBox: { flex: 1, marginBottom: 0 },
  locationButton: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  confirmButton: { height: 56, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 3 },
  confirmButtonText: { fontSize: 20, fontWeight: '600', color: colors.onPrimary },
});
