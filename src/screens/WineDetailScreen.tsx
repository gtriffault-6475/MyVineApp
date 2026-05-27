import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import { useWineContext } from '@/context/WineContext';
import { getDb } from '@/db/database';
import { deleteWine } from '@/db/queries';
import { StarRating } from '@/components/StarRating';
import { colors, spacing, font, radius, shadow } from '@/components/ui/tokens';
import type { RootStackParamList } from '@/navigation';

const LOCATION_LABELS: Record<string, string> = {
  home: 'À la maison',
  friend: 'Chez des amis',
  restaurant: 'Restaurant',
};

export function WineDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'WineDetail'>>();
  const { wineId } = route.params;
  const { state, dispatch } = useWineContext();

  const wine = state.wines.find((w) => w.id === wineId);

  useEffect(() => {
    if (!wine) return;
    navigation.setOptions({
      title: wine.name,
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('WineEdit', { wineId: wine.id })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.headerBtn}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.headerBtn, styles.deleteBtn]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [wine]);

  if (!wine) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce vin',
      `Supprimer "${wine.name}" définitivement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const db = await getDb();
            await deleteWine(db, wine.id);
            if (wine.photo_uri) {
              try {
                const fullPath = `${RNFS.DocumentDirectoryPath}/${wine.photo_uri}`;
                const exists = await RNFS.exists(fullPath);
                if (exists) await RNFS.unlink(fullPath);
              } catch {}
            }
            dispatch({ type: 'DELETE_WINE', payload: wine.id });
            navigation.goBack();
          },
        },
      ]
    );
  };

  const photoUri = wine.photo_uri
    ? `file://${RNFS.DocumentDirectoryPath}/${wine.photo_uri}`
    : null;

  const drunkDate = new Date(wine.drunk_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const locationLabel =
    wine.location_type === 'restaurant' && wine.restaurant_name
      ? wine.restaurant_name
      : LOCATION_LABELS[wine.location_type] ?? wine.location_type;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoEmoji}>🍷</Text>
        </View>
      )}

      <View style={styles.main}>
        <Text style={styles.name}>
          {wine.name}
          {wine.vintage ? ` ${wine.vintage}` : ''}
        </Text>

        {(wine.producer || wine.appellation) ? (
          <Text style={styles.subtitle}>
            {[wine.producer, wine.appellation].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        {wine.score !== null ? (
          <View style={styles.scoreRow}>
            <StarRating score={wine.score} readOnly size={22} />
          </View>
        ) : null}

        <View style={styles.chips}>
          <Chip icon="📍" label={locationLabel} />
          <Chip icon="📅" label={drunkDate} />
          {wine.buy_again === 1 && <Chip icon="✓" label="À racheter" highlight />}
        </View>

        {wine.companion ? (
          <InfoBlock label="Avec qui" value={wine.companion} />
        ) : null}

        {wine.food_pairing ? (
          <InfoBlock label="Accord mets-vins" value={wine.food_pairing} />
        ) : null}

        {wine.comment ? (
          <InfoBlock label="Commentaire" value={wine.comment} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Chip({ icon, label, highlight }: { icon: string; label: string; highlight?: boolean }) {
  return (
    <View style={[chipStyles.chip, highlight && chipStyles.highlight]}>
      <Text style={chipStyles.icon}>{icon}</Text>
      <Text style={[chipStyles.label, highlight && chipStyles.highlightLabel]}>{label}</Text>
    </View>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.block}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 280 },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 64 },
  main: { padding: spacing.xl, gap: spacing.lg },
  name: {
    fontSize: font.sizeHero,
    fontWeight: font.weightBold,
    color: colors.text,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: font.sizeLg,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  scoreRow: { marginTop: -spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  headerActions: { flexDirection: 'row', gap: spacing.lg, marginRight: spacing.md },
  headerBtn: { color: colors.primary, fontSize: font.sizeLg, fontWeight: font.weightMedium },
  deleteBtn: { color: colors.error },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlight: {
    backgroundColor: '#E8F5EE',
    borderColor: '#B2D9C0',
  },
  icon: { fontSize: 13 },
  label: { fontSize: font.sizeSm, color: colors.text, fontWeight: font.weightMedium },
  highlightLabel: { color: colors.success },
});

const infoStyles = StyleSheet.create({
  block: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: { fontSize: font.sizeLg, color: colors.text, lineHeight: 24 },
});
