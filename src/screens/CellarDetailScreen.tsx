import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import { useCellarContext } from '@/context/CellarContext';
import { useWineContext } from '@/context/WineContext';
import { getDb } from '@/db/database';
import { deleteCellarEntry, decrementCellarQuantity, getCellarEntryById } from '@/db/cellarQueries';
import { WineCard } from '@/components/WineCard';
import { Button } from '@/components/ui/Button';
import { cellarApogeeLabel, cellarApogeeStatus } from '@/types/cellar';
import { spacing, font, radius } from '@/components/ui/tokens';
import { useTheme } from '@/context/ThemeContext';
import type { RootStackParamList } from '@/navigation';

const APOGEE_LABELS = {
  peak: 'À son apogée',
  past: "Passé l'apogée",
  early: 'Trop tôt',
  unknown: '',
};

export function CellarDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CellarDetail'>>();
  const { cellarId } = route.params;
  const { state: cellarState, dispatch: cellarDispatch } = useCellarContext();
  const { state: wineState } = useWineContext();
  const { colors, shadow, serifFontWine } = useTheme();

  const entry = cellarState.entries.find((e) => e.id === cellarId);
  const linkedWines = wineState.wines.filter((w) => w.cellar_id === cellarId);

  const apogeeColors = {
    peak: colors.success,
    past: colors.textMuted,
    early: colors.scoreGold,
    unknown: colors.textLight,
  };

  useEffect(() => {
    if (!entry) return;
    navigation.setOptions({
      title: entry.name,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddCellarEntry', { entryId: cellarId })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.headerBtn, { color: colors.primary }]}>Modifier</Text>
        </TouchableOpacity>
      ),
    });
  }, [entry, colors]);

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={[styles.notFound, { color: colors.textMuted }]}>Bouteille introuvable</Text>
      </View>
    );
  }

  const photoUri = entry.photo_uri
    ? `file://${RNFS.DocumentDirectoryPath}/${entry.photo_uri}`
    : null;

  const apogeeLabel = cellarApogeeLabel(entry);
  const status = cellarApogeeStatus(entry);

  const handleOpenBottle = () => {
    Alert.alert(
      'Ouvrir une bouteille',
      `Décompter une bouteille de "${entry.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const db = await getDb();
              await decrementCellarQuantity(db, cellarId);
              const updated = await getCellarEntryById(db, cellarId);
              if (updated) {
                cellarDispatch({ type: 'UPDATE_ENTRY', payload: updated });
              } else {
                cellarDispatch({ type: 'DELETE_ENTRY', payload: cellarId });
              }
              Alert.alert(
                'Bouteille ouverte',
                'Voulez-vous enregistrer cette dégustation ?',
                [
                  { text: 'Non', style: 'cancel' },
                  { text: 'Oui', onPress: () => navigation.navigate('AddWine', { cellarId }) },
                ]
              );
            } catch {
              Alert.alert('Erreur', 'Impossible de mettre à jour la cave.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette bouteille',
      `Supprimer "${entry.name}" de la cave définitivement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDb();
              await deleteCellarEntry(db, cellarId);
              if (entry.photo_uri) {
                try {
                  const fullPath = `${RNFS.DocumentDirectoryPath}/${entry.photo_uri}`;
                  const exists = await RNFS.exists(fullPath);
                  if (exists) await RNFS.unlink(fullPath);
                } catch {}
              }
              cellarDispatch({ type: 'DELETE_ENTRY', payload: cellarId });
              navigation.goBack();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer la bouteille.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={styles.photoEmoji}>🍾</Text>
        </View>
      )}

      <View style={styles.main}>
        <View style={styles.titleRow}>
          <View style={styles.titleFlex}>
            <Text style={[styles.name, { color: colors.text, fontFamily: serifFontWine }]}>
              {entry.name}
              {entry.vintage ? ` ${entry.vintage}` : ''}
            </Text>
            {entry.producer || entry.appellation ? (
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {[entry.producer, entry.appellation].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
          </View>
          <View style={[styles.qtyBlock, { backgroundColor: colors.primary }]}>
            <Text style={[styles.qtyNumber, { color: colors.white }]}>{entry.quantity}</Text>
            <Text style={styles.qtyLabel}>
              {entry.quantity > 1 ? 'bouteilles' : 'bouteille'}
            </Text>
          </View>
        </View>

        <View style={styles.chips}>
          {apogeeLabel ? (
            <View style={[styles.chip, { borderColor: apogeeColors[status], backgroundColor: colors.surface }]}>
              <Text style={[styles.chipText, { color: apogeeColors[status] }]}>
                {APOGEE_LABELS[status] ? `${APOGEE_LABELS[status]} · ` : ''}
                {apogeeLabel}
              </Text>
            </View>
          ) : null}
          {entry.storage_location ? (
            <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.chipText, { color: colors.text }]}>📦 {entry.storage_location}</Text>
            </View>
          ) : null}
        </View>

        {entry.purchase_price || entry.purchase_date ? (
          <InfoBlock
            label="Achat"
            value={[
              entry.purchase_price ? `${entry.purchase_price} €` : null,
              entry.purchase_date
                ? new Date(entry.purchase_date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            colors={colors}
          />
        ) : null}

        {entry.notes ? <InfoBlock label="Notes" value={entry.notes} colors={colors} /> : null}

        {entry.quantity > 0 ? (
          <Button title="Ouvrir une bouteille" onPress={handleOpenBottle} style={styles.openBtn} />
        ) : null}

        <Button title="Supprimer de la cave" variant="danger" onPress={handleDelete} style={styles.deleteBtn} />
      </View>

      {linkedWines.length > 0 ? (
        <View style={styles.tastings}>
          <Text style={[styles.tastingsTitle, { color: colors.text }]}>
            Dégustations ({linkedWines.length})
          </Text>
          {linkedWines.map((wine) => (
            <WineCard
              key={wine.id}
              wine={wine}
              onPress={() => navigation.navigate('WineDetail', { wineId: wine.id })}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function InfoBlock({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[infoStyles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[infoStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: font.sizeLg },
  photo: { width: '100%', height: 260 },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 64 },
  main: { padding: spacing.xl, gap: spacing.lg },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleFlex: { flex: 1, gap: spacing.xs },
  name: {
    fontSize: font.sizeHero,
    fontWeight: font.weightBold,
    lineHeight: 34,
  },
  subtitle: { fontSize: font.sizeLg },
  qtyBlock: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 56,
  },
  qtyNumber: {
    fontSize: font.sizeXxl,
    fontWeight: font.weightBold,
    lineHeight: 28,
  },
  qtyLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: font.weightMedium,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: -spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
  },
  openBtn: { marginTop: spacing.sm },
  deleteBtn: { marginTop: -spacing.xs },
  headerBtn: { fontSize: font.sizeLg, fontWeight: font.weightMedium },
  tastings: { marginTop: spacing.lg },
  tastingsTitle: {
    fontSize: font.sizeXl,
    fontWeight: font.weightSemibold,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
});

const infoStyles = StyleSheet.create({
  block: {
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
  },
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: { fontSize: font.sizeLg, lineHeight: 24 },
});
