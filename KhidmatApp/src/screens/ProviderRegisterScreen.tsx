import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { RootStackParamList, UserData } from '../../App';
import { colors } from '../constants/colors';
import { registerProvider } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ProviderRegister'>;
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
};

const serviceTypes = ['Plumber', 'Electrician', 'AC Technician', 'Tutor', 'Cleaner', 'Painter', 'Carpenter', 'Beautician'];
const cities = [
  'Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 
  'Gujranwala', 'Peshawar', 'Quetta', 'Sargodha', 'Sialkot', 'Bahawalpur', 'Sukkur', 
  'Jhang', 'Sheikhupura', 'Mardan', 'Gujrat', 'Larkana', 'Kasur', 'Rahim Yar Khan', 
  'Sahiwal', 'Okara', 'Wah Cantonment', 'Dera Ghazi Khan', 'Mirpur Khas', 'Nawabshah', 
  'Mingora', 'Chiniot', 'Kamoke', 'Mandi Bahauddin', 'Jhelum', 'Sadiqabad', 'Khanewal', 
  'Hafizabad', 'Kohat', 'Jacobabad', 'Shikarpur', 'Muzaffargarh', 'Khanpur', 'Gojra', 
  'Bahawalnagar', 'Abbottabad', 'Muridke', 'Pakpattan', 'Khuzdar', 'Jaranwala', 
  'Chishtian', 'Daska', 'Mandure', 'Vehari', 'Nowshera', 'Dadu', 'Wazirabad', 
  'Khushab', 'Charsadda', 'Swabi', 'Chakwal', 'Mianwali', 'Tando Adam', 'Gwadar', 'Muzaffarabad', 'Mirpur'
].sort();
const skillLevels = ['basic', 'intermediate', 'expert'];

