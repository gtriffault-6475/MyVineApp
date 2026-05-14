import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { WineSearchFilters, WineSortOption, LocationType } from '@/types/wine';
import { colors, spacing, radius, font } from '@/components/ui/tokens';

const SORT_OPTIONS: { value: WineSortOption; label: string }[] = [
  { value: 'date_desc', label: 'Plus récent' },
  { value: 'date_asc', label: 'Plus ancien' },
  { value: 'score_desc', label: 'Meilleure note' },
  { value: 'score_asc', label: 'Note croissante' },
  { value: 'name_asc', label: 'Nom A→Z' },
  { value: 'vintage_desc', label: 'Millésime récent' },
];

const LOCATION_OPTIONS: { value: LocationType | null; label: string }[] = [
  { value: null, label: 'Tous' },
  { value: 'home', label: '🏠 Maison' },
  { value: 'friend', label: '👥 Amis' },
  { value: 'restaurant', label: '🍽 Restaurant' },
];

interface Props {
  filters: WineSearchFilters;
  onChange: (filters: WineSearchFilters) => void;
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function ChipRow<T>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ScoreInput({
  value,
  placeholder,
  onChange,
}: {
  value: number | null;
  placeholder: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <TextInput
      style={styles.scoreInput}
      value={value !== null ? String(value) : ''}
      onChangeText={(t) => {
        const n = parseInt(t, 10);
        if (t === '') {
          onChange(null);
        } else if (!isNaN(n) && n >= 1 && n <= 10) {
          onChange(n);
        }
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType="number-pad"
      maxLength={2}
    />
  );
}

function DateInput({
  value,
  placeholder,
  onChange,
}: {
  value: string | null;
  placeholder: string;
  onChange: (v: string | null) => void;
}) {
  return (
    <TextInput
      style={styles.dateInput}
      value={value ?? ''}
      onChangeText={(t) => {
        if (t === '') {
          onChange(null);
        } else {
          onChange(t);
        }
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

export function SearchFilters({ filters, onChange }: Props) {
  const set = <K extends keyof WineSearchFilters>(key: K, value: WineSearchFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <View style={styles.container}>
      <SectionLabel>Trier par</SectionLabel>
      <ChipRow
        options={SORT_OPTIONS}
        selected={filters.sortBy}
        onSelect={(v) => set('sortBy', v)}
      />

      <SectionLabel>Lieu</SectionLabel>
      <ChipRow
        options={LOCATION_OPTIONS}
        selected={filters.locationType}
        onSelect={(v) => set('locationType', v)}
      />

      <SectionLabel>Note (1–10)</SectionLabel>
      <View style={styles.rangeRow}>
        <ScoreInput
          value={filters.scoreMin}
          placeholder="Min"
          onChange={(v) => set('scoreMin', v)}
        />
        <Text style={styles.rangeSep}>–</Text>
        <ScoreInput
          value={filters.scoreMax}
          placeholder="Max"
          onChange={(v) => set('scoreMax', v)}
        />
      </View>

      <SectionLabel>Date de dégustation</SectionLabel>
      <View style={styles.rangeRow}>
        <DateInput
          value={filters.dateFrom}
          placeholder="Du  AAAA-MM-JJ"
          onChange={(v) => set('dateFrom', v)}
        />
        <Text style={styles.rangeSep}>–</Text>
        <DateInput
          value={filters.dateTo}
          placeholder="Au  AAAA-MM-JJ"
          onChange={(v) => set('dateTo', v)}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>À racheter uniquement</Text>
        <Switch
          value={filters.buyAgainOnly}
          onValueChange={(v) => set('buyAgainOnly', v)}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionLabel: {
    fontSize: font.sizeSm,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: font.sizeSm,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreInput: {
    width: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: font.sizeMd,
    color: colors.text,
    backgroundColor: colors.white,
    textAlign: 'center',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: font.sizeSm,
    color: colors.text,
    backgroundColor: colors.white,
  },
  rangeSep: {
    fontSize: font.sizeMd,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontSize: font.sizeMd,
    color: colors.text,
  },
});
