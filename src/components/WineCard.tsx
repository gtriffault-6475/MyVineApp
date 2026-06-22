import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import RNFS from 'react-native-fs';
import type { Wine } from '../types/wine';
import { StarRating } from './StarRating';
import { spacing, radius, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

const LOCATION_LABELS: Record<Wine['location_type'], string> = {
  home: 'À la maison',
  friend: 'Chez des amis',
  restaurant: 'Restaurant',
};

interface Props {
  wine: Wine;
  onPress: () => void;
}

const CARD_HEIGHT = 74;
const THUMB_WIDTH = 66;

export function WineCard({ wine, onPress }: Props) {
  const { colors, shadow, serifFontWine } = useTheme();

  const photoUri = wine.photo_uri
    ? `file://${RNFS.DocumentDirectoryPath}/${wine.photo_uri}`
    : null;

  const locationLabel =
    wine.location_type === 'restaurant' && wine.restaurant_name
      ? wine.restaurant_name
      : LOCATION_LABELS[wine.location_type];

  const drunkDate = wine.drunk_at
    ? new Date(wine.drunk_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : '';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.sm]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.thumb}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={styles.thumbEmoji}>🍷</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, { color: colors.text }, serifFontWine]}
            numberOfLines={1}
          >
            {wine.name}
            {wine.vintage ? ` ${wine.vintage}` : ''}
          </Text>
          {wine.buy_again === 1 && <Text style={[styles.buyBadge, { color: colors.success }]}>↺</Text>}
        </View>

        {(wine.producer || wine.appellation) ? (
          <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
            {[wine.producer, wine.appellation].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {wine.score !== null ? (
            <StarRating score={wine.score} readOnly size={12} />
          ) : (
            <Text style={[styles.noScore, { color: colors.textLight }]}>—</Text>
          )}
          <Text style={[styles.dot, { color: colors.textLight }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.textLight }]} numberOfLines={1}>
            {locationLabel}
          </Text>
          {drunkDate ? (
            <>
              <Text style={[styles.dot, { color: colors.textLight }]}>·</Text>
              <Text style={[styles.metaText, { color: colors.textLight }]}>{drunkDate}</Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: CARD_HEIGHT,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: font.sizeMd,
    fontWeight: font.weightSemibold,
  },
  buyBadge: {
    fontSize: 14,
  },
  sub: {
    fontSize: font.sizeSm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noScore: {
    fontSize: font.sizeSm,
  },
  metaText: {
    fontSize: font.sizeSm,
    flexShrink: 1,
  },
  dot: {
    fontSize: font.sizeSm,
  },
});
