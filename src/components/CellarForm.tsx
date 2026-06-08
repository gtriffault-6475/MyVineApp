import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from './ui/TextInput';
import { Button } from './ui/Button';
import { DatePickerField } from './DatePickerField';
import { LabelPhoto } from './LabelPhoto';
import type { CellarForm as CellarFormType } from '../types/cellar';
import { spacing, font } from './ui/tokens';
import { useTheme } from '@/context/ThemeContext';

interface FormErrors {
  name?: string;
  quantity?: string;
  optimal_from?: string;
  optimal_to?: string;
  vintage?: string;
}

interface Props {
  initialForm: CellarFormType;
  onSubmit: (form: CellarFormType) => void;
  photoFullUri: string | null;
  onPickPhoto: () => void;
  submitting?: boolean;
  submitLabel?: string;
  onCancel: () => void;
}

export function CellarForm({
  initialForm,
  onSubmit,
  photoFullUri,
  onPickPhoto,
  submitting,
  submitLabel = 'Enregistrer',
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const [form, setForm] = useState<CellarFormType>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof CellarFormType>(key: K, value: CellarFormType[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      newErrors.quantity = 'Quantité invalide (min. 1)';
    }
    if (form.vintage) {
      const v = parseInt(form.vintage, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(v) || v < 1800 || v > currentYear + 5) {
        newErrors.vintage = `Millésime invalide (1800–${currentYear + 5})`;
      }
    }
    if (form.optimal_from && form.optimal_to) {
      const from = parseInt(form.optimal_from, 10);
      const to = parseInt(form.optimal_to, 10);
      if (!isNaN(from) && !isNaN(to) && from > to) {
        newErrors.optimal_to = 'La fin doit être après le début';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (validate()) {
      onSubmit(form);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.kav, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LabelPhoto uri={photoFullUri} onPress={onPickPhoto} height={180} />

        <View style={styles.section}>
          <TextInput
            label="Nom de la bouteille *"
            value={form.name}
            onChangeText={(v) => update('name', v)}
            placeholder="ex: Château Margaux"
            error={errors.name}
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <TextInput
              label="Producteur"
              value={form.producer}
              onChangeText={(v) => update('producer', v)}
              placeholder="ex: Domaine Leflaive"
              containerStyle={styles.flex}
            />
            <TextInput
              label="Millésime"
              value={form.vintage}
              onChangeText={(v) => update('vintage', v)}
              placeholder="ex: 2019"
              keyboardType="numeric"
              maxLength={4}
              error={errors.vintage}
              containerStyle={styles.vintageInput}
            />
          </View>

          <TextInput
            label="Appellation"
            value={form.appellation}
            onChangeText={(v) => update('appellation', v)}
            placeholder="ex: Pomerol, Chablis Premier Cru…"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Stock</Text>
          <View style={styles.row}>
            <TextInput
              label="Quantité *"
              value={form.quantity}
              onChangeText={(v) => update('quantity', v)}
              keyboardType="numeric"
              maxLength={4}
              error={errors.quantity}
              containerStyle={styles.qtyInput}
            />
            <TextInput
              label="Emplacement"
              value={form.storage_location}
              onChangeText={(v) => update('storage_location', v)}
              placeholder="ex: Casier 3, rangée A"
              containerStyle={styles.flex}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Apogée</Text>
          <View style={styles.row}>
            <TextInput
              label="De"
              value={form.optimal_from}
              onChangeText={(v) => update('optimal_from', v)}
              placeholder="ex: 2026"
              keyboardType="numeric"
              maxLength={4}
              containerStyle={styles.yearInput}
            />
            <TextInput
              label="À"
              value={form.optimal_to}
              onChangeText={(v) => update('optimal_to', v)}
              placeholder="ex: 2035"
              keyboardType="numeric"
              maxLength={4}
              error={errors.optimal_to}
              containerStyle={styles.yearInput}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Achat</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <DatePickerField
                label="Date d'achat"
                modalTitle="Date d'achat"
                value={form.purchase_date}
                onChange={(v) => update('purchase_date', v)}
              />
            </View>
            <TextInput
              label="Prix (€)"
              value={form.purchase_price}
              onChangeText={(v) => update('purchase_price', v)}
              placeholder="ex: 24.90"
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TextInput
            label="Notes"
            value={form.notes}
            onChangeText={(v) => update('notes', v)}
            placeholder="Caractéristiques, conseils de service…"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={styles.notesInput}
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.actions}>
          <Button title={submitLabel} onPress={handleSubmit} loading={submitting} />
          <Button title="Annuler" variant="ghost" onPress={onCancel} style={styles.cancelBtn} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  flex: { flex: 1 },
  vintageInput: { width: 90 },
  qtyInput: { width: 90 },
  yearInput: { flex: 1 },
  priceInput: { width: 100 },
  notesInput: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelBtn: { marginTop: -spacing.xs },
});
