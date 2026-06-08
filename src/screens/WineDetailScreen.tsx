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
import { spacing, font, radius } from '@/components/ui/tokens';
import { useTheme } from '@/context/ThemeContext';
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
  const { colors, serifFontWine } = useTheme();

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
            <Text style={[styles.headerBtn, { color: colors.primary }]}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.headerBtn, { color: colors.error }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [wine, colors]);

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

  const chipHighlightBg = colors.success + '22';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={styles.photoEmoji}>🍷</Text>
        </View>
      )}

      <View style={styles.main}>
        <Text
          style={[
            styles.name,
            { color: colors.text, fontFamily: serifFontWine },
          ]}
        >
          {wine.name}
          {wine.vintage ? ` ${wine.vintage}` : ''}
        </Text>

        {(wine.producer || wine.appellation) ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {[wine.producer, wine.appellation].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        {wine.score !== null ? (
          <View style={styles.scoreRow}>
            <StarRating score={wine.score} readOnly size={22} />
          </View>
        ) : null}

        <View style={styles.chips}>
          <Chip icon="📍" label={locationLabel} colors={colors} />
          <Chip icon="📅" label={drunkDate} colors={colors} />
          {wine.buy_again === 1 && (
            <Chip icon="✓" label="À racheter" highlight colors={colors} />
          )}
        </View>

        {wine.companion ? (
          <InfoBlock label="Avec qui" value={wine.companion} colors={colors} />
        ) : null}

        {wine.food_pairing ? (
          <InfoBlock label="Accord mets-vins" value={wine.food_pairing} colors={colors} />
        ) : null}

        {wine.comment ? (
          <InfoBlock label="Commentaire" value={wine.comment} colors={colors} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Chip({
  icon,
  label,
  highlight,
  colors,
}: {
  icon: string;
  label: string;
  highlight?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={[
        chipStyles.chip,
        { backgroundColor: colors.surface, borderColor: colors.border },
        highlight && { backgroundColor: colors.success + '22', borderColor: colors.success + '55' },
      ]}
    >
      <Text style={chipStyles.icon}>{icon}</Text>
      <Text
        style={[
          chipStyles.label,
          { color: colors.text },
          highlight && { color: colors.success },
        ]}
      >
        {label}
      </Text>
    </View>
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
  photo: { width: '100%', height: 280 },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 64 },
  main: { padding: spacing.xl, gap: spacing.lg },
  name: {
    fontSize: font.sizeHero,
    fontWeight: font.weightBold,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: font.sizeLg,
    marginTop: -spacing.sm,
  },
  scoreRow: { marginTop: -spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  headerActions: { flexDirection: 'row', gap: spacing.lg, marginRight: spacing.md },
  headerBtn: { fontSize: font.sizeLg, fontWeight: font.weightMedium },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  icon: { fontSize: 13 },
  label: { fontSize: font.sizeSm, fontWeight: font.weightMedium },
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
