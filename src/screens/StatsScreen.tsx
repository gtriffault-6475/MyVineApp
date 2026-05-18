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
import { colors, spacing, font, radius, shadow } from '@/components/ui/tokens';
import { useWineContext } from '@/context/WineContext';

export function StatsScreen() {
  const { state } = useWineContext();
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
        <Text style={styles.emptyTitle}>Pas encore de statistiques</Text>
        <Text style={styles.emptyMsg}>Ajoutez des vins pour voir vos stats.</Text>
      </View>
    );
  }

  const buyAgainPct =
    stats.total > 0 ? Math.round((stats.buy_again_count / stats.total) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.kpiRow}>
        <KpiCard value={stats.total.toString()} label="Vins dégustés" emoji="🍷" />
        <KpiCard
          value={stats.avg_score != null ? stats.avg_score.toFixed(1) : '–'}
          label="Note moyenne"
          emoji="⭐"
        />
        <KpiCard value={`${buyAgainPct}%`} label="À racheter" emoji="↺" />
      </View>

      {stats.top_appellations.length > 0 && (
        <Section title="Top appellations">
          {stats.top_appellations.map((a) => (
            <BarRow
              key={a.appellation}
              label={a.appellation}
              count={a.count}
              max={stats.top_appellations[0].count}
            />
          ))}
        </Section>
      )}

      {stats.top_producers.length > 0 && (
        <Section title="Top producteurs">
          {stats.top_producers.map((p) => (
            <BarRow
              key={p.producer}
              label={p.producer}
              count={p.count}
              max={stats.top_producers[0].count}
            />
          ))}
        </Section>
      )}
    </ScrollView>
  );
}

function KpiCard({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <View style={kpiStyles.card}>
      <Text style={kpiStyles.emoji}>{emoji}</Text>
      <Text style={kpiStyles.value}>{value}</Text>
      <Text style={kpiStyles.label}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.card}>{children}</View>
    </View>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? count / max : 0;
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={barStyles.barBg}>
        <View style={[barStyles.barFill, { flex: pct }]} />
        <View style={{ flex: 1 - pct }} />
      </View>
      <Text style={barStyles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: font.sizeXxl, fontWeight: font.weightBold, color: colors.text },
  emptyMsg: { fontSize: font.sizeLg, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
  kpiRow: { flexDirection: 'row', gap: spacing.md },
});

const kpiStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadow.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 24 },
  value: { fontSize: font.sizeXxl, fontWeight: font.weightBold, color: colors.text },
  label: { fontSize: font.sizeSm, color: colors.textMuted, textAlign: 'center' },
});

const sectionStyles = StyleSheet.create({
  container: { gap: spacing.md },
  title: {
    fontSize: font.sizeLg,
    fontWeight: font.weightSemibold,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { width: 120, fontSize: font.sizeMd, color: colors.text },
  barBg: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  barFill: { backgroundColor: colors.primary, borderRadius: radius.full },
  count: { width: 24, fontSize: font.sizeSm, color: colors.textMuted, textAlign: 'right' },
});
