import React from 'react';
import { View, ViewStyle, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadow } from '../../constants/theme';

interface GradientCardProps {
  gradient?: [string, string];
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  borderGlow?: boolean;
}

export function GradientCard({
  gradient = [Colors.surface, Colors.surfaceLight],
  children,
  style,
  onPress,
  borderGlow,
}: GradientCardProps) {
  const content = (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        borderGlow && {
          borderWidth: 1,
          borderColor: gradient[0] + '40',
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadow.md,
  },
  pressable: {
    borderRadius: BorderRadius.lg,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
