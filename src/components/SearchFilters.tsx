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
import { spacing, radius, font } from '@/components/ui/tokens';
import { useTheme } from '@/context/ThemeContext';

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

function SectionLabel({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.sectionLabel, { color }]}>{children}</Text>;
}

function ChipRow<T>({
  options,
  selected,
  onSelect,
  colors,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              active && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => onSelect(opt.value)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.textMuted },
                active && { color: colors.white, fontWeight: '600' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function SearchFilters({ filters, onChange }: Props) {
  const { colors } = useTheme();
  const set = <K extends keyof WineSearchFilters>(key: K, value: WineSearchFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <SectionLabel color={colors.textMuted}>Trier par</SectionLabel>
      <ChipRow
        options={SORT_OPTIONS}
        selected={filters.sortBy}
        onSelect={(v) => set('sortBy', v)}
        colors={colors}
      />

      <SectionLabel color={colors.textMuted}>Lieu</SectionLabel>
      <ChipRow
        options={LOCATION_OPTIONS}
        selected={filters.locationType}
        onSelect={(v) => set('locationType', v)}
        colors={colors}
      />

      <SectionLabel color={colors.textMuted}>Note (1–10)</SectionLabel>
      <View style={styles.rangeRow}>
        <TextInput
          style={[styles.scoreInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          value={filters.scoreMin !== null ? String(filters.scoreMin) : ''}
          onChangeText={(t) => {
            const n = parseInt(t, 10);
            if (t === '') {
              set('scoreMin', null);
            } else if (!isNaN(n) && n >= 1 && n <= 10) {
              set('scoreMin', n);
            }
          }}
          placeholder="Min"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={[styles.rangeSep, { color: colors.textMuted }]}>–</Text>
        <TextInput
          style={[styles.scoreInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          value={filters.scoreMax !== null ? String(filters.scoreMax) : ''}
          onChangeText={(t) => {
            const n = parseInt(t, 10);
            if (t === '') {
              set('scoreMax', null);
            } else if (!isNaN(n) && n >= 1 && n <= 10) {
              set('scoreMax', n);
            }
          }}
          placeholder="Max"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      <SectionLabel color={colors.textMuted}>Date de dégustation</SectionLabel>
      <View style={styles.rangeRow}>
        <TextInput
          style={[styles.dateInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          value={filters.dateFrom ?? ''}
          onChangeText={(t) => set('dateFrom', t === '' ? null : t)}
          placeholder="Du  AAAA-MM-JJ"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={[styles.rangeSep, { color: colors.textMuted }]}>–</Text>
        <TextInput
          style={[styles.dateInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          value={filters.dateTo ?? ''}
          onChangeText={(t) => set('dateTo', t === '' ? null : t)}
          placeholder="Au  AAAA-MM-JJ"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>À racheter uniquement</Text>
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
  },
  sectionLabel: {
    fontSize: font.sizeSm,
    fontWeight: '600',
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
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: font.sizeSm,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreInput: {
    width: 64,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: font.sizeMd,
    textAlign: 'center',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: font.sizeSm,
  },
  rangeSep: {
    fontSize: font.sizeMd,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontSize: font.sizeMd,
  },
});
