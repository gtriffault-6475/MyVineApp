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
            <View style={[styles.apogeeChip, { borderColor: apogeeColors[status] }]}>
              <Text style={[styles.apogeeText, { color: apogeeColors[status] }]}>
                {APOGEE_ICONS[status] ? `${APOGEE_ICONS[status]} ` : ''}
                {apogeeLabel}
              </Text>
            </View>
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
    flexDirection: 'row',
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
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
  },
  qtyBadge: {
    borderRadius: radius.full,
    minWidth: 26,
    height: 26,
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
  },
});
