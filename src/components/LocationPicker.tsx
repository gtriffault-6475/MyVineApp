import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { LocationType } from '../types/wine';
import { colors, spacing, radius, font } from './ui/tokens';

const OPTIONS: { value: LocationType; label: string }[] = [
  { value: 'home', label: 'À la maison' },
  { value: 'friend', label: 'Chez des amis' },
  { value: 'restaurant', label: 'Restaurant' },
];

interface Props {
  value: LocationType;
  onChange: (value: LocationType) => void;
}

export function LocationPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, active && styles.activeOption]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOption: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.white,
    fontWeight: font.weightSemibold,
  },
});
