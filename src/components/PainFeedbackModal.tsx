/**
 * Post-set pain feedback modal - "What was your pain level during this set?"
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, Dimensions,
} from 'react-native';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../constants/physioTheme';

const PAIN_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface PainFeedbackModalProps {
  visible: boolean;
  onSelect: (painLevel: number) => void;
  setNumber: number;
}

export function PainFeedbackModal({ visible, onSelect, setNumber }: PainFeedbackModalProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selected !== null) {
      onSelect(selected);
      setSelected(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Set {setNumber} Complete</Text>
          <Text style={styles.question}>What was your pain level during this set?</Text>
          <Text style={styles.hint}>0 = No pain, 10 = Worst pain</Text>

          <View style={styles.painRow}>
            {PAIN_LEVELS.map((level) => (
              <Pressable
                key={level}
                onPress={() => setSelected(level)}
                style={[
                  styles.painBtn,
                  selected === level && styles.painBtnSelected,
                ]}
              >
                <Text style={[
                  styles.painBtnText,
                  selected === level && styles.painBtnTextSelected,
                ]}>
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={selected === null}
            style={[styles.submitBtn, selected === null && styles.submitBtnDisabled]}
          >
            <Text style={styles.submitBtnText}>Submit</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: PhysioColors.textPrimary,
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    color: PhysioColors.textSecondary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: PhysioColors.textMuted,
    marginBottom: 20,
  },
  painRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  painBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PhysioColors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  painBtnSelected: {
    borderColor: PhysioColors.primary,
    backgroundColor: PhysioColors.primary + '20',
  },
  painBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: PhysioColors.textSecondary,
  },
  painBtnTextSelected: {
    color: PhysioColors.primary,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
    minHeight: PhysioTouchTarget.large,
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
