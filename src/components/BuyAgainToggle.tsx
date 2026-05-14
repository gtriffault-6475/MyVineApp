import React from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';
import { colors, spacing, font } from './ui/tokens';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function BuyAgainToggle({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>À racheter</Text>
        <Text style={styles.sub}>Envie d'en racheter une bouteille ?</Text>
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
    color: colors.text,
  },
  sub: {
    fontSize: font.sizeSm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
