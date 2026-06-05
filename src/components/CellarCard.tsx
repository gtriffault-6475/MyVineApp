import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import RNFS from 'react-native-fs';
import type { CellarEntry } from '../types/cellar';
import { cellarApogeeLabel, cellarApogeeStatus } from '../types/cellar';
import { colors, spacing, radius, font, shadow } from './ui/tokens';

const APOGEE_COLORS = {
  peak: colors.success,
  past: colors.textMuted,
  early: colors.scoreGold,
  unknown: colors.textLight,
};

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

export function CellarCard({ entry, onPress }: Props) {
  const photoUri = entry.photo_uri
    ? `file://${RNFS.DocumentDirectoryPath}/${entry.photo_uri}`
    : null;
  const apogeeLabel = cellarApogeeLabel(entry);
  const status = cellarApogeeStatus(entry);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.thumb}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbEmoji}>🍾</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.name}
            {entry.vintage ? ` ${entry.vintage}` : ''}
          </Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>{entry.quantity}</Text>
          </View>
        </View>

        {entry.producer || entry.appellation ? (
          <Text style={styles.sub} numberOfLines={1}>
            {[entry.producer, entry.appellation].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {apogeeLabel ? (
            <View style={[styles.apogeeChip, { borderColor: APOGEE_COLORS[status] }]}>
              <Text style={[styles.apogeeText, { color: APOGEE_COLORS[status] }]}>
                {APOGEE_ICONS[status] ? `${APOGEE_ICONS[status]} ` : ''}
                {apogeeLabel}
              </Text>
            </View>
          ) : null}
          {entry.storage_location ? (
            <Text style={styles.location} numberOfLines={1}>
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
  qtyBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  qtyText: {
    color: colors.white,
    fontSize: font.sizeSm,
    fontWeight: font.weightBold,
  },
  sub: {
    fontSize: font.sizeSm,
    color: colors.textMuted,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  apogeeChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  apogeeText: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
  },
  location: {
    fontSize: font.sizeSm,
    color: colors.textLight,
  },
});
