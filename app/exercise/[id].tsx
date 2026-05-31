/**
 * Module B: Guided Exercise Player
 * Timer, voice cues, post-set pain feedback
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../../src/constants/physioTheme';
import { PHYSIO_EXERCISES } from '../../src/data/physioExercises';
import { usePrescriptionStore } from '../../src/stores/prescriptionStore';
import { PainFeedbackModal } from '../../src/components/PainFeedbackModal';
import { ExerciseMedia } from '../../src/components/ExerciseMedia';
import { PrescriptionEditor } from '../../src/components/exercise/PrescriptionEditor';
import { ExerciseTimer } from '../../src/components/exercise/ExerciseTimer';
import { getExerciseGifSource } from '../../src/data/exerciseGifs';
import { logExerciseCompletion } from '../../src/db/queries/logs';

export default function ExercisePlayerScreen() {
  const { id, name, gif_url, video_url } = useLocalSearchParams<{
    id: string;
    name?: string;
    gif_url?: string;
    video_url?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getPrescription, savePrescription } = usePrescriptionStore();

  const fallbackExercise = {
    id: id ?? '',
    name: name ?? 'Exercise',
    description: 'Follow the guided instructions.',
    phase: 1 as const,
    gif_url: gif_url || undefined,
    video_url: video_url || undefined,
    sets: 3,
    reps: '10',
  };
  const exercise =
    PHYSIO_EXERCISES.find((e) => e.id === id) ?? fallbackExercise;

  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [holdSeconds, setHoldSeconds] = useState('5');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'hold' | 'rest'>('idle');
  const [holdCountdown, setHoldCountdown] = useState(0);
  const [voiceCue, setVoiceCue] = useState('');
  const [showPainModal, setShowPainModal] = useState(false);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [nextExercise, setNextExercise] = useState<{ id: string, name: string, gif_url?: string, video_url?: string } | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Determine next exercise
    const currentIndex = PHYSIO_EXERCISES.findIndex(e => e.id === exercise.id);
    if (currentIndex !== -1 && currentIndex < PHYSIO_EXERCISES.length - 1) {
      const next = PHYSIO_EXERCISES[currentIndex + 1];
      setNextExercise({ id: next.id, name: next.name, gif_url: next.gif_url, video_url: next.video_url });
    } else {
      setNextExercise(null);
    }

    getPrescription(exercise.id).then((p) => {
      if (p) {
        setSets(String(p.sets));
        setReps(String(p.reps));
        setHoldSeconds(String(p.hold_seconds));
        setIsEditing(false);
      } else {
        setSets(String(exercise.sets ?? 3));
        setReps(String(exercise.reps ?? '10').replace(/\D/g, '') || '10');
        setHoldSeconds('5');
      }
    });
  }, [exercise.id, exercise.sets, exercise.reps]);

  useEffect(() => {
    if (!isRunning || phase !== 'idle') return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, phase]);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  const startHold = () => {
    setPhase('hold');
    setHoldCountdown(holdNum);
    setVoiceCue(`Hold for ${holdNum} seconds...`);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      setHoldCountdown((c) => {
        if (c <= 1) {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
          setPhase('idle');
          setVoiceCue('Release!');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const completeSet = () => {
    setShowPainModal(true);
  };

  const handlePainSubmit = async (painLevel: number) => {
    setShowPainModal(false);
    await logExerciseCompletion(exercise.id, repsNum, painLevel);
    if (currentSet >= setsNum) {
      setVoiceCue('All sets complete!');
      setExerciseComplete(true);
    } else {
      setCurrentSet((c) => c + 1);
      setVoiceCue(`Set ${currentSet + 1} of ${setsNum}. Ready when you are.`);
    }
  };

  const handleNextExercise = () => {
    if (nextExercise) {
      router.replace({
        pathname: '/exercise/[id]',
        params: {
          id: nextExercise.id,
          name: nextExercise.name,
          gif_url: nextExercise.gif_url ?? '',
          video_url: nextExercise.video_url ?? '',
        },
      });
    } else {
      router.back();
    }
  };

  const handleSavePrescription = async () => {
    const s = Math.max(1, parseInt(sets, 10) || 3);
    const r = Math.max(1, parseInt(reps, 10) || 10);
    const h = Math.max(0, parseInt(holdSeconds, 10) || 5);
    setSets(String(s));
    setReps(String(r));
    setHoldSeconds(String(h));
    await savePrescription(exercise.id, { sets: s, reps: r, hold_seconds: h });
    setIsEditing(false);
  };

  const setsNum = Math.max(1, parseInt(sets, 10) || 3);
  const repsNum = Math.max(1, parseInt(reps, 10) || 10);
  const holdNum = Math.max(0, parseInt(holdSeconds, 10) || 5);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={PhysioColors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <PrescriptionEditor
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          sets={sets}
          setSets={setSets}
          reps={reps}
          setReps={setReps}
          holdSeconds={holdSeconds}
          setHoldSeconds={setHoldSeconds}
          onSave={handleSavePrescription}
        />

        {/* Exercise content + voice cue */}
        <View style={styles.mediaSection}>
          <ExerciseMedia
            gifSource={getExerciseGifSource(exercise.id, exercise.gif_url)}
            videoUrl={exercise.video_url}
            style={styles.exerciseMedia}
          />
          {voiceCue ? (
            <View style={styles.voiceCue}>
              <Text style={styles.voiceCueText}>{voiceCue}</Text>
              {phase === 'hold' && holdCountdown > 0 && (
                <Text style={styles.holdCountdown}>{holdCountdown}</Text>
              )}
            </View>
          ) : null}
        </View>

        <Text style={styles.description}>{exercise.description}</Text>

        {/* Set progress & controls */}
        <View style={styles.setProgress}>
          <Text style={styles.setLabel}>Set {currentSet} of {setsNum}</Text>
        </View>

        <ExerciseTimer
          timerSeconds={timerSeconds}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          holdNum={holdNum}
          phase={phase}
          startHold={startHold}
          exerciseComplete={exerciseComplete}
          completeSet={completeSet}
          handleNextExercise={handleNextExercise}
          nextExerciseName={nextExercise?.name || null}
        />
      </ScrollView>

      <PainFeedbackModal
        visible={showPainModal}
        onSelect={handlePainSubmit}
        setNumber={currentSet}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PhysioColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: PhysioColors.cardBorder,
    backgroundColor: PhysioColors.surface,
  },
  backBtn: { padding: 8, marginRight: 12 },
  headerTitle: {
    flex: 1,
    fontSize: PhysioFontSize.xl,
    fontWeight: '700',
    color: PhysioColors.textPrimary,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mediaSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  exerciseMedia: {
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  voiceCue: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  voiceCueText: {
    fontSize: 18,
    fontWeight: '600',
    color: PhysioColors.primary,
  },
  holdCountdown: {
    fontSize: 48,
    fontWeight: '800',
    color: PhysioColors.primary,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  setProgress: {
    marginBottom: 16,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PhysioColors.textSecondary,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  timerBtnHalf: {
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  completeBtn: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PhysioColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  nextBtn: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  description: {
    fontSize: PhysioFontSize.lg,
    color: PhysioColors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
});
