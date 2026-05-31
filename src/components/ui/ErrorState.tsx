import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../../constants/physioTheme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={PhysioColors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: PhysioFontSize.md,
    color: PhysioColors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PhysioColors.primary,
    borderRadius: 12,
    minHeight: PhysioTouchTarget.minHeight,
    justifyContent: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: PhysioFontSize.md,
  },
});
