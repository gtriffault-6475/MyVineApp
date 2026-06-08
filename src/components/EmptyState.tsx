import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './ui/Button';
import { spacing, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  icon?: string;
  title?: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({
  icon = '🍷',
  title = 'Votre cave est vide',
  message = 'Commencez par ajouter un vin que vous avez dégusté.',
  action,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {action && (
        <Button title={action.label} onPress={action.onPress} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: font.sizeXxl,
    fontWeight: font.weightBold,
    textAlign: 'center',
  },
  message: {
    fontSize: font.sizeLg,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
});
