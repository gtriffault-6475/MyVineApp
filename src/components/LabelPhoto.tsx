import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, spacing, radius, font } from './ui/tokens';

interface Props {
  uri: string | null;
  onPress?: () => void;
  readOnly?: boolean;
  height?: number;
  loading?: boolean;
}

export function LabelPhoto({ uri, onPress, readOnly = false, height = 200, loading }: Props) {
  if (loading) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (uri) {
    return (
      <TouchableOpacity
        onPress={readOnly ? undefined : onPress}
        activeOpacity={readOnly ? 1 : 0.8}
        style={[styles.imageContainer, { height }]}
        disabled={readOnly}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
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
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderIcon}>🍷</Text>
        <Text style={styles.placeholderText}>Pas de photo</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.placeholder, { height }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.placeholderIcon}>📷</Text>
      <Text style={styles.placeholderText}>Ajouter une photo</Text>
      <Text style={styles.placeholderSub}>de l'étiquette</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
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
    color: colors.white,
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
  },
  placeholder: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
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
    color: colors.textMuted,
  },
  placeholderSub: {
    fontSize: font.sizeSm,
    color: colors.textLight,
  },
});
