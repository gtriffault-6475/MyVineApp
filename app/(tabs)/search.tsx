import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { TextInput } from '@/components/ui/TextInput';
import { WineCard } from '@/components/WineCard';
import { EmptyState } from '@/components/EmptyState';
import { searchWines } from '@/db/queries';
import type { Wine } from '@/types/wine';
import { colors, spacing, font } from '@/components/ui/tokens';

export default function SearchScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [term, setTerm] = useState('');
  const [buyAgainOnly, setBuyAgainOnly] = useState(false);
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    async (text: string, buyOnly: boolean) => {
      setLoading(true);
      setSearched(true);
      try {
        const wines = await searchWines(db, text, buyOnly);
        setResults(wines);
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  const handleChangeText = (text: string) => {
    setTerm(text);
    if (text.length >= 2 || buyAgainOnly) {
      doSearch(text, buyAgainOnly);
    } else if (text.length === 0 && !buyAgainOnly) {
      setResults([]);
      setSearched(false);
    }
  };

  const handleToggleBuyAgain = (val: boolean) => {
    setBuyAgainOnly(val);
    doSearch(term, val);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          value={term}
          onChangeText={handleChangeText}
          placeholder="Vin, producteur, appellation, restaurant…"
          containerStyle={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>À racheter uniquement</Text>
          <Switch
            value={buyAgainOnly}
            onValueChange={handleToggleBuyAgain}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(w) => w.id.toString()}
          renderItem={({ item }) => (
            <WineCard wine={item} onPress={() => router.push(`/wine/${item.id}`)} />
          )}
          contentContainerStyle={
            results.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            searched ? (
              <EmptyState
                title="Aucun résultat"
                message="Essayez d'autres termes de recherche."
              />
            ) : (
              <EmptyState
                title="Recherchez un vin"
                message="Tapez le nom, le producteur, l'appellation ou le restaurant."
              />
            )
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
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: { marginBottom: 0 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  filterLabel: { fontSize: font.sizeMd, color: colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: spacing.md },
  emptyContainer: { flex: 1 },
});
