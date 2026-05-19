import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { colors } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

type AgentTraceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AgentTrace'>;
type AgentTraceScreenRouteProp = RouteProp<RootStackParamList, 'AgentTrace'>;

interface Props {
  navigation: AgentTraceScreenNavigationProp;
  route: AgentTraceScreenRouteProp;
}

const agentIcons: Record<string, string> = {
  'Intent Parser': 'psychology',
  'Provider Discovery': 'travel-explore',
  'Provider Matcher': 'military-tech',
  'Pricing Engine': 'payments',
  'Booking Engine': 'event-available',
  'Follow-up Agent': 'schedule-send',
  'Trace Logger': 'save',
};

const agentLabels: Record<string, string> = {
  'Intent Parser': '1. Intent Parser (NLU)',
  'Provider Discovery': '2. Provider Discovery',
  'Provider Matcher': '3. Provider Matcher (Ranking)',
  'Pricing Engine': '4. Pricing Engine (Dynamic Quote)',
  'Booking Engine': '5. Booking Engine (Slot Check)',
  'Follow-up Agent': '6. Follow-up Scheduler',
  'Trace Logger': '7. Trace Logger',
};

export default function AgentTraceScreen({ navigation, route }: Props) {
  const { traceData } = route.params;

  const isLastStep = (idx: number) => idx === traceData.length - 1;

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
        <View style={styles.avatarSmall}>
          <MaterialIcons name="person" size={18} color={colors.onSurfaceVariant} />
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* AI Intelligence Header */}
        <View style={styles.aiHeader}>
          <View style={styles.aiHeaderRow}>
            <MaterialIcons name="auto-awesome" size={24} color={colors.secondary} />
            <Text style={styles.aiHeaderTitle}>Khidmat AI Orchestration</Text>
          </View>
          <Text style={styles.aiHeaderSubtitle}>
            Our multi-agent system is processing your request in real-time to find the most reliable service provider in your area.
          </Text>
        </View>

        {/* Vertical Agent Trace Timeline */}
        <View style={styles.timeline}>
          {/* Dashed line */}
          <View style={styles.dashedLine} />

          {traceData.map((step: any, idx: number) => {
            const iconName = agentIcons[step.agent] || 'smart-toy';
            const label = agentLabels[step.agent] || `${idx + 1}. ${step.agent}`;
            const isLast = isLastStep(idx);

            return (
              <View key={idx} style={styles.traceItem}>
                {/* Node Icon */}
                <View style={[styles.traceNodeIcon, isLast && styles.traceNodeIconActive]}>
                  <MaterialIcons name={iconName as any} size={20} color={isLast ? colors.onPrimaryContainer : colors.secondary} />
                </View>

                {/* Card */}
                <View style={[styles.traceCard, isLast && styles.traceCardActive]}>
                  <View style={styles.traceCardHeader}>
                    <View>
                      <Text style={styles.traceCardTitle}>{label}</Text>
                      <Text style={[styles.traceCardTime, isLast && styles.traceCardTimeActive]}>
                        {isLast ? 'Active Processing...' : `Completed • ${step.time_ms}ms`}
                      </Text>
                    </View>
                    {!isLast && <MaterialIcons name="check-circle" size={24} color={colors.secondary} />}
                  </View>

                  {/* Output content */}
                  <View style={[styles.traceCardBody, isLast && styles.traceCardBodyActive]}>
                    {typeof step.output === 'string' ? (
                      <Text style={[styles.traceCardBodyText, !isLast && styles.traceCardBodyItalic]}>
                        {step.output}
                      </Text>
                    ) : (
                      <Text style={styles.traceCardBodyText}>
                        {JSON.stringify(step.output, null, 2).substring(0, 200)}
                        {JSON.stringify(step.output).length > 200 ? '...' : ''}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary Action Card */}
        {traceData.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <MaterialIcons name="done-all" size={36} color={colors.primary} />
            </View>
            <Text style={styles.summaryTitle}>Match Ready</Text>
            <Text style={styles.summarySubtitle}>
              AI Orchestration is 95% complete. We have found your best match.
            </Text>
            <TouchableOpacity 
              style={styles.summaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.summaryButtonText}>View Matched Provider</Text>
            </TouchableOpacity>
          </View>
        )}

        {(!traceData || traceData.length === 0) && (
          <View style={styles.emptyState}>
            <MaterialIcons name="info-outline" size={48} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>No trace data available for this session.</Text>
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
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.primary },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, paddingHorizontal: 16 },
  // AI Header
  aiHeader: { backgroundColor: colors.aiInsight, borderWidth: 1, borderColor: colors.secondaryContainer, borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 32 },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  aiHeaderTitle: { fontSize: 20, fontWeight: '600', color: colors.primary },
  aiHeaderSubtitle: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  // Timeline
  timeline: { position: 'relative', paddingLeft: 32 },
  dashedLine: { position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, backgroundColor: 'transparent', borderLeftWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(0,110,28,0.3)' },
  traceItem: { flexDirection: 'row', marginBottom: 32 },
  traceNodeIcon: { position: 'absolute', left: -32, top: 4, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  traceNodeIconActive: { backgroundColor: colors.primaryContainer },
  traceCard: { flex: 1, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  traceCardActive: { borderWidth: 2, borderColor: colors.secondary, elevation: 4 },
  traceCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  traceCardTitle: { fontSize: 12, fontWeight: '600', color: colors.primary, letterSpacing: 0.5 },
  traceCardTime: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 2 },
  traceCardTimeActive: { color: colors.secondary, fontWeight: '700' },
  traceCardBody: { backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(192,201,187,0.3)' },
  traceCardBodyActive: { backgroundColor: colors.surfaceContainerLowest },
  traceCardBodyText: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  traceCardBodyItalic: { fontStyle: 'italic' },
  // Summary
  summaryCard: { marginTop: 24, padding: 24, backgroundColor: colors.surfaceContainer, borderRadius: 12, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  summaryIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  summaryTitle: { fontSize: 20, fontWeight: '600', color: colors.onSurface, marginBottom: 4 },
  summarySubtitle: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 },
  summaryButton: { width: '100%', height: 56, backgroundColor: colors.secondary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryButtonText: { fontSize: 16, fontWeight: '700', color: colors.onSecondary },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 12 },
  // Bottom Nav
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 64, backgroundColor: colors.surfaceContainer, borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8 },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: colors.primaryContainer, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 2 },
  navLabelActive: { fontSize: 10, fontWeight: '500', color: colors.onPrimaryContainer, marginTop: 2 },
});
