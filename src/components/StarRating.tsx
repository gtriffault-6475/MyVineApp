import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { spacing } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  score: number | null;
  onChange?: (score: number) => void;
  readOnly?: boolean;
  size?: number;
}

const STAR_VALUES = [2, 4, 6, 8, 10];

export function StarRating({ score, onChange, readOnly = false, size = 28 }: Props) {
  const { colors } = useTheme();
  const filledStars = score !== null ? Math.round(score / 2) : 0;

  return (
    <View style={styles.row}>
      {STAR_VALUES.map((val, idx) => {
        const filled = idx < filledStars;
        const star = filled ? '★' : '☆';
        const color = filled ? colors.scoreGold : colors.border;
        return readOnly ? (
          <Text key={val} style={[styles.star, { fontSize: size, color }]}>
            {star}
          </Text>
        ) : (
          <TouchableOpacity
            key={val}
            onPress={() => onChange?.(val)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.star, { fontSize: size, color }]}>{star}</Text>
          </TouchableOpacity>
        );
      })}
      {score !== null && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{score.toFixed(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  star: {
    lineHeight: undefined,
  },
  label: {
    fontSize: 13,
    marginLeft: spacing.xs,
  },
});
