import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { spacing, radius, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  uri: string | null;
  onPress?: () => void;
  readOnly?: boolean;
  height?: number;
  loading?: boolean;
}

export function LabelPhoto({ uri, onPress, readOnly = false, height = 200, loading }: Props) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.placeholder, { height, backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (uri) {
    return (
      <TouchableOpacity
        onPress={readOnly ? undefined : onPress}
        activeOpacity={readOnly ? 1 : 0.8}
        style={[styles.imageContainer, { height, backgroundColor: colors.surface }]}
        disabled={readOnly}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        {!readOnly && (
          <View style={styles.editBadge}>
            <Text style={styles.editText}>Modifier</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (readOnly) {
    return (
      <View style={[styles.placeholder, { height, backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.placeholderIcon}>🍷</Text>
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Pas de photo</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.placeholder, { height, backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.placeholderIcon}>📷</Text>
      <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Ajouter une photo</Text>
      <Text style={[styles.placeholderSub, { color: colors.textLight }]}>de l'étiquette</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
  },
  placeholder: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholderIcon: {
    fontSize: 36,
  },
  placeholderText: {
    fontSize: font.sizeMd,
    fontWeight: font.weightMedium,
  },
  placeholderSub: {
    fontSize: font.sizeSm,
  },
});
