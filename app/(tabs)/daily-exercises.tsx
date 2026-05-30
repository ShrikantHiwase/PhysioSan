/**
 * Daily Exercises Screen - Physio Recovery App
 * First functional component: lists today's prescribed exercises
 * Large touch targets for one-handed use (right hand while left is injured)
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget, PhysioShadow, PhysioSpacing } from '../../src/constants/physioTheme';
import { PHYSIO_EXERCISES, PhysioExercise } from '../../src/data/physioExercises';
import { getExerciseGifSource } from '../../src/data/exerciseGifs';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';
import { usePrescriptionStore } from '../../src/stores/prescriptionStore';
import type { Exercise as SupabaseExercise } from '../../src/types/database';

const PHASE_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Phase 1: Early Recovery',
  2: 'Phase 2: Strengthening',
  3: 'Phase 3: Return to Activity',
};

export default function DailyExercisesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<PhysioExercise[]>(PHYSIO_EXERCISES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Record<string, { sets: number; reps: number; hold_seconds: number }>>({});
  const getPrescription = usePrescriptionStore((s) => s.getPrescription);

  const loadExercises = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setExercises(PHYSIO_EXERCISES);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase!
        .from('exercises')
        .select('*')
        .order('phase', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setUseSupabase(true);
        setExercises(
          data.map((e: SupabaseExercise) => ({
            id: e.id,
            name: e.name,
            description: e.description ?? '',
            phase: e.phase as 1 | 2 | 3,
            video_url: e.video_url ?? undefined,
            gif_url: (e as any).gif_url ?? undefined,
            sets: 3,
            reps: '10',
          }))
        );
      } else {
        setExercises(PHYSIO_EXERCISES);
      }
    } catch {
      setExercises(PHYSIO_EXERCISES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadPrescriptions = useCallback(async () => {
    const ids = exercises.map((e) => e.id);
    const map: Record<string, { sets: number; reps: number; hold_seconds: number }> = {};
    for (const exerciseId of ids) {
      const p = await getPrescription(exerciseId);
      if (p) map[exerciseId] = p;
    }
    setPrescriptions(map);
  }, [exercises, getPrescription]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  useFocusEffect(
    useCallback(() => {
      loadPrescriptions();
    }, [loadPrescriptions])
  );

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExercises();
  };

  const onExercisePress = (exercise: PhysioExercise) => {
    router.push({
      pathname: '/exercise/[id]',
      params: {
        id: exercise.id,
        name: exercise.name,
        gif_url: exercise.gif_url ?? '',
        video_url: exercise.video_url ?? '',
      },
    });
  };

  const exercisesByPhase = exercises.reduce<Record<1 | 2 | 3, PhysioExercise[]>>(
    (acc, ex) => {
      acc[ex.phase].push(ex);
      return acc;
    },
    { 1: [], 2: [], 3: [] }
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={PhysioColors.primary} />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Exercises</Text>
          <Text style={styles.subtitle}>
            Your prescribed rehabilitation routine
          </Text>
        </View>

        {/* Exercise cards - large touch targets */}
        {([1, 2, 3] as const).map((phase) => {
          const phaseExercises = exercisesByPhase[phase];
          if (phaseExercises.length === 0) return null;

          return (
            <View key={phase} style={styles.phaseSection}>
              <Text style={styles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
              {phaseExercises.map((exercise) => (
                <Pressable
                  key={exercise.id}
                  onPress={() => onExercisePress(exercise)}
                  style={({ pressed }) => [
                    styles.exerciseCard,
                    pressed && styles.exerciseCardPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${exercise.name}`}
                  accessibilityHint="Opens exercise player"
                >
                  <View style={styles.exerciseIcon}>
                    {(() => {
                      const gifSource = getExerciseGifSource(exercise.id, exercise.gif_url);
                      return gifSource ? (
                        <Image
                          source={gifSource}
                          style={styles.exerciseThumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="fitness-outline"
                          size={28}
                          color={PhysioColors.primary}
                        />
                      );
                    })()}
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDescription} numberOfLines={2}>
                      {exercise.description}
                    </Text>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.exerciseMetaText}>
                        {prescriptions[exercise.id]
                          ? `${prescriptions[exercise.id].sets} sets × ${prescriptions[exercise.id].reps} reps${prescriptions[exercise.id].hold_seconds > 0 ? `, hold ${prescriptions[exercise.id].hold_seconds}s` : ''}`
                          : `${exercise.sets ?? 3} sets × ${exercise.reps ?? '10'} (tap to set prescription)`}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={PhysioColors.textMuted}
                  />
                </Pressable>
              ))}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PhysioColors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: PhysioFontSize.md,
    color: PhysioColors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 28,
  },
  title: {
    fontSize: PhysioFontSize['3xl'],
    fontWeight: '700',
    color: PhysioColors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: PhysioFontSize.lg,
    color: PhysioColors.textSecondary,
    marginTop: 6,
  },
  phaseSection: {
    marginBottom: 28,
  },
  phaseLabel: {
    fontSize: PhysioFontSize.sm,
    fontWeight: '600',
    color: PhysioColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    padding: PhysioSpacing.xl,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
    minHeight: PhysioTouchTarget.minHeight + 24,
    ...PhysioShadow.sm,
  },
  exerciseCardPressed: {
    opacity: 0.9,
    backgroundColor: PhysioColors.surfaceLight,
  },
  exerciseIcon: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  exerciseThumb: {
    width: '100%',
    height: '100%',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: PhysioFontSize.xl,
    fontWeight: '700',
    color: PhysioColors.textPrimary,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: PhysioFontSize.lg,
    color: PhysioColors.textSecondary,
    lineHeight: 24,
  },
  exerciseMeta: {
    marginTop: 8,
  },
  exerciseMetaText: {
    fontSize: PhysioFontSize.md,
    color: PhysioColors.primary,
    fontWeight: '600',
  },
});
