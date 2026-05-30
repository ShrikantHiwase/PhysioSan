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
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
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
      setCurrentSet(1);
    } else {
      setCurrentSet((c) => c + 1);
      setVoiceCue(`Set ${currentSet + 1} of ${setsNum}. Ready when you are.`);
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
        {/* Therapist prescription - editable */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={22} color={PhysioColors.primary} />
            <Text style={styles.sectionTitle}>Therapist Prescription</Text>
            <Pressable
              onPress={() => {
                if (isEditing) handleSavePrescription();
                else setIsEditing(true);
              }}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.sectionHint}>
            Enter the sets, reps, and hold time as prescribed by your therapist
          </Text>

          {isEditing ? (
            <View style={styles.prescriptionForm}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.input}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={PhysioColors.textMuted}
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor={PhysioColors.textMuted}
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Hold (seconds)</Text>
                <TextInput
                  style={styles.input}
                  value={holdSeconds}
                  onChangeText={setHoldSeconds}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={PhysioColors.textMuted}
                />
              </View>
              <Pressable
                onPress={handleSavePrescription}
                style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
              >
                <Text style={styles.saveBtnText}>Save Prescription</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.prescriptionSummary}>
              <Text style={styles.summaryText}>
                {setsNum} sets × {repsNum} reps
                {holdNum > 0 ? `, hold ${holdNum} sec` : ''}
              </Text>
            </View>
          )}
        </View>

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

        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>Timer</Text>
          <Text style={styles.timerValue}>
            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </Text>
          <View style={styles.controlRow}>
            <Pressable
              onPress={() => setIsRunning(!isRunning)}
              style={[styles.timerBtn, styles.timerBtnHalf]}
            >
              <Text style={styles.timerBtnText}>{isRunning ? 'Pause' : 'Start'}</Text>
            </Pressable>
            {holdNum > 0 && (
              <Pressable
                onPress={startHold}
                disabled={phase === 'hold'}
                style={[styles.timerBtn, styles.timerBtnHalf, phase === 'hold' && styles.btnDisabled]}
              >
                <Text style={styles.timerBtnText}>Hold {holdNum}s</Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={completeSet}
            style={[styles.completeBtn, { minHeight: PhysioTouchTarget.large }]}
          >
            <Text style={styles.completeBtnText}>Complete Set</Text>
          </Pressable>
        </View>
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
  section: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: PhysioColors.textPrimary,
  },
  editBtn: { padding: 4 },
  editBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: PhysioColors.primary,
  },
  sectionHint: {
    fontSize: 13,
    color: PhysioColors.textMuted,
    marginBottom: 16,
  },
  prescriptionForm: { gap: 12 },
  inputRow: { gap: 6 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PhysioColors.textSecondary,
  },
  input: {
    backgroundColor: PhysioColors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: PhysioColors.textPrimary,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
  },
  saveBtnPressed: { opacity: 0.9 },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  prescriptionSummary: {
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: PhysioColors.textPrimary,
  },
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
  description: {
    fontSize: PhysioFontSize.lg,
    color: PhysioColors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
  timerSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  timerLabel: {
    fontSize: PhysioFontSize.sm,
    color: PhysioColors.textMuted,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
    color: PhysioColors.primary,
    fontVariant: ['tabular-nums'],
  },
  timerBtn: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: PhysioColors.primary,
    borderRadius: 14,
    minWidth: 140,
    alignItems: 'center',
  },
  timerBtnText: {
    fontSize: PhysioFontSize.lg,
    fontWeight: '700',
    color: PhysioColors.textInverse,
  },
});
