import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { PhysioColors, PhysioFontSize } from '../../constants/physioTheme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={PhysioColors.primary} />
      <Text style={styles.message}>{message}</Text>
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
    fontWeight: '500',
  },
});
