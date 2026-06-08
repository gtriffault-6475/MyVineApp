import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { saveApiKey, getApiKey, deleteApiKey } from '@/services/wineRecognition';
import { saveFoursquareKey, getFoursquareKey, deleteFoursquareKey } from '@/services/restaurantSearch';
import { spacing, radius, font } from '@/components/ui/tokens';
import { useTheme, AppearanceMode } from '@/context/ThemeContext';

const APPEARANCE_OPTIONS: { value: AppearanceMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
];

export function SettingsScreen() {
  const { colors, appearance, setAppearance } = useTheme();

  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fsqInput, setFsqInput] = useState('');
  const [hasFsqKey, setHasFsqKey] = useState(false);
  const [fsqSaving, setFsqSaving] = useState(false);

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [key, fsqKey] = await Promise.all([getApiKey(), getFoursquareKey()]);
        if (active) {
          setHasKey(!!key);
          setHasFsqKey(!!fsqKey);
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
      Alert.alert('Clé enregistrée', "La reconnaissance d'étiquette est maintenant active.");
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

  const handleFsqSave = async () => {
    const trimmed = fsqInput.trim();
    if (!trimmed) {
      Alert.alert('Clé invalide', "Veuillez saisir une clé API Foursquare.");
      return;
    }
    setFsqSaving(true);
    try {
      await saveFoursquareKey(trimmed);
      setHasFsqKey(true);
      setFsqInput('');
      Alert.alert('Clé enregistrée', "L'autocomplete restaurant est maintenant actif.");
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer la clé.");
    } finally {
      setFsqSaving(false);
    }
  };

  const handleFsqDelete = () => {
    Alert.alert(
      'Supprimer la clé',
      "L'autocomplete restaurant sera désactivé.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteFoursquareKey();
            setHasFsqKey(false);
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Apparence */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apparence</Text>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          {APPEARANCE_OPTIONS.map((opt) => {
            const active = opt.value === appearance;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.segment,
                  active && [styles.segmentActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setAppearance(opt.value)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: colors.textMuted },
                    active && { color: colors.white, fontWeight: font.weightSemibold },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Clé Anthropic */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reconnaissance d'étiquette IA</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Prenez en photo une étiquette de vin et laissez l'IA (Claude d'Anthropic) remplir
          automatiquement le nom, le producteur, l'appellation et le millésime.
        </Text>

        {hasKey ? (
          <View style={styles.keyStatus}>
            <View style={styles.statusRow}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Clé API configurée</Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: colors.error }]}
              onPress={handleDelete}
            >
              <Text style={[styles.deleteButtonText, { color: colors.error }]}>Supprimer la clé</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.keyForm}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Clé API Anthropic</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || !keyInput.trim()}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.white }]}>Enregistrer la clé</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comment obtenir une clé Anthropic ?</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          1. Créez un compte sur console.anthropic.com{'\n'}
          2. Dans « API Keys », cliquez « Create Key »{'\n'}
          3. Copiez la clé (elle commence par sk-ant-) et collez-la ici.
        </Text>
        <Text style={[styles.note, { color: colors.textMuted }]}>
          La clé est stockée de façon sécurisée sur votre appareil et n'est jamais partagée.
        </Text>
      </View>

      {/* Clé Foursquare */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Autocomplete restaurant</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Lors d'une dégustation en restaurant, obtenez des suggestions de noms en temps réel
          grâce à l'API Foursquare Places.
        </Text>

        {hasFsqKey ? (
          <View style={styles.keyStatus}>
            <View style={styles.statusRow}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Clé API configurée</Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: colors.error }]}
              onPress={handleFsqDelete}
            >
              <Text style={[styles.deleteButtonText, { color: colors.error }]}>Supprimer la clé</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.keyForm}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Clé API Foursquare</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={fsqInput}
              onChangeText={setFsqInput}
              placeholder="Clé API Foursquare"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }, fsqSaving && styles.saveButtonDisabled]}
              onPress={handleFsqSave}
              disabled={fsqSaving || !fsqInput.trim()}
            >
              {fsqSaving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.white }]}>Enregistrer la clé</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comment obtenir une clé Foursquare ?</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          1. Créez un compte sur developer.foursquare.com{'\n'}
          2. Créez un nouveau projet{'\n'}
          3. Copiez la clé API (elle commence par fsq3) et collez-la ici.
        </Text>
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Le plan gratuit inclut 1 000 requêtes/jour, largement suffisant pour un usage personnel.
          La clé est stockée de façon sécurisée sur votre appareil.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: font.sizeMd,
    fontWeight: '600',
  },
  description: {
    fontSize: font.sizeSm,
    lineHeight: 20,
  },
  note: {
    fontSize: font.sizeSm,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: {
    borderRadius: radius.sm,
  },
  segmentLabel: {
    fontSize: font.sizeSm,
  },
  keyStatus: { gap: spacing.sm },
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
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    fontSize: font.sizeSm,
    fontWeight: '500',
  },
  keyForm: { gap: spacing.sm },
  inputLabel: {
    fontSize: font.sizeSm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: font.sizeSm,
  },
  saveButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: {
    fontWeight: '600',
    fontSize: font.sizeSm,
  },
});
