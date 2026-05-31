/**
 * Module A: One-handed Dashboard
 * Daily Progress Circle, Pain Trend chart, quick access
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget, PhysioShadow } from '../../src/constants/physioTheme';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { useProfileStore } from '../../src/stores/profileStore';
import { getTodayProgress, getPainTrend, getCurrentStreak } from '../../src/db/queries/progress';

const CHART_WIDTH = Dimensions.get('window').width - 80;

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, loadProfile } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);
  const [completedSets, setCompletedSets] = useState(0);
  const [prescribedSets, setPrescribedSets] = useState(1);
  const [painData, setPainData] = useState<{ date: string; avgPain: number }[]>([]);
  const [streak, setStreak] = useState(0);

  const loadData = useCallback(async () => {
    await loadProfile();
    const progress = await getTodayProgress();
    setCompletedSets(progress.completedSets);
    setPrescribedSets(progress.prescribedSets);
    const trend = await getPainTrend(7);
    setPainData(trend);
    const currentStreak = await getCurrentStreak();
    setStreak(currentStreak);
  }, [loadProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const progress = prescribedSets > 0 ? completedSets / prescribedSets : 0;
  const chartData = painData.map((d, i) => ({
    value: d.avgPain,
    label: d.date.slice(5),
    dataPointText: d.avgPain.toFixed(1),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PhysioColors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.name}>{profile?.name ?? 'Patient'}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={20} color={PhysioColors.warning} />
              <Text style={styles.streakText}>{streak} Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Daily Progress Circle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/daily-exercises')}
            style={({ pressed }) => [styles.progressCard, pressed && styles.cardPressed]}
          >
            <ProgressRing
              progress={Math.min(1, progress)}
              size={140}
              strokeWidth={12}
              color={PhysioColors.primary}
              bgColor={PhysioColors.surfaceMuted}
              label={`${completedSets}`}
              sublabel={`/ ${prescribedSets} sets`}
              labelColor={PhysioColors.textPrimary}
              sublabelColor={PhysioColors.textSecondary}
            />
            <Text style={styles.progressHint}>Tap to view exercises</Text>
          </Pressable>
        </View>

        {/* Pain Trend Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Pain Trend (7 days)</Text>
            <Pressable
              onPress={() => router.push('/progress/daily-pain')}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ Log</Text>
            </Pressable>
          </View>
          <View style={styles.painCard}>
            {chartData.length > 0 ? (
              <LineChart
                data={chartData}
                width={CHART_WIDTH}
                height={140}
                color={PhysioColors.primary}
                thickness={2}
                hideDataPoints={chartData.length > 7}
                dataPointsColor={PhysioColors.primary}
                textColor1={PhysioColors.textMuted}
                textFontSize={10}
                noOfSections={4}
                maxValue={10}
                yAxisLabelWidth={24}
                xAxisColor={PhysioColors.cardBorder}
                yAxisColor={PhysioColors.cardBorder}
                spacing={chartData.length > 3 ? 40 : 60}
              />
            ) : (
              <>
                <Ionicons name="analytics-outline" size={32} color={PhysioColors.primary + '60'} />
                <Text style={styles.painPlaceholder}>Complete exercises with pain ratings to see trend</Text>
              </>
            )}
          </View>
        </View>

        {/* Quick action */}
        <Pressable
          onPress={() => router.push('/(tabs)/daily-exercises')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickActionIcon, { minHeight: PhysioTouchTarget.large }]}>
            <Ionicons name="fitness" size={28} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Start Daily Exercises</Text>
          <Ionicons name="chevron-forward" size={24} color={PhysioColors.primary} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { marginTop: 24, marginBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PhysioColors.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  streakText: {
    color: PhysioColors.warning,
    fontWeight: '700',
    fontSize: 14,
  },
  greeting: { color: PhysioColors.textSecondary, fontSize: 14 },
  name: { color: PhysioColors.textPrimary, fontSize: 26, fontWeight: '700', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: PhysioColors.textPrimary },
  addBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  addBtnText: { fontSize: 15, fontWeight: '600', color: PhysioColors.primary },
  progressCard: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
    ...PhysioShadow.sm,
  },
  cardPressed: { opacity: 0.95 },
  progressHint: { marginTop: 12, fontSize: 13, color: PhysioColors.textMuted },
  painCard: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  painPlaceholder: { marginTop: 12, fontSize: 14, color: PhysioColors.textMuted, textAlign: 'center' },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
    ...PhysioShadow.sm,
  },
  quickActionPressed: { opacity: 0.95 },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: { flex: 1, fontSize: 18, fontWeight: '700', color: PhysioColors.textPrimary },
});
