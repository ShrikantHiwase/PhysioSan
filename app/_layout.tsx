import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { getDatabase } from '../src/db/database';
import { PhysioColors } from '../src/constants/physioTheme';

import SignInScreen from './signin';
import SignupScreen from './signup';
import '../global.css';

const MIN_LOADING_SECONDS = 0.8;

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const authState = useAuthStore((s) => s.authState);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  useEffect(() => {
    async function setup() {
      await getDatabase();
      await init();
    }
    setup();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingComplete(true), MIN_LOADING_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, []);

  const showLoading = authState === 'loading' || !minLoadingComplete;

  if (showLoading) {
    return (
      <View style={styles.loading}>
        <View style={styles.logoIcon}>
          <Ionicons name="fitness" size={56} color={PhysioColors.primary} />
        </View>
        <Text style={styles.brand}>PhysioSan</Text>
        <Text style={styles.tagline}>Digital Rehabilitation App</Text>
        <ActivityIndicator size="large" color={PhysioColors.primary} style={styles.spinner} />
      </View>
    );
  }

  if (authState === 'signed_out') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <SignInScreen />
      </GestureHandlerRootView>
    );
  }

  if (authState === 'needs_signup') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <SignupScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: PhysioColors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="exercise/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="progress/quickdash"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="progress/rom-camera"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="progress/rom"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PhysioColors.background,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: PhysioColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: PhysioColors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: PhysioColors.textSecondary,
    marginTop: 8,
    marginBottom: 32,
  },
  spinner: { marginTop: 8 },
});
