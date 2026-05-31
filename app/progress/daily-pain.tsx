import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../../src/constants/physioTheme';
import { logDailyPain } from '../../src/db/queries/logs';

const PAIN_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function DailyPainScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (selected !== null) {
      await logDailyPain(selected);
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
          <Text style={styles.headerTitle}>Daily Pain Log</Text>
        </View>
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle" size={64} color={PhysioColors.success} />
          <Text style={styles.resultTitle}>Logged successfully</Text>
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
        <Text style={styles.headerTitle}>Daily Pain Check-in</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.instruction}>
          How is your pain today overall?
        </Text>
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
          onPress={handleSave}
          disabled={selected === null}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }, selected === null && styles.saveBtnDisabled]}
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
  instruction: { fontSize: 18, fontWeight: '600', color: PhysioColors.textPrimary, marginBottom: 8 },
  hint: { fontSize: 14, color: PhysioColors.textMuted, marginBottom: 24 },
  painRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'center'
  },
  painBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: PhysioColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PhysioColors.cardBorder,
  },
  painBtnSelected: {
    borderColor: PhysioColors.primary,
    backgroundColor: PhysioColors.primary + '20',
  },
  painBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: PhysioColors.textSecondary,
  },
  painBtnTextSelected: {
    color: PhysioColors.primary,
  },
  saveBtn: {
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
    minHeight: PhysioTouchTarget.large,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  resultCard: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: PhysioColors.textPrimary, marginTop: 16 },
  doneBtn: { marginTop: 32, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, backgroundColor: PhysioColors.primary },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
