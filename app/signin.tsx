import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PhysioColors } from '../src/constants/physioTheme';
import { useAuthStore } from '../src/stores/authStore';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);
  const isLoading = useAuthStore((s) => s.isAuthLoading);
  const error = useAuthStore((s) => s.authError);
  const clearError = useAuthStore((s) => s.clearAuthError);

  const handleContinueAsGuest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signInAsGuest();
    } catch {
      useAuthStore.getState().setAuthError('Could not continue. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="fitness" size={48} color={PhysioColors.primary} />
          </View>
          <Text style={styles.brand}>PhysioSan</Text>
        </View>
        <Text style={styles.tagline}>Your rehabilitation companion</Text>
      </View>

      <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.welcome}>Get Started</Text>
        <Text style={styles.instruction}>
          Continue without an account to start your recovery journey
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={clearError} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={PhysioColors.error} />
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={handleContinueAsGuest}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.continueBtn,
            (pressed || isLoading) && styles.btnPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" style={styles.btnSpinner} />
          ) : (
            <>
              <Text style={styles.continueBtnText}>Continue as Guest</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Want to set up your profile? </Text>
          <Pressable
            onPress={() => useAuthStore.getState().navigateToSignup()}
            style={({ pressed }) => [styles.signupLink, pressed && styles.linkPressed]}
          >
            <Text style={styles.signupLinkText}>Create profile</Text>
            <Ionicons name="arrow-forward" size={14} color={PhysioColors.primary} style={styles.signupArrow} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: PhysioColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: PhysioColors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    color: PhysioColors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: PhysioColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: PhysioColors.cardBorder,
  },
  welcome: {
    color: PhysioColors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  instruction: {
    color: PhysioColors.textSecondary,
    fontSize: 15,
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PhysioColors.error + '15',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: PhysioColors.error + '40',
  },
  errorText: { color: PhysioColors.error, fontSize: 14, flex: 1 },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: PhysioColors.primary,
  },
  btnSpinner: {},
  btnPressed: { opacity: 0.9 },
  continueBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
    gap: 4,
  },
  footerText: { color: PhysioColors.textSecondary, fontSize: 15 },
  signupLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkPressed: { opacity: 0.8 },
  signupLinkText: { color: PhysioColors.primary, fontSize: 15, fontWeight: '600' },
  signupArrow: { marginLeft: 2 },
});
