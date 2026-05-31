import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors } from '../../constants/physioTheme';

interface PrescriptionEditorProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  sets: string;
  setSets: (val: string) => void;
  reps: string;
  setReps: (val: string) => void;
  holdSeconds: string;
  setHoldSeconds: (val: string) => void;
  onSave: () => void;
}

export function PrescriptionEditor({
  isEditing,
  setIsEditing,
  sets,
  setSets,
  reps,
  setReps,
  holdSeconds,
  setHoldSeconds,
  onSave,
}: PrescriptionEditorProps) {
  const setsNum = Math.max(1, parseInt(sets, 10) || 3);
  const repsNum = Math.max(1, parseInt(reps, 10) || 10);
  const holdNum = Math.max(0, parseInt(holdSeconds, 10) || 5);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="medical-outline" size={22} color={PhysioColors.primary} />
        <Text style={styles.sectionTitle}>Therapist Prescription</Text>
        <Pressable
          onPress={() => {
            if (isEditing) onSave();
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
            onPress={onSave}
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
  );
}

const styles = StyleSheet.create({
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
});
