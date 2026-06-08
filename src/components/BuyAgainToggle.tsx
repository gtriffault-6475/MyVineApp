import React from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';
import { spacing, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function BuyAgainToggle({ value, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: colors.text }]}>À racheter</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>Envie d'en racheter une bouteille ?</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.success }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.lg,
  },
  label: {
    fontSize: font.sizeLg,
    fontWeight: font.weightMedium,
  },
  sub: {
    fontSize: font.sizeSm,
    marginTop: 2,
  },
});
