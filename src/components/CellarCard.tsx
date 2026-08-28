import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import RNFS from 'react-native-fs';
import type { CellarEntry } from '../types/cellar';
import { cellarApogeeLabel, cellarApogeeStatus } from '../types/cellar';
import { spacing, radius, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

const APOGEE_ICONS = {
  peak: '✦',
  past: '↓',
  early: '◎',
  unknown: '',
};

interface Props {
  entry: CellarEntry;
  onPress: () => void;
}

const CARD_HEIGHT = 74;
const THUMB_WIDTH = 66;

export function CellarCard({ entry, onPress }: Props) {
  const { colors, shadow, serifFontWine } = useTheme();

  const apogeeColors = {
    peak: colors.success,
    past: colors.textMuted,
    early: colors.scoreGold,
    unknown: colors.textLight,
  };

  const photoUri = entry.photo_uri
    ? `file://${RNFS.DocumentDirectoryPath}/${entry.photo_uri}`
    : null;
  const apogeeLabel = cellarApogeeLabel(entry);
  const status = cellarApogeeStatus(entry);

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
            <Text style={styles.thumbEmoji}>🍾</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, { color: colors.text }, serifFontWine]}
            numberOfLines={1}
          >
            {entry.name}
            {entry.vintage ? ` ${entry.vintage}` : ''}
          </Text>
          <View style={[styles.qtyBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.qtyText, { color: colors.white }]}>{entry.quantity}</Text>
          </View>
        </View>

        {entry.producer || entry.appellation ? (
          <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
            {[entry.producer, entry.appellation].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {apogeeLabel ? (
            <Text style={[styles.apogeeText, { color: apogeeColors[status] }]} numberOfLines={1}>
              {APOGEE_ICONS[status] ? `${APOGEE_ICONS[status]} ` : ''}
              {apogeeLabel}
            </Text>
          ) : null}
          {apogeeLabel && entry.storage_location ? (
            <Text style={[styles.dot, { color: colors.textLight }]}>·</Text>
          ) : null}
          {entry.storage_location ? (
            <Text style={[styles.location, { color: colors.textLight }]} numberOfLines={1}>
              📦 {entry.storage_location}
            </Text>
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
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: font.sizeMd,
    fontWeight: font.weightSemibold,
  },
  qtyBadge: {
    borderRadius: radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  qtyText: {
    fontSize: font.sizeSm,
    fontWeight: font.weightBold,
  },
  sub: {
    fontSize: font.sizeSm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  apogeeText: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    flexShrink: 1,
  },
  dot: {
    fontSize: font.sizeSm,
  },
  location: {
    fontSize: font.sizeSm,
    flexShrink: 1,
  },
});
