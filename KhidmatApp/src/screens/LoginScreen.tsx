import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { login } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  onLogin: (user: any) => void;
  onGoToSignup: () => void;
}

export default function LoginScreen({ onLogin, onGoToSignup }: Props) {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Missing Info', `Please enter ${method} and password`);
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier, password, method);
      onLogin(user);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed';
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
            <Text style={styles.tagline}>Pakistan's AI Service Platform</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Login to continue</Text>

            {/* Method Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, method === 'phone' && styles.toggleBtnActive]}
                onPress={() => { setMethod('phone'); setIdentifier(''); }}
              >
                <MaterialIcons name="phone" size={16} color={method === 'phone' ? colors.onPrimary : colors.onSurfaceVariant} />
                <Text style={[styles.toggleText, method === 'phone' && styles.toggleTextActive]}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, method === 'email' && styles.toggleBtnActive]}
                onPress={() => { setMethod('email'); setIdentifier(''); }}
              >
                <MaterialIcons name="email" size={16} color={method === 'email' ? colors.onPrimary : colors.onSurfaceVariant} />
                <Text style={[styles.toggleText, method === 'email' && styles.toggleTextActive]}>Email</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{method === 'phone' ? 'Phone Number' : 'Email Address'}</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name={method === 'phone' ? 'phone' : 'email'} size={20} color={colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  placeholder={method === 'phone' ? '03XXXXXXXXX' : 'you@example.com'}
                  placeholderTextColor={colors.outline}
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                  maxLength={method === 'phone' ? 11 : 100}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={colors.outline}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={colors.outline} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.loginBtnText}>Logging in...</Text>
              ) : (
                <>
                  <MaterialIcons name="login" size={22} color={colors.onPrimary} />
                  <Text style={styles.loginBtnText}>Login</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onGoToSignup}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 4 },
  appName: { fontSize: 32, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 },
  formCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.outlineVariant, elevation: 2 },
  formTitle: { fontSize: 24, fontWeight: '700', color: colors.onSurface },
  formSubtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 16 },
  // Toggle
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surfaceContainerLow, borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: colors.primary, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.onSurfaceVariant },
  toggleTextActive: { color: colors.onPrimary },
  // Inputs
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 12, gap: 10 },
  input: { flex: 1, fontSize: 16, color: colors.onSurface, paddingVertical: 14 },
  loginBtn: { height: 54, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, elevation: 3 },
  loginBtnText: { fontSize: 18, fontWeight: '600', color: colors.onPrimary },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signupText: { fontSize: 14, color: colors.onSurfaceVariant },
  signupLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
