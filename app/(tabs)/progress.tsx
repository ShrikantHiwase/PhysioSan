/**
 * Module C: Progress Analytics
 * QuickDASH, ROM growth chart, milestones
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { PhysioColors, PhysioFontSize } from '../../src/constants/physioTheme';
import { useProfileStore } from '../../src/stores/profileStore';
import { getAssessments } from '../../src/db/queries/progress';
import { DEFAULT_MILESTONES, getWeeksSinceDate } from '../../src/data/milestones';

const CHART_WIDTH = Dimensions.get('window').width - 80;

export default function ProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);
  const [assessments, setAssessments] = useState<{ date: string; dash_score: number | null; prwe_score: number | null; rom_degrees: number | null }[]>([]);

  const loadData = useCallback(async () => {
    const data = await getAssessments();
    setAssessments(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const weeksSinceSurgery = profile?.surgery_date ? getWeeksSinceDate(profile.surgery_date) : 0;
  const milestones = DEFAULT_MILESTONES.map((m) => ({
    ...m,
    completed: weeksSinceSurgery >= m.week,
  }));

  const romData = assessments
    .filter((a) => a.rom_degrees != null)
    .map((a) => ({
      value: a.rom_degrees!,
      label: a.date.slice(5),
      dataPointText: String(a.rom_degrees),
    }))
    .reverse();

  const dashData = assessments
    .filter((a) => a.dash_score != null)
    .map((a) => ({
      value: a.dash_score!,
      label: a.date.slice(5),
      dataPointText: String(a.dash_score),
    }))
    .reverse();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadData();
                setRefreshing(false);
              }}
              tintColor={PhysioColors.primary}
            />
          }
        >
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your recovery metrics</Text>
        </View>

        {/* QuickDASH */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color={PhysioColors.primary} />
            <Text style={styles.cardTitle}>QuickDASH Score</Text>
            <Pressable
              onPress={() => router.push('/progress/quickdash')}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </Pressable>
          </View>
          {dashData.length > 0 ? (
            <LineChart
              data={dashData}
              width={CHART_WIDTH}
              height={120}
              color={PhysioColors.primary}
              thickness={2}
              hideDataPoints={dashData.length > 5}
              noOfSections={4}
              maxValue={100}
              yAxisLabelWidth={28}
              xAxisColor={PhysioColors.cardBorder}
              yAxisColor={PhysioColors.cardBorder}
            />
          ) : (
            <Text style={styles.placeholder}>Complete the QuickDASH questionnaire to track</Text>
          )}
        </View>

        {/* ROM Growth Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up-outline" size={24} color={PhysioColors.primary} />
            <Text style={styles.cardTitle}>Range of Motion</Text>
            <View style={styles.romActions}>
              <Pressable
                onPress={() => router.push('/progress/rom-camera')}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>+ Measure</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/progress/rom')}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>Log</Text>
              </Pressable>
            </View>
          </View>
          {romData.length > 0 ? (
            <LineChart
              data={romData}
              width={CHART_WIDTH}
              height={120}
              color={PhysioColors.success}
              thickness={2}
              hideDataPoints={romData.length > 5}
              noOfSections={4}
              yAxisLabelWidth={28}
              xAxisColor={PhysioColors.cardBorder}
              yAxisColor={PhysioColors.cardBorder}
            />
          ) : (
            <Text style={styles.placeholder}>Use camera to measure ROM with hand tracking</Text>
          )}
        </View>

        {/* Milestones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag-outline" size={24} color={PhysioColors.primary} />
            <Text style={styles.cardTitle}>Milestones</Text>
          </View>
          {profile?.surgery_date ? (
            <Text style={styles.weeksText}>Week {weeksSinceSurgery} since surgery</Text>
          ) : null}
          {milestones.map((m) => (
            <View
              key={m.id}
              style={[styles.milestoneRow, m.completed && styles.milestoneCompleted]}
            >
              <Ionicons
                name={m.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={m.completed ? PhysioColors.success : PhysioColors.textMuted}
              />
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneTitle, m.completed && styles.milestoneTitleDone]}>
                  {m.title}
                </Text>
                <Text style={styles.milestoneDesc}>{m.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { marginTop: 24, marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: PhysioColors.textPrimary },
  subtitle: { fontSize: 15, color: PhysioColors.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: PhysioColors.textPrimary },
  romActions: { flexDirection: 'row', gap: 8 },
  addBtn: { padding: 4 },
  addBtnText: { fontSize: 15, fontWeight: '600', color: PhysioColors.primary },
  placeholder: { fontSize: 15, color: PhysioColors.textMuted },
  weeksText: { fontSize: 14, color: PhysioColors.textSecondary, marginBottom: 12 },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: PhysioColors.cardBorder,
  },
  milestoneCompleted: { opacity: 0.8 },
  milestoneContent: { flex: 1 },
  milestoneTitle: { fontSize: 16, fontWeight: '600', color: PhysioColors.textPrimary },
  milestoneTitleDone: { color: PhysioColors.textSecondary, textDecorationLine: 'line-through' },
  milestoneDesc: { fontSize: 13, color: PhysioColors.textMuted, marginTop: 2 },
});
