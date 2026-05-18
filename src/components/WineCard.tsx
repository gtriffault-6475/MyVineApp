import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import RNFS from 'react-native-fs';
import type { Wine } from '../types/wine';
import { StarRating } from './StarRating';
import { colors, spacing, radius, font, shadow } from './ui/tokens';

const LOCATION_LABELS: Record<Wine['location_type'], string> = {
  home: 'À la maison',
  friend: 'Chez des amis',
  restaurant: 'Restaurant',
};

interface Props {
  wine: Wine;
  onPress: () => void;
}

export function WineCard({ wine, onPress }: Props) {
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
        year: 'numeric',
      })
    : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.thumb}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbEmoji}>🍷</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {wine.name}
            {wine.vintage ? ` ${wine.vintage}` : ''}
          </Text>
          {wine.buy_again === 1 && <Text style={styles.buyBadge}>↺</Text>}
        </View>

        {(wine.producer || wine.appellation) ? (
          <Text style={styles.sub} numberOfLines={1}>
            {[wine.producer, wine.appellation].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {wine.score !== null ? (
            <StarRating score={wine.score} readOnly size={14} />
          ) : (
            <Text style={styles.noScore}>Non noté</Text>
          )}
          <View style={styles.meta}>
            <Text style={styles.metaText}>{locationLabel}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.metaText}>{drunkDate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    ...shadow.sm,
  },
  thumb: {
    width: 80,
    alignSelf: 'stretch',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  thumbEmoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: font.sizeLg,
    fontWeight: font.weightSemibold,
    color: colors.text,
  },
  buyBadge: {
    fontSize: 16,
    color: colors.success,
  },
  sub: {
    fontSize: font.sizeSm,
    color: colors.textMuted,
  },
  footer: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  noScore: {
    fontSize: font.sizeSm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: font.sizeSm,
    color: colors.textLight,
  },
  dot: {
    fontSize: font.sizeSm,
    color: colors.textLight,
  },
});
