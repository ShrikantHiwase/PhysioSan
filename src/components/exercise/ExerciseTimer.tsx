import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../../constants/physioTheme';

interface ExerciseTimerProps {
  timerSeconds: number;
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  holdNum: number;
  phase: string;
  startHold: () => void;
  exerciseComplete: boolean;
  completeSet: () => void;
  handleNextExercise: () => void;
  nextExerciseName: string | null;
}

export function ExerciseTimer({
  timerSeconds,
  isRunning,
  setIsRunning,
  holdNum,
  phase,
  startHold,
  exerciseComplete,
  completeSet,
  handleNextExercise,
  nextExerciseName
}: ExerciseTimerProps) {
  return (
    <View style={styles.timerSection}>
      <Text style={styles.timerLabel}>Timer</Text>
      <Text style={styles.timerValue}>
        {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
      </Text>
      {!exerciseComplete ? (
        <>
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
        </>
      ) : (
        <Pressable
          onPress={handleNextExercise}
          style={[styles.nextBtn, { minHeight: PhysioTouchTarget.large }]}
        >
          <Text style={styles.nextBtnText}>
            {nextExerciseName ? `Next: ${nextExerciseName}` : 'Done for Today'}
          </Text>
          <Ionicons name={nextExerciseName ? "arrow-forward" : "checkmark"} size={20} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  completeBtn: {
    marginTop: 16,
    width: '100%',
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
    width: '100%',
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
});
