import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCellarContext } from '@/context/CellarContext';
import { CellarCard } from '@/components/CellarCard';
import { EmptyState } from '@/components/EmptyState';
import { colors, spacing, shadow, font, radius } from '@/components/ui/tokens';
import type { RootStackParamList } from '@/navigation';

export function CellarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, reload } = useCellarContext();
  const { entries, loading } = state;
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? entries.filter((e) => {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          (e.producer?.toLowerCase().includes(q) ?? false) ||
          (e.appellation?.toLowerCase().includes(q) ?? false) ||
          (e.storage_location?.toLowerCase().includes(q) ?? false)
        );
      })
    : entries;

  if (loading && entries.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.length > 0 && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans la cave…"
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id.toString()}
        renderItem={({ item }) => (
          <CellarCard
            entry={item}
            onPress={() => navigation.navigate('CellarDetail', { cellarId: item.id })}
          />
        )}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          entries.length === 0 ? (
            <EmptyState
              icon="🍾"
              title="Cave vide"
              message="Ajoutez vos premières bouteilles pour gérer votre cave."
              action={{
                label: 'Ajouter une bouteille',
                onPress: () => navigation.navigate('AddCellarEntry', {}),
              }}
            />
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>Aucun résultat pour « {search} »</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={reload}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCellarEntry', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: font.sizeMd,
    color: colors.text,
    minHeight: 40,
  },
  list: {
    paddingVertical: spacing.md,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  noResultsText: {
    fontSize: font.sizeLg,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
  },
});
