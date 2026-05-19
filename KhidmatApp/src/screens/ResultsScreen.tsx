import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, UserData } from '../../App';
import { useTheme } from '../constants/colors';
import { orchestrateRequest } from '../services/api';
import { OrchestrateResponse } from '../types';
import ProviderCard from '../components/ProviderCard';
import { MaterialIcons } from '@expo/vector-icons';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
  user: UserData;
}

const loadingSteps = [
  { icon: 'psychology', text: 'Intent Parser is understanding your request...' },
  { icon: 'travel-explore', text: 'Discovering nearby providers...' },
  { icon: 'military-tech', text: 'Ranking providers by match score...' },
  { icon: 'payments', text: 'Calculating dynamic pricing quotes...' },
];

export default function ResultsScreen({ navigation, route, user }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { userMessage } = route.params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrchestrateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Animate loading step progression
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStepIdx(prev => (prev + 1) % loadingSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    setLoadingStepIdx(0);
    try {
      const res = await orchestrateRequest(userMessage, user.name, user.phone, route.params?.imageBase64);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (providerId: number, slot: string, quotedPrice: number) => {
    navigation.navigate('Booking', { providerId, slot, quotedPrice });
  };

  // LOADING STATE — beautiful animated agent pipeline
  if (loading) {
    const progress = ((loadingStepIdx + 1) / loadingSteps.length) * 100;
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Khidmat خدمت</Text>
          </View>
        </View>
        <View style={styles.loadingContent}>
          {/* Brain Icon */}
          <Animated.View style={[styles.loadingBrainIcon, { opacity: pulseAnim }]}>
            <MaterialIcons name="psychology" size={48} color={colors.primary} />
          </Animated.View>
          <Text style={styles.loadingTitle}>AI Agents Working...</Text>
          <Text style={styles.loadingDesc}>Our multi-agent AI system is processing your request</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>

          {/* Animated Pipeline */}
          <View style={styles.loadingPipeline}>
            {loadingSteps.map((step, idx) => {
              const isDone = idx < loadingStepIdx;
              const isActive = idx === loadingStepIdx;
              const isPending = idx > loadingStepIdx;
              return (
                <View key={idx} style={styles.loadingStep}>
                  {/* Connector Line */}
                  {idx > 0 && <View style={[styles.connectorLine, isDone && styles.connectorLineDone]} />}
                  {/* Step Circle */}
                  <Animated.View style={[
                    styles.loadingStepIcon,
                    isDone && styles.loadingStepIconDone,
                    isActive && styles.loadingStepIconActive,
                    isActive && { transform: [{ scale: Animated.add(pulseAnim, 0.2) }] },
                  ]}>
                    {isDone ? (
                      <MaterialIcons name="check" size={18} color={colors.onPrimary} />
                    ) : (
                      <MaterialIcons name={step.icon as any} size={18} color={isActive ? colors.onPrimary : colors.outline} />
                    )}
                  </Animated.View>
                  {/* Step Text */}
                  <View style={styles.loadingStepTextWrap}>
                    <Text style={[
                      styles.loadingStepText,
                      isDone && styles.loadingStepTextDone,
                      isActive && styles.loadingStepTextActive,
                    ]}>{step.text}</Text>
                    {isActive && (
                      <Animated.Text style={[styles.loadingStepDots, { opacity: pulseAnim }]}>●●●</Animated.Text>
                    )}
                    {isDone && <Text style={styles.loadingStepCheck}>✓ Done</Text>}
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={styles.loadingSubtext}>⏱ Estimated time: 15-30 seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Khidmat خدمت</Text>
          </View>
        </View>
        <View style={styles.loadingContent}>
          <MaterialIcons name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchResults}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackText}>← Go Back & Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // CLARIFICATION STATE — AI needs more info
  if (data?.clarification_needed) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Khidmat خدمت</Text>
          </View>
        </View>
        <View style={styles.clarificationContainer}>
          <View style={styles.clarificationCard}>
            <View style={styles.clarificationIcon}>
              <MaterialIcons name="help-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.clarificationTitle}>Thoda Aur Batayein...</Text>
            <Text style={styles.clarificationText}>{data.question}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
              <MaterialIcons name="edit" size={20} color={colors.onPrimary} />
              <Text style={styles.primaryBtnText}>Modify Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // RESULTS STATE
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khidmat خدمت</Text>
        </View>
        <View style={styles.avatarSmall}>
          <MaterialIcons name="person" size={18} color={colors.onSurfaceVariant} />
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* Intent Card */}
        {data?.intent && (
          <View style={styles.intentCard}>
            <View style={styles.intentHeader}>
              <View style={styles.intentIconBox}>
                <MaterialIcons name="psychology" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.intentTitle}>Search Intent</Text>
                <View style={styles.intentGrid}>
                  <View style={styles.intentChip}>
                    <Text style={styles.intentChipLabel}>Service</Text>
                    <Text style={styles.intentChipValue}>{data.intent.service_type}</Text>
                  </View>
                  <View style={styles.intentChip}>
                    <Text style={styles.intentChipLabel}>Location</Text>
                    <Text style={styles.intentChipValue}>{data.intent.location}</Text>
                  </View>
                  <View style={styles.intentChip}>
                    <Text style={styles.intentChipLabel}>Urgency</Text>
                    <Text style={styles.intentChipValue}>{data.intent.urgency}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Top Matches */}
        {data?.no_providers_found ? (
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={48} color={colors.onSurfaceVariant} />
            <Text style={styles.noResultsText}>No providers found matching your criteria.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.retryText}>Try Different Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* AI Recommendation */}
            {data?.overall_recommendation && (
              <View style={styles.recommendationCard}>
                <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
                <Text style={styles.recommendationText}>{data.overall_recommendation}</Text>
              </View>
            )}

            <Text style={styles.topMatchesTitle}>Top Matches</Text>
            {data?.ranked_providers?.map((rp, index) => (
              <ProviderCard key={index} data={rp} rank={index + 1} onBook={handleBook} isTopRank={index === 0} />
            ))}
          </>
        )}

        {/* Agent Trace Timeline */}
        {data?.agent_trace && data.agent_trace.length > 0 && (
          <View style={styles.traceSection}>
            <Text style={styles.traceSectionTitle}>AI SELECTION PROCESS</Text>
            <View style={styles.traceTimeline}>
              {data.agent_trace.map((step, idx) => (
                <View key={idx} style={styles.traceStep}>
                  <View style={styles.traceNode}>
                    <MaterialIcons name="check" size={14} color={colors.onSecondary} />
                  </View>
                  <View style={styles.traceContent}>
                    <Text style={styles.traceStepTitle}>{step.agent}</Text>
                    <Text style={styles.traceStepSub}>{step.time_ms}ms</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.viewTraceBtn}
              onPress={() => navigation.navigate('AgentTrace', { traceData: data.agent_trace! })}
            >
              <MaterialIcons name="analytics" size={20} color={colors.primary} />
              <Text style={styles.viewTraceBtnText}>View Full Agent Trace</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="home" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive} onPress={() => navigation.navigate('MyBookings')}>
          <MaterialIcons name="calendar-month" size={24} color={colors.onPrimaryContainer} />
          <Text style={styles.navLabelActive}>My Bookings</Text>
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
  container: { flex: 1, backgroundColor: colors.surface, ...Platform.select({ web: { height: '100vh' as any, overflow: 'hidden' as any }, default: {} }) },
  loadingContainer: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.primary },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  // Loading
  loadingContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingBrainIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.aiInsight, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.primary },
  loadingTitle: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  loadingDesc: { fontSize: 13, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 20 },
  progressBarTrack: { width: '80%', height: 6, backgroundColor: colors.surfaceContainerHighest, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: colors.secondary, marginBottom: 24 },
  loadingPipeline: { width: '100%', paddingHorizontal: 24, gap: 0, marginBottom: 24 },
  loadingStep: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, position: 'relative' },
  connectorLine: { position: 'absolute', left: 19, top: -6, width: 2, height: 16, backgroundColor: colors.outlineVariant },
  connectorLineDone: { backgroundColor: colors.secondary },
  loadingStepIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.outlineVariant },
  loadingStepIconActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  loadingStepIconDone: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  loadingStepTextWrap: { flex: 1 },
  loadingStepText: { fontSize: 14, color: colors.outline },
  loadingStepTextActive: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  loadingStepTextDone: { color: colors.secondary, fontWeight: '500' },
  loadingStepDots: { fontSize: 10, color: colors.primary, marginTop: 2, letterSpacing: 2 },
  loadingStepCheck: { fontSize: 11, color: colors.secondary, fontWeight: '600', marginTop: 1 },
  loadingSubtext: { fontSize: 13, color: colors.onSurfaceVariant },
  // Error
  errorText: { color: colors.error, fontSize: 16, marginTop: 16, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  retryText: { color: colors.onPrimary, fontWeight: '600' },
  goBackBtn: { marginTop: 16 },
  goBackText: { color: colors.primary, fontWeight: '600' },
  // Clarification
  clarificationContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  clarificationCard: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 16, padding: 32, alignItems: 'center', elevation: 4 },
  clarificationIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.aiInsight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  clarificationTitle: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  clarificationText: { fontSize: 16, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  primaryBtn: { height: 56, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.onPrimary },
  // Main
  main: { flex: 1, paddingHorizontal: 16 },
  // Recommendation
  recommendationCard: { flexDirection: 'row', gap: 12, backgroundColor: colors.aiInsight, borderRadius: 8, padding: 12, marginTop: 16, borderWidth: 1, borderColor: 'rgba(0,69,13,0.1)' },
  recommendationText: { flex: 1, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  // Intent Card
  intentCard: { backgroundColor: colors.primaryContainer, padding: 16, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: 'rgba(0,69,13,0.2)', elevation: 2 },
  intentHeader: { flexDirection: 'row', gap: 12 },
  intentIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  intentTitle: { fontSize: 20, fontWeight: '600', color: colors.onPrimaryContainer, marginBottom: 12 },
  intentGrid: { flexDirection: 'row', gap: 8 },
  intentChip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  intentChipLabel: { fontSize: 12, fontWeight: '600', color: colors.onPrimaryContainer, opacity: 0.8, letterSpacing: 0.5 },
  intentChipValue: { fontSize: 14, fontWeight: '700', color: colors.onPrimaryContainer, marginTop: 2 },
  // No Results
  noResultsContainer: { alignItems: 'center', paddingVertical: 48 },
  noResultsText: { color: colors.onSurfaceVariant, fontSize: 16, marginTop: 16, textAlign: 'center' },
  // Top Matches
  topMatchesTitle: { fontSize: 20, fontWeight: '600', color: colors.onSurface, marginTop: 16, marginBottom: 12 },
  // Trace
  traceSection: { paddingVertical: 16, alignItems: 'center' },
  traceSectionTitle: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 16 },
  traceTimeline: { width: '100%', paddingLeft: 32, gap: 24, position: 'relative' },
  traceStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  traceNode: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  traceContent: {},
  traceStepTitle: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  traceStepSub: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant },
  viewTraceBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewTraceBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  // Bottom Nav
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 64, backgroundColor: colors.surfaceContainer, borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8 },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: colors.primaryContainer, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 2 },
  navLabelActive: { fontSize: 10, fontWeight: '500', color: colors.onPrimaryContainer, marginTop: 2 },
});
