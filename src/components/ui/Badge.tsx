import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface BadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  text,
  color = Colors.accent,
  bgColor,
  size = 'sm',
}: BadgeProps) {
  const backgroundColor = bgColor || color + '18';
  const fontSize = size === 'sm' ? 10 : size === 'md' ? 12 : 14;
  const paddingH = size === 'sm' ? 8 : size === 'md' ? 10 : 14;
  const paddingV = size === 'sm' ? 3 : size === 'md' ? 4 : 6;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
