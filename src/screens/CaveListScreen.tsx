import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCellarContext } from '@/context/CellarContext';
import { EmptyState } from '@/components/EmptyState';
import { getDb } from '@/db/database';
import { insertCave, updateCave, deleteCave, getCaveById } from '@/db/caveQueries';
import { spacing, font, radius } from '@/components/ui/tokens';
import { useTheme } from '@/context/ThemeContext';
import type { RootStackParamList } from '@/navigation';
import type { Cave } from '@/types/cave';

const MAX_CAVES = 5;

export function CaveListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, dispatch, reload } = useCellarContext();
  const { caves, entries, loading } = state;
  const { colors, shadow } = useTheme();

  const canAddCave = caves.length < MAX_CAVES;

  useEffect(() => {
    navigation.setOptions({
      headerRight: canAddCave
        ? () => (
            <TouchableOpacity
              onPress={handleAddCave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add" size={26} color={colors.primary} />
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [canAddCave, colors]);

  const bottleCount = (caveId: number) =>
    entries.filter((e) => e.cave_id === caveId).length;

  const handleAddCave = () => {
    Alert.prompt(
      'Nouvelle cave',
      'Nom de la cave',
      async (name) => {
        const trimmed = name?.trim();
        if (!trimmed) return;
        try {
          const db = await getDb();
          const id = await insertCave(db, trimmed);
          const created = await getCaveById(db, id);
          if (created) dispatch({ type: 'ADD_CAVE', payload: created });
        } catch {
          Alert.alert('Erreur', 'Impossible de créer la cave.');
        }
      },
      'plain-text'
    );
  };

  const handleCaveActions = (cave: Cave) => {
    Alert.alert(cave.name, undefined, [
      {
        text: 'Renommer',
        onPress: () => handleRenameCave(cave),
      },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => handleDeleteCave(cave),
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleRenameCave = (cave: Cave) => {
    Alert.prompt(
      'Renommer la cave',
      undefined,
      async (name) => {
        const trimmed = name?.trim();
        if (!trimmed || trimmed === cave.name) return;
        try {
          const db = await getDb();
          await updateCave(db, cave.id, trimmed);
          const updated = await getCaveById(db, cave.id);
          if (updated) dispatch({ type: 'UPDATE_CAVE', payload: updated });
        } catch {
          Alert.alert('Erreur', 'Impossible de renommer la cave.');
        }
      },
      'plain-text',
      cave.name
    );
  };

  const handleDeleteCave = (cave: Cave) => {
    const count = bottleCount(cave.id);
    if (count > 0) {
      Alert.alert(
        'Cave non vide',
        `Impossible de supprimer "${cave.name}" car elle contient ${count} bouteille${count > 1 ? 's' : ''}.`
      );
      return;
    }
    Alert.alert(
      'Supprimer la cave',
      `Supprimer "${cave.name}" définitivement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDb();
              await deleteCave(db, cave.id);
              dispatch({ type: 'DELETE_CAVE', payload: cave.id });
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer la cave.');
            }
          },
        },
      ]
    );
  };

  if (loading && caves.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={caves}
        keyExtractor={(c) => c.id.toString()}
        renderItem={({ item }) => {
          const count = bottleCount(item.id);
          return (
            <TouchableOpacity
              style={[styles.caveCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate('CellarBottles', { caveId: item.id, caveName: item.name })
              }
              onLongPress={() => handleCaveActions(item)}
              activeOpacity={0.75}
            >
              <View style={styles.caveIcon}>
                <Text style={styles.caveEmoji}>🍷</Text>
              </View>
              <View style={styles.caveInfo}>
                <Text style={[styles.caveName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.caveCount, { color: colors.textMuted }]}>
                  {count} bouteille{count !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={caves.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🍾"
            title="Aucune cave"
            message="Créez votre première cave pour commencer à gérer vos bouteilles."
            action={canAddCave ? { label: 'Créer une cave', onPress: handleAddCave } : undefined}
          />
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, shadow.fab]}
        onPress={() => navigation.navigate('AddCellarEntry', {})}
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
  list: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
    gap: spacing.sm,
  },
  emptyContainer: { flex: 1 },
  caveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  caveIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caveEmoji: { fontSize: 28 },
  caveInfo: { flex: 1, gap: spacing.xs },
  caveName: { fontSize: font.sizeXl, fontWeight: font.weightSemibold },
  caveCount: { fontSize: font.sizeMd },
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
