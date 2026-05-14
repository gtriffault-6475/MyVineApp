import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { saveApiKey, getApiKey, deleteApiKey } from '@/services/wineRecognition';
import { colors, spacing, radius, font } from '@/components/ui/tokens';

export default function SettingsScreen() {
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const key = await getApiKey();
        if (active) {
          setHasKey(!!key);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const handleSave = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      Alert.alert('Clé invalide', "La clé Anthropic commence par « sk-ant- ».");
      return;
    }
    setSaving(true);
    try {
      await saveApiKey(trimmed);
      setHasKey(true);
      setKeyInput('');
      Alert.alert('Clé enregistrée', 'La reconnaissance d\'étiquette est maintenant active.');
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer la clé.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la clé',
      'La reconnaissance automatique des étiquettes sera désactivée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteApiKey();
            setHasKey(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reconnaissance d'étiquette IA</Text>
        <Text style={styles.description}>
          Prenez en photo une étiquette de vin et laissez l'IA (Claude d'Anthropic) remplir
          automatiquement le nom, le producteur, l'appellation et le millésime.
        </Text>

        {hasKey ? (
          <View style={styles.keyStatus}>
            <View style={styles.statusRow}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Clé API configurée</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Supprimer la clé</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.keyForm}>
            <Text style={styles.inputLabel}>Clé API Anthropic</Text>
            <TextInput
              style={styles.input}
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || !keyInput.trim()}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer la clé</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comment obtenir une clé ?</Text>
        <Text style={styles.description}>
          1. Créez un compte sur console.anthropic.com{'\n'}
          2. Dans « API Keys », cliquez « Create Key »{'\n'}
          3. Copiez la clé (elle commence par sk-ant-) et collez-la ici.
        </Text>
        <Text style={styles.note}>
          La clé est stockée de façon sécurisée sur votre appareil et n'est jamais partagée.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: font.sizeMd,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: font.sizeSm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  note: {
    fontSize: font.sizeSm,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  keyStatus: {
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: font.sizeSm,
    color: '#22c55e',
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: font.sizeSm,
    fontWeight: '500',
  },
  keyForm: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: font.sizeSm,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: font.sizeSm,
    color: colors.text,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: font.sizeSm,
  },
});
