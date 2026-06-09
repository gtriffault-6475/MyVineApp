import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getDb } from '@/db/database';
import { getStats } from '@/db/queries';
import type { WineStats } from '@/types/wine';
import { spacing, font, radius } from '@/components/ui/tokens';
import { useTheme } from '@/context/ThemeContext';
import { useWineContext } from '@/context/WineContext';

export function StatsScreen() {
  const { state } = useWineContext();
  const { colors, shadow, isDark, serifFontKpi } = useTheme();
  const [stats, setStats] = useState<WineStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [state.wines]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const s = await getStats(db);
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Pas encore de statistiques</Text>
        <Text style={[styles.emptyMsg, { color: colors.textMuted }]}>Ajoutez des vins pour voir vos stats.</Text>
      </View>
    );
  }

  const buyAgainPct =
    stats.total > 0 ? Math.round((stats.buy_again_count / stats.total) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.kpiRow}>
        <KpiCard
          value={stats.total.toString()}
          label="Vins dégustés"
          emoji="🍷"
          colors={colors}
          shadow={shadow}
          isDark={isDark}
          serifFontKpi={serifFontKpi}
        />
        <KpiCard
          value={stats.avg_score != null ? stats.avg_score.toFixed(1) : '–'}
          label="Note moyenne"
          emoji="⭐"
          colors={colors}
          shadow={shadow}
          isDark={isDark}
          serifFontKpi={serifFontKpi}
        />
        <KpiCard
          value={`${buyAgainPct}%`}
          label="À racheter"
          emoji="↺"
          colors={colors}
          shadow={shadow}
          isDark={isDark}
          serifFontKpi={serifFontKpi}
        />
      </View>

      {stats.top_appellations.length > 0 && (
        <Section title="Top appellations" colors={colors} shadow={shadow}>
          {stats.top_appellations.map((a) => (
            <BarRow
              key={a.appellation}
              label={a.appellation}
              count={a.count}
              max={stats.top_appellations[0].count}
              colors={colors}
            />
          ))}
        </Section>
      )}

      {stats.top_producers.length > 0 && (
        <Section title="Top producteurs" colors={colors} shadow={shadow}>
          {stats.top_producers.map((p) => (
            <BarRow
              key={p.producer}
              label={p.producer}
              count={p.count}
              max={stats.top_producers[0].count}
              colors={colors}
            />
          ))}
        </Section>
      )}
    </ScrollView>
  );
}

type ThemeColors = ReturnType<typeof useTheme>['colors'];
type ThemeShadow = ReturnType<typeof useTheme>['shadow'];

function KpiCard({
  value,
  label,
  emoji,
  colors,
  shadow,
  isDark,
  serifFontKpi,
}: {
  value: string;
  label: string;
  emoji: string;
  colors: ThemeColors;
  shadow: ThemeShadow;
  isDark: boolean;
  serifFontKpi: ReturnType<typeof useTheme>['serifFontKpi'];
}) {
  return (
    <View
      style={[
        kpiStyles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadow.sm,
      ]}
    >
      <Text style={kpiStyles.emoji}>{emoji}</Text>
      <Text style={[kpiStyles.value, { color: isDark ? colors.scoreGold : colors.text }, serifFontKpi]}>
        {value}
      </Text>
      <Text style={[kpiStyles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  children,
  colors,
  shadow,
}: {
  title: string;
  children: React.ReactNode;
  colors: ThemeColors;
  shadow: ThemeShadow;
}) {
  return (
    <View style={sectionStyles.container}>
      <Text style={[sectionStyles.title, { color: colors.text }]}>{title}</Text>
      <View style={[sectionStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.sm]}>
        {children}
      </View>
    </View>
  );
}

function BarRow({
  label,
  count,
  max,
  colors,
}: {
  label: string;
  count: number;
  max: number;
  colors: ThemeColors;
}) {
  const pct = max > 0 ? count / max : 0;
  return (
    <View style={barStyles.row}>
      <Text style={[barStyles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[barStyles.barBg, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[barStyles.barFill, { flex: pct, backgroundColor: colors.primary }]} />
        <View style={{ flex: 1 - pct }} />
      </View>
      <Text style={[barStyles.count, { color: colors.textMuted }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: font.sizeXxl, fontWeight: font.weightBold },
  emptyMsg: { fontSize: font.sizeLg, textAlign: 'center', paddingHorizontal: spacing.xl },
  kpiRow: { flexDirection: 'row', gap: spacing.md },
});

const kpiStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
  },
  emoji: { fontSize: 24 },
  value: { fontSize: font.sizeXxl, fontWeight: font.weightBold },
  label: { fontSize: font.sizeSm, textAlign: 'center' },
});

const sectionStyles = StyleSheet.create({
  container: { gap: spacing.md },
  title: {
    fontSize: font.sizeLg,
    fontWeight: font.weightSemibold,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
  },
});

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { width: 120, fontSize: font.sizeMd },
  barBg: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: { borderRadius: radius.full },
  count: { width: 24, fontSize: font.sizeSm, textAlign: 'right' },
});
