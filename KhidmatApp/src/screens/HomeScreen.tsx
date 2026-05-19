import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, UserData } from '../../App';
import { useTheme } from '../constants/colors';
import { getStats } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import TutorialModal from '../components/TutorialModal';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  user: UserData;
  onLogout: () => void;
}

const categories = [
  { icon: 'ac-unit', label: 'AC Tech' },
  { icon: 'plumbing', label: 'Plumber' },
  { icon: 'bolt', label: 'Electrician' },
  { icon: 'school', label: 'Tutor' },
  { icon: 'cleaning-services', label: 'Cleaner' },
];

const allCategories = [
  { icon: 'ac-unit', label: 'AC Technician' },
  { icon: 'plumbing', label: 'Plumber' },
  { icon: 'bolt', label: 'Electrician' },
  { icon: 'school', label: 'Tutor' },
  { icon: 'cleaning-services', label: 'Cleaner' },
  { icon: 'format-paint', label: 'Painter' },
  { icon: 'carpenter', label: 'Carpenter' },
  { icon: 'face-retouching-natural', label: 'Beautician' },
];
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation, user, onLogout }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<{ uri: string, base64: string } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);

    AsyncStorage.getItem('hasSeenTutorial').then(val => {
      if (val !== 'true') {
        setShowTutorial(true);
      }
    });
  }, []);

  const handleCloseTutorial = () => {
    AsyncStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  };

  const handleSearch = () => {
    if (query.trim() || image) {
      navigation.navigate('Results', { 
        userMessage: query.trim() || "Please analyze this image and find a relevant service provider.",
        imageBase64: image?.base64 
      });
    }
  };

  const quickChips = [
    "AC repair G-13",
    "Plumber for leakage",
    "Math tutor class 10"
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* TopAppBar — NO hamburger */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <MaterialIcons name="auto-awesome" size={18} color={colors.onPrimary} />
          </View>
          <Text style={styles.headerTitle}>Khidmat خدمت</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon} onPress={() => navigation.navigate('Notifications')}>
            <MaterialIcons name="notifications" size={24} color={colors.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <MaterialIcons name="person" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.total_providers || '40'}+</Text>
            <Text style={styles.statLabel}>Providers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>63</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.avg_rating || '4.5'}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => setShowAllCategories(true)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryItem} onPress={() => navigation.navigate('Results', { userMessage: `I need a ${cat.label} in Islamabad` })}>
              <View style={styles.categoryIcon}>
                <MaterialIcons name={cat.icon as any} size={28} color={colors.primary} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tutorial CTA */}
        <TouchableOpacity style={styles.tutorialCta} onPress={() => setShowTutorial(true)} activeOpacity={0.85}>
          <MaterialIcons name="help-outline" size={20} color={colors.primary} />
          <Text style={styles.tutorialCtaText}>How to use Khidmat?</Text>
        </TouchableOpacity>

        {/* AI Orchestration Input Canvas */}
        <View style={styles.aiCard}>
          <View style={styles.aiAccent} />
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <MaterialIcons name="auto-awesome" size={16} color={colors.onPrimaryContainer} />
            </View>
            <Text style={styles.aiTitle}>Khidmat AI Agent</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Apni zaroorat batayein... (Urdu, Roman Urdu, or English)"
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              value={query}
              onChangeText={setQuery}
            />
            {image && (
              <View style={{ position: 'relative', width: 80, height: 80, marginTop: 10 }}>
                <Image source={{ uri: image.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                <TouchableOpacity style={{ position: 'absolute', top: -5, right: -5, backgroundColor: colors.error, borderRadius: 12 }} onPress={() => setImage(null)}>
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={pickImage} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: 20 }}>
                <MaterialIcons name="image" size={20} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chipsContainer}>
            {quickChips.map((chip, index) => (
              <TouchableOpacity key={index} style={styles.chip} onPress={() => setQuery(chip)}>
                <Text style={styles.chipText}>{chip}</Text>
                <MaterialIcons name="north-east" size={12} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.85}>
            <Text style={styles.searchButtonText}>Search with AI</Text>
            <MaterialIcons name="send" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoOverlay}>
            <Text style={styles.promoTitle}>Trust In Every Fix</Text>
            <Text style={styles.promoSubtitle}>Verified professionals across Pakistan</Text>
          </View>
        </View>

        {/* Provider CTA */}
        <TouchableOpacity style={styles.providerCta} onPress={() => navigation.navigate('ProviderRegister')} activeOpacity={0.85}>
          <View style={styles.providerCtaIcon}>
            <MaterialIcons name="handyman" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.providerCtaTitle}>Are you a professional?</Text>
            <Text style={styles.providerCtaSubtitle}>Register & start getting bookings today →</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* See All Categories Modal */}
      <Modal visible={showAllCategories} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Categories</Text>
              <TouchableOpacity onPress={() => setShowAllCategories(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalGrid}>
              {allCategories.map((cat, idx) => (
                <TouchableOpacity key={idx} style={styles.modalCategoryItem} onPress={() => { setShowAllCategories(false); navigation.navigate('Results', { userMessage: `I need a ${cat.label} in Islamabad` }); }}>
                  <View style={styles.modalCategoryIcon}>
                    <MaterialIcons name={cat.icon as any} size={32} color={colors.primary} />
                  </View>
                  <Text style={styles.modalCategoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Tutorial Modal */}
      <TutorialModal visible={showTutorial} onClose={handleCloseTutorial} />

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="home" size={24} color={colors.onPrimaryContainer} />
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyBookings')}>
          <MaterialIcons name="calendar-month" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="person" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} }) },
  // Header — NO hamburger
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.primary, fontFamily: 'System' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bellIcon: { position: 'relative' },
  notificationBadge: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.surface },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.outlineVariant },
  // Main
  main: { flex: 1, paddingHorizontal: 16 },
  // Stats
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(27,94,32,0.1)', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, marginTop: 24 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.outlineVariant },
  // Categories
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.onSurface },
  seeAll: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  categoriesScroll: { marginBottom: 24 },
  categoryItem: { alignItems: 'center', marginRight: 16 },
  categoryIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, marginTop: 4, letterSpacing: 0.5 },
  // Tutorial CTA
  tutorialCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.surfaceContainerHighest, paddingVertical: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.outlineVariant },
  tutorialCtaText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  // AI Card
  aiCard: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'hidden', position: 'relative' },
  aiAccent: { position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: colors.primary },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  aiIconBox: { padding: 6, backgroundColor: colors.primaryContainer, borderRadius: 8 },
  aiTitle: { fontSize: 20, fontWeight: '600', color: colors.primary },
  inputWrapper: { backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: 'rgba(192,201,187,0.3)', marginBottom: 16 },
  textInput: { fontSize: 16, color: colors.onSurface, minHeight: 100, textAlignVertical: 'top' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.primary, letterSpacing: 0.5 },
  searchButton: { height: 56, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 3 },
  searchButtonText: { fontSize: 20, fontWeight: '600', color: colors.onPrimary },
  // Promo
  promoBanner: { height: 160, borderRadius: 12, overflow: 'hidden', marginTop: 24, backgroundColor: colors.primaryContainer },
  promoOverlay: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  promoTitle: { fontSize: 24, fontWeight: '600', color: colors.onPrimary },
  promoSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  // Provider CTA
  providerCta: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12, padding: 16, marginTop: 16 },
  providerCtaIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.aiInsight, alignItems: 'center', justifyContent: 'center' },
  providerCtaTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  providerCtaSubtitle: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.onSurface },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  modalCategoryItem: { width: '22%', alignItems: 'center', marginBottom: 12 },
  modalCategoryIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  modalCategoryLabel: { fontSize: 11, fontWeight: '600', color: colors.onSurfaceVariant, textAlign: 'center' },
  // Bottom Nav
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 64, backgroundColor: colors.surfaceContainer, borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8 },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: colors.primaryContainer, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 2 },
  navLabelActive: { fontSize: 10, fontWeight: '500', color: colors.onPrimaryContainer, marginTop: 2 },
});
