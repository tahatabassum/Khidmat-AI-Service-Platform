import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { RankedProvider } from '../types';
import { colors } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Map removed for web compatibility
interface Props {
  data: RankedProvider;
  rank: number;
  onBook: (providerId: number, slot: string, price: number) => void;
  isTopRank?: boolean;
}

export default function ProviderCard({ data, rank, onBook, isTopRank = false }: Props) {
  const { provider, match_info, pricing } = data;

  // Parse slots
  let slots: string[] = [];
  try {
    slots = JSON.parse(provider.slots);
  } catch (e) {}

  const quotedPrice = pricing?.quoted_price || provider.price_per_hour || 1500;

  // Map coordinates for Pakistani areas
  const areaCoords: Record<string, { lat: number; lng: number }> = {
    'G-13': { lat: 33.6361, lng: 72.9748 }, 'F-10': { lat: 33.6938, lng: 73.0115 },
    'I-8': { lat: 33.6653, lng: 73.0647 }, 'G-9': { lat: 33.6844, lng: 73.0378 },
    'F-7': { lat: 33.7166, lng: 73.0551 }, 'DHA': { lat: 33.5322, lng: 73.0992 },
    'Gulshan': { lat: 24.9215, lng: 67.0928 }, 'Defence': { lat: 24.7940, lng: 67.0719 },
    'Clifton': { lat: 24.8138, lng: 67.0289 }, 'PECHS': { lat: 24.8732, lng: 67.0677 },
    'Gulberg': { lat: 31.5150, lng: 74.3465 }, 'Model Town': { lat: 31.4805, lng: 74.3239 },
    'Johar Town': { lat: 31.4685, lng: 74.2714 }, 'Bahria': { lat: 33.5157, lng: 73.0877 },
    'Saddar': { lat: 33.5975, lng: 73.0508 }, 'PWD': { lat: 33.5623, lng: 73.1095 },
    'Chaklala': { lat: 33.6137, lng: 73.0844 }, 'Westridge': { lat: 33.5847, lng: 73.0347 },
  };
  const coords = areaCoords[provider.area] || { lat: 33.6844, lng: 73.0478 };
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=150&center=lonlat:${coords.lng},${coords.lat}&zoom=14&apiKey=demo`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <View style={[styles.card, !isTopRank && styles.cardFaded]}>
      <View style={styles.cardInner}>
        {/* Top Row: Photo + Info */}
        <View style={styles.topRow}>
          {/* Avatar placeholder with rank badge */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBox}>
              <MaterialIcons name="person" size={36} color={colors.onSurfaceVariant} />
            </View>
            <View style={[styles.rankBadge, isTopRank ? styles.rankBadgeGold : styles.rankBadgeGray]}>
              <Text style={[styles.rankText, isTopRank ? styles.rankTextGold : styles.rankTextGray]}>#{rank} Rank</Text>
            </View>
          </View>

          {/* Provider Info */}
          <View style={styles.providerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={14} color={colors.onSecondaryContainer} />
                <Text style={styles.ratingText}>{provider.rating} ({provider.total_reviews})</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.locationText}>{provider.distance_km} km away</Text>
            </View>
            {isTopRank && (
              <View style={styles.tagsRow}>
                <View style={styles.tag}><Text style={styles.tagText}>{provider.skill_level}</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>{provider.service_type}</Text></View>
              </View>
            )}
          </View>
        </View>

        {/* AI Reasoning Box */}
        <View style={[styles.aiReasoningBox, !isTopRank && styles.aiReasoningBoxFaded]}>
          <MaterialIcons name="smart-toy" size={20} color={isTopRank ? colors.primary : 'rgba(0,69,13,0.6)'} />
          <View style={styles.aiReasoningContent}>
            {isTopRank && <Text style={styles.aiReasoningLabel}>KHIDMAT AI MATCH</Text>}
            <Text style={styles.aiReasoningText}>{match_info?.reasoning || 'Selected based on proximity, ratings, and specialization.'}</Text>
          </View>
        </View>

        {/* Price + Book section */}
        {isTopRank && <View style={styles.divider} />}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Estimated Total</Text>
            <Text style={[styles.price, isTopRank ? styles.priceLarge : styles.priceSmall]}>Rs. {quotedPrice.toLocaleString()}</Text>
          </View>
          {isTopRank ? (
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => onBook(provider.id, slots[0] || '10:00-11:00', quotedPrice)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => onBook(provider.id, slots[0] || '10:00-11:00', quotedPrice)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Price breakdown bar for top rank */}
        {isTopRank && (
          <>
            <View style={styles.priceBar}>
              <View style={[styles.priceBarSegment, { flex: 7, backgroundColor: colors.secondary }]} />
              <View style={[styles.priceBarSegment, { flex: 2, backgroundColor: colors.tertiaryFixedDim }]} />
              <View style={[styles.priceBarSegment, { flex: 1, backgroundColor: colors.primaryFixed }]} />
            </View>
            <View style={styles.priceBarLabels}>
              <Text style={styles.priceBarLabel}>Labor (70%)</Text>
              <Text style={styles.priceBarLabel}>Materials (20%)</Text>
              <Text style={styles.priceBarLabel}>Fee (10%)</Text>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapContainer}>
              <TouchableOpacity onPress={() => Linking.openURL(googleMapsUrl)} activeOpacity={0.9}>
                <Image source={{ uri: mapUrl }} style={styles.mapView} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapLabel} onPress={() => Linking.openURL(googleMapsUrl)} activeOpacity={0.8}>
                <MaterialIcons name="map" size={16} color={colors.primary} />
                <Text style={styles.mapLabelText}>{provider.area}, {provider.city}</Text>
                <MaterialIcons name="open-in-new" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, overflow: 'hidden', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardFaded: { opacity: 0.9 },
  cardInner: { padding: 16 },
  // Top Row
  topRow: { flexDirection: 'row', gap: 16 },
  avatarContainer: { position: 'relative' },
  avatarBox: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  rankBadge: { position: 'absolute', top: -8, left: -8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, elevation: 2 },
  rankBadgeGold: { backgroundColor: colors.tertiaryContainer },
  rankBadgeGray: { backgroundColor: colors.surfaceContainerHighest },
  rankText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  rankTextGold: { color: colors.onTertiaryContainer },
  rankTextGray: { color: colors.onSurfaceVariant },
  // Provider Info
  providerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  providerName: { fontSize: 20, fontWeight: '600', color: colors.onSurface },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondaryContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  ratingText: { fontSize: 12, fontWeight: '600', color: colors.onSecondaryContainer, marginLeft: 4, letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 14, color: colors.onSurfaceVariant },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { backgroundColor: colors.surfaceContainerHighest, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  // AI Reasoning
  aiReasoningBox: { flexDirection: 'row', gap: 12, backgroundColor: colors.aiInsight, borderRadius: 8, padding: 12, marginTop: 16, borderWidth: 1, borderColor: 'rgba(0,69,13,0.1)' },
  aiReasoningBoxFaded: { backgroundColor: 'rgba(232,245,233,0.5)', borderColor: 'rgba(0,69,13,0.05)' },
  aiReasoningContent: { flex: 1 },
  aiReasoningLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 1, marginBottom: 4 },
  aiReasoningText: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  // Price
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginTop: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  priceLabel: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  price: { fontWeight: '700', color: colors.secondary },
  priceLarge: { fontSize: 24 },
  priceSmall: { fontSize: 20 },
  bookButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  bookButtonText: { fontSize: 20, fontWeight: '600', color: colors.onPrimary },
  detailsButton: { borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  detailsButtonText: { fontSize: 12, fontWeight: '600', color: colors.primary, letterSpacing: 0.5 },
  // Price bar
  priceBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  priceBarSegment: { height: '100%' },
  priceBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  priceBarLabel: { fontSize: 10, fontWeight: '500', color: colors.onSurfaceVariant },
  // Map
  mapContainer: { marginTop: 12, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.outlineVariant },
  mapView: { height: 120, width: '100%' },
  mapLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surfaceContainerLowest },
  mapLabelText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.onSurface },
});
