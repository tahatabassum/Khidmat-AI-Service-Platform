import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../constants/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TutorialModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');

  const content = {
    EN: [
      { step: "1. Tell AI what you need", text: "Tap the search box and type what you need in English or Roman Urdu. Example: 'I need an AC technician' or 'Mujhe plumber chahiye leakage ke liye'." },
      { step: "2. Compare Providers", text: "Our AI will find the best professionals near you. You can see their ratings, prices, and why they were recommended." },
      { step: "3. Book a Slot", text: "Select a provider, pick a time slot that works for you, and confirm your booking." },
      { step: "4. Stay Updated", text: "You'll receive reminders and updates when the provider is on their way. You can manage everything from the 'My Bookings' tab." }
    ],
    UR: [
      { step: "1. AI ko apni zaroorat batayein", text: "Search box par tap karein aur likhein ke aapko kya chahiye (English ya Roman Urdu mein). Misal ke tor par: 'Mujhe plumber chahiye leakage ke liye'." },
      { step: "2. Providers compare karein", text: "Hamara AI aap ke qareeb behtareen peshawar afrad dhoondhe ga. Aap unki rating, qeemat aur AI ki recommendation dekh sakte hain." },
      { step: "3. Time aur Slot book karein", text: "Apni pasand ka provider chunein, apne mutabiq waqt (slot) select karein aur booking confirm karein." },
      { step: "4. Updates haasil karein", text: "Jab provider raaste mein hoga toh aapko updates milengi. 'My Bookings' tab se aap sab kuch manage kar sakte hain." }
    ]
  };

  const activeContent = content[lang];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{lang === 'EN' ? 'How to Use Khidmat' : 'Khidmat Istemal Karne Ka Tariqa'}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, lang === 'EN' && styles.toggleBtnActive]}
              onPress={() => setLang('EN')}
            >
              <Text style={[styles.toggleText, lang === 'EN' && styles.toggleTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, lang === 'UR' && styles.toggleBtnActive]}
              onPress={() => setLang('UR')}
            >
              <Text style={[styles.toggleText, lang === 'UR' && styles.toggleTextActive]}>Urdu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.stepsContainer}>
            {activeContent.map((item, index) => (
              <View key={index} style={styles.stepCard}>
                <Text style={styles.stepTitle}>{item.step}</Text>
                <Text style={styles.stepText}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.footerBtns}>
            <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
              <Text style={styles.skipText}>{lang === 'EN' ? 'Skip Tutorial' : 'Skip Karein'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gotItBtn} onPress={onClose}>
              <Text style={styles.gotItText}>{lang === 'EN' ? 'Got it!' : 'Theek hai!'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  content: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 24, width: '100%', maxHeight: '85%', borderWidth: 1, borderColor: colors.outlineVariant },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: colors.onSurface, flex: 1 },
  toggleContainer: { flexDirection: 'row', backgroundColor: colors.surfaceContainer, borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.onSurfaceVariant },
  toggleTextActive: { color: colors.onPrimary },
  stepsContainer: { marginBottom: 20 },
  stepCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.outlineVariant },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  stepText: { fontSize: 14, color: colors.onSurface, lineHeight: 22 },
  footerBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  skipBtn: { flex: 1, backgroundColor: colors.surfaceContainerHighest, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.outlineVariant },
  skipText: { color: colors.onSurfaceVariant, fontSize: 15, fontWeight: '600' },
  gotItBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  gotItText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' }
});
