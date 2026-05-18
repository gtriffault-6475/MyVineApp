import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput } from '@/components/ui/TextInput';
import { WineCard } from '@/components/WineCard';
import { EmptyState } from '@/components/EmptyState';
import { SearchFilters } from '@/components/SearchFilters';
import { searchWines } from '@/db/queries';
import { getDb } from '@/db/database';
import { DEFAULT_FILTERS } from '@/types/wine';
import type { Wine, WineSearchFilters } from '@/types/wine';
import { colors, spacing, font, radius } from '@/components/ui/tokens';
import type { RootStackParamList } from '@/navigation';

function activeFilterCount(filters: WineSearchFilters): number {
  return [
    filters.buyAgainOnly,
    filters.locationType !== null,
    filters.scoreMin !== null || filters.scoreMax !== null,
    filters.dateFrom !== null || filters.dateTo !== null,
    filters.sortBy !== 'date_desc',
  ].filter(Boolean).length;
}

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filters, setFilters] = useState<WineSearchFilters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (f: WineSearchFilters) => {
      setLoading(true);
      try {
        const db = await getDb();
        const wines = await searchWines(db, f);
        setResults(wines);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce text changes, instant for filter changes
  const handleFiltersChange = useCallback(
    (next: WineSearchFilters, instant = false) => {
      setFilters(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (instant) {
        runSearch(next);
      } else {
        debounceRef.current = setTimeout(() => runSearch(next), 300);
      }
    },
    [runSearch]
  );

  // Load all wines on mount
  useEffect(() => {
    runSearch(DEFAULT_FILTERS);
  }, [runSearch]);

  const handleTermChange = (term: string) => {
    handleFiltersChange({ ...filters, term }, false);
  };

  const handleFilterPanelChange = (next: WineSearchFilters) => {
    handleFiltersChange(next, true);
  };

  const handleReset = () => {
    handleFiltersChange(DEFAULT_FILTERS, true);
    setShowFilters(false);
  };

  const count = activeFilterCount(filters);

  return (
    <View style={styles.container}>
      {/* Top bar: search input + filter toggle */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <TextInput
            value={filters.term}
            onChangeText={handleTermChange}
            placeholder="Vin, producteur, appellation, plat…"
            containerStyle={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters((v) => !v)}
          >
            <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>
              Filtres{count > 0 ? ` (${count})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {count > 0 && !showFilters && (
          <TouchableOpacity onPress={handleReset} style={styles.resetBanner}>
            <Text style={styles.resetBannerText}>
              {count} filtre{count > 1 ? 's' : ''} actif{count > 1 ? 's' : ''} — Réinitialiser
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Collapsible filter panel */}
      {showFilters && (
        <View>
          <SearchFilters filters={filters} onChange={handleFilterPanelChange} />
          {count > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Réinitialiser tous les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(w) => w.id.toString()}
          renderItem={({ item }) => (
            <WineCard
              wine={item}
              onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
            />
          )}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Aucun résultat"
              message="Essayez d'autres critères de recherche."
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: font.sizeSm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  resetBanner: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  resetBannerText: {
    fontSize: font.sizeSm,
    color: colors.primary,
    fontWeight: '500',
  },
  resetButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  resetButtonText: {
    fontSize: font.sizeSm,
    color: colors.error,
    fontWeight: '500',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: spacing.md },
  emptyContainer: { flex: 1 },
});
