import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PhysioColors } from '../src/constants/physioTheme';
import { useAuthStore } from '../src/stores/authStore';

const FRACTURE_OPTIONS = [
  { value: 'distal_radius', label: 'Distal Radius' },
  { value: 'scaphoid', label: 'Scaphoid' },
  { value: 'metacarpal', label: 'Metacarpal' },
  { value: 'other', label: 'Other' },
];

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const signUpAsGuest = useAuthStore((s) => s.signUpAsGuest);
  const authError = useAuthStore((s) => s.authError);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  const [name, setName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [fractureType, setFractureType] = useState<string | undefined>();
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      await signUpAsGuest({
        name: name.trim(),
        surgery_date: surgeryDate.trim() || undefined,
        fracture_type: fractureType,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Ionicons name="fitness" size={40} color={PhysioColors.primary} />
          </View>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Set up your PhysioSan profile to get started</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={PhysioColors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Surgery Date (optional)</Text>
          <TextInput
            style={styles.input}
            value={surgeryDate}
            onChangeText={setSurgeryDate}
            placeholder="e.g. 2024-01-15"
            placeholderTextColor={PhysioColors.textMuted}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Fracture Type (optional)</Text>
          <View style={styles.optionsRow}>
            {FRACTURE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setFractureType(opt.value)}
                style={[styles.optionBtn, fractureType === opt.value && styles.optionBtnActive]}
              >
                <Text style={[styles.optionText, fractureType === opt.value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {(error || authError) ? (
            <Text style={styles.error}>{error || authError}</Text>
          ) : null}

          <Pressable
            onPress={handleSignup}
            disabled={isAuthLoading}
            style={({ pressed }) => [
              styles.signupBtn,
              (pressed || isAuthLoading) && styles.signupBtnPressed,
            ]}
          >
            {isAuthLoading ? (
              <Text style={styles.signupBtnText}>Creating...</Text>
            ) : (
              <>
                <Text style={styles.signupBtnText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </Pressable>

          <View style={styles.signinLink}>
            <Text style={styles.signinLinkText}>Already have a profile?</Text>
            <Pressable
              onPress={() => useAuthStore.getState().signInAsGuest()}
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.signinLinkBtn}>Continue as guest</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: PhysioColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { color: PhysioColors.textPrimary, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: PhysioColors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
  form: { gap: 16 },
  label: { color: PhysioColors.textSecondary, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: PhysioColors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  optionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PhysioColors.surface,
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
  },
  optionBtnActive: { backgroundColor: PhysioColors.primary + '20', borderColor: PhysioColors.primary },
  optionText: { color: PhysioColors.textSecondary, fontSize: 13, fontWeight: '500' },
  optionTextActive: { color: PhysioColors.primary, fontWeight: '600' },
  error: { color: PhysioColors.error, fontSize: 14, marginTop: 4 },
  signupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: PhysioColors.primary,
  },
  signupBtnPressed: { opacity: 0.9 },
  signupBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  signinLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, justifyContent: 'center' },
  signinLinkText: { color: PhysioColors.textSecondary, fontSize: 15 },
  signinLinkBtn: { color: PhysioColors.primary, fontSize: 15, fontWeight: '600' },
});
