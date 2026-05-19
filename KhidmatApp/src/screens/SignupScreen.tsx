import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { signup } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  onSignup: (user: any) => void;
  onGoToLogin: () => void;
}

const cities = ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi'];

export default function SignupScreen({ onSignup, onGoToLogin }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name) {
      Alert.alert('Missing Info', 'Please enter your name');
      return;
    }
    if (!phone && !email) {
      Alert.alert('Missing Info', 'Please enter phone number or email');
      return;
    }
    if (phone && !/^03\d{9}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Use Pakistani format: 03XXXXXXXXX');
      return;
    }
    if (email && !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Weak Password', 'Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await signup(name, phone, email, password, city);
      onSignup(user);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Signup failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="auto-awesome" size={40} color={colors.onPrimary} />
            </View>
            <Text style={styles.appName}>Khidmat خدمت</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign Up</Text>
            <Text style={styles.formSubtitle}>Register to get started</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="e.g. Ahmad Khan" placeholderTextColor={colors.outline} value={name} onChangeText={setName} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="03XXXXXXXXX" placeholderTextColor={colors.outline} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={11} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.outline} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <Text style={styles.helperText}>* Enter at least one: phone or email</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={colors.onSurfaceVariant} />
                <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor={colors.outline} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={colors.outline} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <View style={styles.chipGrid}>
                {cities.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, city === c && styles.chipActive]} onPress={() => setCity(c)}>
                    <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.signupBtnText}>Creating account...</Text>
              ) : (
                <>
                  <MaterialIcons name="person-add" size={22} color={colors.onPrimary} />
                  <Text style={styles.signupBtnText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} })
  },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 4 },
  appName: { fontSize: 32, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 },
  formCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.outlineVariant, elevation: 2 },
  formTitle: { fontSize: 24, fontWeight: '700', color: colors.onSurface },
  formSubtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 12, gap: 10 },
  input: { flex: 1, fontSize: 16, color: colors.onSurface, paddingVertical: 12 },
  helperText: { fontSize: 11, color: colors.outline, marginBottom: 14, fontStyle: 'italic' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  chipTextActive: { color: colors.onPrimary },
  signupBtn: { height: 54, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, elevation: 3 },
  signupBtnText: { fontSize: 18, fontWeight: '600', color: colors.onPrimary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: colors.onSurfaceVariant },
  loginLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
