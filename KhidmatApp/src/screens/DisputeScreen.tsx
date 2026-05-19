import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { colors } from '../constants/colors';
import { createDispute } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

type DisputeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dispute'>;
type DisputeScreenRouteProp = RouteProp<RootStackParamList, 'Dispute'>;

interface Props {
  navigation: DisputeScreenNavigationProp;
  route: DisputeScreenRouteProp;
}

const disputeTypes = ['quality_complaint', 'no_show', 'price_disagreement', 'overrun'];

export default function DisputeScreen({ navigation, route }: Props) {
  const { bookingRef } = route.params;
  const [type, setType] = useState('quality_complaint');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description.');
      return;
    }
    try {
      await createDispute({ booking_ref: bookingRef, type, description });
      Alert.alert('Dispute Filed', 'The Dispute Agent is processing your request.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to file dispute.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>File a Dispute</Text>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <Text style={styles.refText}>Ref: {bookingRef}</Text>

        <Text style={styles.label}>Dispute Type</Text>
        <View style={styles.chipsContainer}>
          {disputeTypes.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.chip, type === t && styles.chipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                {t.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Explain what happened..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
          <MaterialIcons name="gavel" size={24} color={colors.onError} />
          <Text style={styles.submitButtonText}>Submit to AI Agent</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: colors.error },
  main: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  refText: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: colors.onSurface, letterSpacing: 0.5, marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  chipActive: { backgroundColor: colors.error, borderColor: colors.error },
  chipText: { fontSize: 14, color: colors.onSurface },
  chipTextActive: { color: colors.onError, fontWeight: '700' },
  textArea: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, height: 120, fontSize: 16, color: colors.onSurface, textAlignVertical: 'top', marginBottom: 24 },
  submitButton: { height: 56, backgroundColor: colors.error, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 3 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: colors.onError },
});
