/**
 * Displays GIF or image for an exercise.
 * Accepts local assets (require) or remote URLs via gifSource.
 */
import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors } from '../constants/physioTheme';

const MEDIA_HEIGHT = 200;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_WIDTH = SCREEN_WIDTH - 40;

type Props = {
  /** Local require() or { uri } - use getExerciseGifSource() to resolve */
  gifSource?: ImageSourcePropType | null;
  /** @deprecated Use gifSource. Fallback for remote URL. */
  gifUrl?: string | null;
  videoUrl?: string | null;
  style?: object;
};

export function ExerciseMedia({ gifSource, gifUrl, videoUrl, style }: Props) {
  const [imageError, setImageError] = useState(false);

  const source = gifSource ?? (gifUrl ? { uri: gifUrl, headers: { Accept: 'image/*' } } : undefined);
  const hasMedia = source && !imageError;

  if (hasMedia) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={source}
          style={styles.media}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.placeholder, style]}>
      <Ionicons name="fitness" size={48} color={PhysioColors.primary + '40'} />
      <Text style={styles.placeholderText}>Exercise demo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PhysioColors.surfaceLight,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: PhysioColors.textMuted,
  },
});
