import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCellarContext } from '@/context/CellarContext';
import { CellarCard } from '@/components/CellarCard';
import { EmptyState } from '@/components/EmptyState';
import { getDb } from '@/db/database';
import { updateCave, deleteCave, getCaveById } from '@/db/caveQueries';
import { spacing, font, radius } from '@/components/ui/tokens';
import { useTheme } from '@/context/ThemeContext';
import type { RootStackParamList } from '@/navigation';

export function CellarBottlesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CellarBottles'>>();
  const { caveId, caveName } = route.params;
  const { state, dispatch, reload } = useCellarContext();
  const { colors, shadow } = useTheme();
  const [search, setSearch] = useState('');

  const caveEntries = state.entries.filter((e) => e.cave_id === caveId);

  const filtered = search.trim()
    ? caveEntries.filter((e) => {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          (e.producer?.toLowerCase().includes(q) ?? false) ||
          (e.appellation?.toLowerCase().includes(q) ?? false) ||
          (e.storage_location?.toLowerCase().includes(q) ?? false)
        );
      })
    : caveEntries;

  useEffect(() => {
    navigation.setOptions({
      title: caveName,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleCaveOptions}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [caveName, colors, caveEntries.length]);

  const handleCaveOptions = () => {
    Alert.alert(caveName, undefined, [
      { text: 'Renommer', onPress: handleRename },
      {
        text: 'Supprimer la cave',
        style: 'destructive',
        onPress: handleDelete,
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleRename = () => {
    Alert.prompt(
      'Renommer la cave',
      undefined,
      async (name) => {
        const trimmed = name?.trim();
        if (!trimmed || trimmed === caveName) return;
        try {
          const db = await getDb();
          await updateCave(db, caveId, trimmed);
          const updated = await getCaveById(db, caveId);
          if (updated) {
            dispatch({ type: 'UPDATE_CAVE', payload: updated });
            navigation.setOptions({ title: trimmed });
          }
        } catch {
          Alert.alert('Erreur', 'Impossible de renommer la cave.');
        }
      },
      'plain-text',
      caveName
    );
  };

  const handleDelete = () => {
    if (caveEntries.length > 0) {
      Alert.alert(
        'Cave non vide',
        `Impossible de supprimer cette cave car elle contient ${caveEntries.length} bouteille${caveEntries.length > 1 ? 's' : ''}.`
      );
      return;
    }
    Alert.alert(
      'Supprimer la cave',
      `Supprimer "${caveName}" définitivement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDb();
              await deleteCave(db, caveId);
              dispatch({ type: 'DELETE_CAVE', payload: caveId });
              navigation.goBack();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer la cave.');
            }
          },
        },
      ]
    );
  };

  if (state.loading && caveEntries.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {caveEntries.length > 0 && (
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
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
          caveEntries.length === 0 ? (
            <EmptyState
              icon="🍾"
              title="Cave vide"
              message="Ajoutez vos premières bouteilles à cette cave."
              action={{
                label: 'Ajouter une bouteille',
                onPress: () => navigation.navigate('AddCellarEntry', { caveId }),
              }}
            />
          ) : (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                Aucun résultat pour « {search} »
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={state.loading} onRefresh={reload} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, shadow.fab]}
        onPress={() => navigation.navigate('AddCellarEntry', { caveId })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: font.sizeMd,
    minHeight: 40,
  },
  list: {
    paddingVertical: spacing.md,
    paddingBottom: 80,
  },
  emptyContainer: { flex: 1 },
  noResults: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  noResultsText: { fontSize: font.sizeLg },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
  },
});
