import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from './ui/TextInput';
import { Button } from './ui/Button';
import { LabelPhoto } from './LabelPhoto';
import { StarRating } from './StarRating';
import { ScorePicker } from './ScorePicker';
import { LocationPicker } from './LocationPicker';
import { BuyAgainToggle } from './BuyAgainToggle';
import { DatePickerField } from './DatePickerField';
import { RestaurantAutocomplete } from './RestaurantAutocomplete';
import type { WineForm as WineFormType } from '../types/wine';
import { colors, spacing, font } from './ui/tokens';

interface FormErrors {
  name?: string;
  vintage?: string;
  drunk_at?: string;
}

interface Props {
  form: WineFormType;
  errors: FormErrors;
  update: <K extends keyof WineFormType>(key: K, value: WineFormType[K]) => void;
  onSubmit: () => void;
  onPickPhoto: () => void;
  photoFullUri: string | null;
  submitting?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

export function WineForm({
  form,
  errors,
  update,
  onSubmit,
  onPickPhoto,
  photoFullUri,
  submitting,
  submitLabel = 'Enregistrer',
  showCancel,
  onCancel,
}: Props) {
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical
        >
        <LabelPhoto
          uri={photoFullUri}
          onPress={onPickPhoto}
          height={220}
        />

        <View style={styles.section}>
          <TextInput
            label="Nom du vin *"
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
          <Text style={styles.sectionTitle}>Note</Text>
          <ScorePicker score={form.score} onChange={(s) => update('score', s)} />
          {form.score !== null && (
            <View style={styles.starsPreview}>
              <StarRating score={form.score} readOnly size={20} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Où ?</Text>
          <LocationPicker
            value={form.location_type}
            onChange={(v) => update('location_type', v)}
          />
          {form.location_type === 'restaurant' && (
            <RestaurantAutocomplete
              value={form.restaurant_name}
              onChangeText={(v) => update('restaurant_name', v)}
              containerStyle={styles.restaurantInput}
            />
          )}
        </View>

        <View style={styles.section}>
          <TextInput
            label="Avec qui"
            value={form.companion}
            onChangeText={(v) => update('companion', v)}
            placeholder="ex: Marie, famille, collègues…"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <DatePickerField
            label="Date"
            value={form.drunk_at ?? ''}
            onChange={(v) => update('drunk_at', v)}
            error={errors.drunk_at}
          />

          <TextInput
            label="Accord mets-vins"
            value={form.food_pairing}
            onChangeText={(v) => update('food_pairing', v)}
            placeholder="ex: Magret de canard, fromages…"
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.section}>
          <TextInput
            label="Commentaire"
            value={form.comment}
            onChangeText={(v) => update('comment', v)}
            placeholder="Notes de dégustation, impressions…"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.commentInput}
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.section}>
          <BuyAgainToggle
            value={form.buy_again}
            onChange={(v) => update('buy_again', v)}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title={submitLabel}
            onPress={onSubmit}
            loading={submitting}
          />
          {showCancel && onCancel && (
            <Button
              title="Annuler"
              variant="ghost"
              onPress={onCancel}
              style={styles.cancelBtn}
            />
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  vintageInput: {
    width: 90,
  },
  restaurantInput: {
    marginTop: spacing.md,
  },
  starsPreview: {
    marginTop: -spacing.xs,
  },
  commentInput: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelBtn: {
    marginTop: -spacing.xs,
  },
});
