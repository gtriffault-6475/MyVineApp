import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, font } from './ui/tokens';

interface Props {
  score: number | null;
  onChange: (score: number | null) => void;
}

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function scoreColor(s: number): string {
  if (s <= 3) return '#D04040';
  if (s <= 5) return '#D0883A';
  if (s <= 7) return '#C9A84C';
  if (s <= 8) return '#7AB648';
  return '#4A9060';
}

export function ScorePicker({ score, onChange }: Props) {
  return (
    <View>
      <View style={styles.row}>
        {SCORES.map((s) => {
          const active = score === s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.bubble,
                active && { backgroundColor: scoreColor(s), borderColor: scoreColor(s) },
              ]}
              onPress={() => onChange(active ? null : s)}
              activeOpacity={0.75}
            >
              <Text style={[styles.label, active && styles.activeLabel]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>Mauvais</Text>
        <Text style={styles.legend}>Excellent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.white,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  legend: {
    fontSize: font.sizeSm,
    color: colors.textLight,
  },
});