export default function ProviderRegisterScreen({ navigation, user, onUpdateUser }: Props) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [serviceType, setServiceType] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [experience, setExperience] = useState('');
  const [price, setPrice] = useState('');
  const [skill, setSkill] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to fetch your area.');
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const result = geocode[0];
        const newArea = [result.name, result.street, result.subregion].filter(Boolean).join(', ');
        if (newArea) setArea(newArea);
        
        // Auto-select city if it matches one of our chips
        if (result.city && cities.includes(result.city)) {
          setCity(result.city);
        }
      } else {
        Alert.alert('Location Error', 'Could not determine address from your location.');
      }
    } catch (err) {
      Alert.alert('Location Error', 'Failed to fetch location. Please ensure GPS is turned on.');
    } finally {
      setLocating(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !serviceType || !city || !area || !experience || !price) {
      Alert.alert('Missing Info', 'Sab fields fill karein');
      return;
    }
    if (!/^03\d{9}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Pakistani format: 03XXXXXXXXX');
      return;
    }
    setLoading(true);
    try {
      await registerProvider({
        name,
        phone,
        service_type: serviceType,
        area,
        city,
        experience_years: parseInt(experience),
        price_per_hour: parseInt(price),
        skill_level: skill,
      });
      onUpdateUser({ isProvider: true });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color={colors.secondary} />
          </View>
          <Text style={styles.successTitle}>Registration Successful! 🎉</Text>
          <Text style={styles.successSubtitle}>Welcome to Khidmat, {name}!</Text>
          <Text style={styles.successText}>
            Aap ab Khidmat platform par registered hain. Customers aapko search kar sakenge aur booking bhi kar sakenge.
          </Text>
          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <MaterialIcons name="person" size={20} color={colors.primary} />
              <Text style={styles.successLabel}>{name}</Text>
            </View>
            <View style={styles.successRow}>
              <MaterialIcons name="build" size={20} color={colors.primary} />
              <Text style={styles.successLabel}>{serviceType}</Text>
            </View>
            <View style={styles.successRow}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={styles.successLabel}>{area}, {city}</Text>
            </View>
            <View style={styles.successRow}>
              <MaterialIcons name="payments" size={20} color={colors.primary} />
              <Text style={styles.successLabel}>Rs. {price}/hr</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
            <MaterialIcons name="home" size={20} color={colors.onPrimary} />
            <Text style={styles.primaryBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khidmat خدمت</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroCard}>
            <MaterialIcons name="handyman" size={40} color={colors.onPrimary} />
            <Text style={styles.heroTitle}>Become a Khidmat Provider</Text>
            <Text style={styles.heroSubtitle}>Register karein aur apni services offer karein across Pakistan</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name / Pura Naam</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="e.g. Ali Khan" value={name} onChangeText={setName} placeholderTextColor={colors.outline} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="03XXXXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={11} placeholderTextColor={colors.outline} />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Service Details</Text>

            <Text style={styles.inputLabel}>Service Type / Kaam ki Qism</Text>
            <View style={styles.chipGrid}>
              {serviceTypes.map(s => (
                <TouchableOpacity key={s} style={[styles.selectChip, serviceType === s && styles.selectChipActive]} onPress={() => setServiceType(s)}>
                  <Text style={[styles.selectChipText, serviceType === s && styles.selectChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>City</Text>
            <View style={styles.chipGrid}>
              {cities.map(c => (
                <TouchableOpacity key={c} style={[styles.selectChip, city === c && styles.selectChipActive]} onPress={() => setCity(c)}>
                  <Text style={[styles.selectChipText, city === c && styles.selectChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[styles.inputLabel, { marginBottom: 0 }]}>Area / Ilaaqa</Text>
                <TouchableOpacity onPress={handleGetLocation} disabled={locating} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  {locating ? <ActivityIndicator size="small" color={colors.primary} /> : <MaterialIcons name="my-location" size={14} color={colors.primary} />}
                  <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>{locating ? 'Locating...' : 'Get Location'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="location-on" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="e.g. G-13, DHA Phase 2" value={area} onChangeText={setArea} placeholderTextColor={colors.outline} />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Experience (Years)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="work" size={20} color={colors.onSurfaceVariant} />
                  <TextInput style={styles.input} placeholder="e.g. 5" value={experience} onChangeText={setExperience} keyboardType="numeric" placeholderTextColor={colors.outline} />
                </View>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Rate (Rs/hr)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="payments" size={20} color={colors.onSurfaceVariant} />
                  <TextInput style={styles.input} placeholder="e.g. 1000" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor={colors.outline} />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Skill Level</Text>
            <View style={styles.chipGrid}>
              {skillLevels.map(s => (
                <TouchableOpacity key={s} style={[styles.selectChip, skill === s && styles.selectChipActive]} onPress={() => setSkill(s)}>
                  <Text style={[styles.selectChipText, skill === s && styles.selectChipTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <Text style={styles.primaryBtnText}>Registering...</Text>
            ) : (
              <>
                <MaterialIcons name="app-registration" size={22} color={colors.onPrimary} />
                <Text style={styles.primaryBtnText}>Register as Provider</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.primary },
  main: { flex: 1, paddingHorizontal: 16 },
  // Hero
  heroCard: { backgroundColor: colors.primaryContainer, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 16, gap: 8 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: colors.onPrimary, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  // Form
  formSection: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.onSurface, marginBottom: 12 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, fontSize: 16, color: colors.onSurface, paddingVertical: 14 },
  rowInputs: { flexDirection: 'row' },
  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  selectChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  selectChipTextActive: { color: colors.onPrimary },
  // Button
  primaryBtn: { height: 56, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, elevation: 3 },
  primaryBtnText: { fontSize: 18, fontWeight: '600', color: colors.onPrimary },
  // Success
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  successSubtitle: { fontSize: 16, color: colors.secondary, marginTop: 4 },
  successText: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 16 },
  successCard: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, marginTop: 24, width: '100%', gap: 12 },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  successLabel: { fontSize: 15, fontWeight: '500', color: colors.onSurface },
});
