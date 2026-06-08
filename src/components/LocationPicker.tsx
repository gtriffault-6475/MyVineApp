import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { LocationType } from '../types/wine';
import { spacing, radius, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, active && { backgroundColor: colors.primary }]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.label, { color: colors.textMuted }, active && styles.activeLabel]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: font.weightSemibold,
  },
});
