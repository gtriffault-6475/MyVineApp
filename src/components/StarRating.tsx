import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from './ui/tokens';

interface Props {
  score: number | null;
  onChange?: (score: number) => void;
  readOnly?: boolean;
  size?: number;
}

// Maps 1–5 stars to 2–10 score values
const STAR_VALUES = [2, 4, 6, 8, 10];

export function StarRating({ score, onChange, readOnly = false, size = 28 }: Props) {
  const filledStars = score !== null ? Math.round(score / 2) : 0;

  return (
    <View style={styles.row}>
      {STAR_VALUES.map((val, idx) => {
        const filled = idx < filledStars;
        const star = filled ? '★' : '☆';
        return readOnly ? (
          <Text
            key={val}
            style={[
              styles.star,
              { fontSize: size, color: filled ? colors.scoreGold : colors.border },
            ]}
          >
            {star}
          </Text>
        ) : (
          <TouchableOpacity
            key={val}
            onPress={() => onChange?.(val)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text
              style={[
                styles.star,
                { fontSize: size, color: filled ? colors.scoreGold : colors.border },
              ]}
            >
              {star}
            </Text>
          </TouchableOpacity>
        );
      })}
      {score !== null && (
        <Text style={styles.label}>{score.toFixed(1)}</Text>
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
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
