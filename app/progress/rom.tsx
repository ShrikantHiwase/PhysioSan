/**
 * ROM (Range of Motion) entry - Module C
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../../src/constants/physioTheme';
import { useAssessmentStore } from '../../src/stores/assessmentStore';

export default function ROMEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveAssessment } = useAssessmentStore();
  const [degrees, setDegrees] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const val = parseFloat(degrees);
    if (!isNaN(val) && val >= 0 && val <= 180) {
      await saveAssessment({ rom_degrees: val });
      setSaved(true);
    }
  };

  if (saved) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={PhysioColors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>ROM</Text>
        </View>
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle" size={64} color={PhysioColors.success} />
          <Text style={styles.resultTitle}>Saved</Text>
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
        <Text style={styles.headerTitle}>Log ROM</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.instruction}>
          Enter your wrist flexion/extension range (degrees) as measured by your therapist or the app.
        </Text>
        <TextInput
          style={styles.input}
          value={degrees}
          onChangeText={setDegrees}
          placeholder="e.g. 45"
          placeholderTextColor={PhysioColors.textMuted}
          keyboardType="decimal-pad"
        />
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
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
  content: { padding: 20 },
  instruction: { fontSize: 15, color: PhysioColors.textSecondary, marginBottom: 20 },
  input: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 12,
    padding: 18,
    fontSize: 24,
    color: PhysioColors.textPrimary,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
    marginBottom: 24,
  },
  saveBtn: {
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
    minHeight: PhysioTouchTarget.large,
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  resultCard: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: PhysioColors.textPrimary, marginTop: 16 },
  doneBtn: { marginTop: 32, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, backgroundColor: PhysioColors.primary },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
