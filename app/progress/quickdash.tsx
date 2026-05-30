/**
 * QuickDASH Questionnaire - Module C
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors, PhysioTouchTarget } from '../../src/constants/physioTheme';
import { QUICKDASH_QUESTIONS, QUICKDASH_OPTIONS, calculateQuickDASHScore } from '../../src/data/quickDASH';
import { useAssessmentStore } from '../../src/stores/assessmentStore';

export default function QuickDASHScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveAssessment } = useAssessmentStore();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const values = QUICKDASH_QUESTIONS.map((q) => answers[q.id]).filter((v) => v != null);
    const score = calculateQuickDASHScore(values);
    if (score !== null) {
      await saveAssessment({ dash_score: score });
      setSubmitted(true);
    }
  };

  const values = QUICKDASH_QUESTIONS.map((q) => answers[q.id]).filter((v) => v != null);
  const score = calculateQuickDASHScore(values);
  const canSubmit = values.length >= 10;

  if (submitted && score !== null) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={PhysioColors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>QuickDASH</Text>
        </View>
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle" size={64} color={PhysioColors.success} />
          <Text style={styles.resultTitle}>Score Saved</Text>
          <Text style={styles.resultScore}>{score}</Text>
          <Text style={styles.resultHint}>0 = no disability, 100 = severe</Text>
          <Pressable onPress={() => router.back()} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={PhysioColors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>QuickDASH</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Rate your difficulty in the past week (1 = No difficulty, 5 = Unable)
        </Text>

        {QUICKDASH_QUESTIONS.map((q) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{q.id}. {q.text}</Text>
            <View style={styles.optionsRow}>
              {QUICKDASH_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => handleSelect(q.id, opt.value)}
                  style={[
                    styles.optionBtn,
                    answers[q.id] === opt.value && styles.optionBtnSelected,
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    answers[q.id] === opt.value && styles.optionTextSelected,
                  ]}>
                    {opt.value}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
        >
          <Text style={styles.submitBtnText}>
            {canSubmit ? 'Save Score' : `Answer ${10 - values.length} more required`}
          </Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: PhysioColors.textPrimary },
  scrollContent: { padding: 20, paddingBottom: 24 },
  instruction: {
    fontSize: 15,
    color: PhysioColors.textSecondary,
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: PhysioColors.textPrimary,
    marginBottom: 12,
  },
  optionsRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: PhysioColors.surfaceLight,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionBtnSelected: {
    borderColor: PhysioColors.primary,
    backgroundColor: PhysioColors.primary + '15',
  },
  optionText: { fontSize: 14, fontWeight: '600', color: PhysioColors.textSecondary },
  optionTextSelected: { color: PhysioColors.primary },
  submitBtn: {
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
    minHeight: PhysioTouchTarget.large,
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  resultCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultTitle: { fontSize: 20, fontWeight: '700', color: PhysioColors.textPrimary, marginTop: 16 },
  resultScore: { fontSize: 48, fontWeight: '800', color: PhysioColors.primary, marginTop: 8 },
  resultHint: { fontSize: 14, color: PhysioColors.textMuted, marginTop: 8 },
  doneBtn: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
  },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
