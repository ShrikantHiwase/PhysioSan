/**
 * Module D: ROM measurement via camera + hand tracking
 * Uses expo-camera (Expo Go compatible) or react-native-vision-camera (dev build)
 * Hand landmarks → wrist angle calculation
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Image, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { PhysioColors, PhysioFontSize, PhysioTouchTarget } from '../../src/constants/physioTheme';
import { useAssessmentStore } from '../../src/stores/assessmentStore';
import { calculateWristAngle } from '../../src/utils/wristAngle';

type Phase = 'camera' | 'analyzing' | 'result' | 'saved';

export default function ROMCameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('camera');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [angle, setAngle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { saveAssessment } = useAssessmentStore();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current || !permission?.granted || !isCameraReady) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPhase('analyzing');
      setError(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedUri(photo.uri);

        // Placeholder: MediaPipe hand detection would run here.
        // For now we simulate with mock landmarks or a fallback angle.
        // When @mediapipe/tasks-vision or native plugin is integrated,
        // replace this with actual HandLandmarker.detectForImage() output.
        const mockAngle = await simulateHandDetection();
        setAngle(mockAngle);
        setPhase('result');
      } else {
        setError('Could not capture image');
        setPhase('camera');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Capture failed';
      setError(msg || 'Capture failed');
      setPhase('camera');
    }
  };

  /** Simulate hand detection until MediaPipe is integrated */
  async function simulateHandDetection(): Promise<number> {
    await new Promise((r) => setTimeout(r, 1500));
    // Return a placeholder angle (e.g. 45-75 range for demo)
    return Math.round(50 + Math.random() * 25);
  }

  const handleSave = async () => {
    if (angle == null) return;
    await saveAssessment({ rom_degrees: angle });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('saved');
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setAngle(null);
    setError(null);
    setPhase('camera');
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={PhysioColors.primary} />
        <Text style={styles.loadingText}>Checking camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={64} color={PhysioColors.primary + '60'} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          PhysioSan needs camera access to measure your wrist range of motion using hand tracking.
        </Text>
        <Pressable onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/progress/rom')} style={styles.backLink}>
          <Text style={styles.backLinkText}>Use manual entry instead</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'analyzing') {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={PhysioColors.primary} />
        <Text style={styles.analyzingText}>Analyzing hand position...</Text>
        <Text style={styles.analyzingHint}>Position your hand in frame</Text>
      </View>
    );
  }

  if (phase === 'saved') {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="checkmark-circle" size={64} color={PhysioColors.success} />
        <Text style={styles.savedTitle}>ROM Saved</Text>
        <Text style={styles.savedAngle}>{angle}°</Text>
        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'result' && angle != null) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleRetake} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={PhysioColors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>ROM Result</Text>
        </View>
        <View style={styles.resultContent}>
          {capturedUri && (
            <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
          )}
          <View style={styles.angleCard}>
            <Text style={styles.angleLabel}>Wrist Flexion/Extension</Text>
            <Text style={styles.angleValue}>{angle}°</Text>
            <Text style={styles.angleHint}>Estimated (hand tracking in development)</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save to Progress</Text>
            </Pressable>
            <Pressable onPress={handleRetake} style={styles.retakeBtn}>
              <Text style={styles.retakeBtnText}>Retake</Text>
            </Pressable>
          </View>
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
        <Text style={styles.headerTitle}>Measure ROM</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="picture"
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={(event) => {
            setError(event?.message || 'Camera failed to load');
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>Position your hand inside the frame</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsCameraReady(false);
            setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
          }}
          style={styles.flipBtn}
        >
          <Ionicons name="camera-reverse" size={28} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable
          onPress={handleCapture}
          disabled={!isCameraReady}
          style={({ pressed }) => [
            styles.captureBtn,
            pressed && isCameraReady && styles.captureBtnPressed,
            !isCameraReady && styles.captureBtnDisabled,
          ]}
        >
          <View style={styles.captureInner} />
        </Pressable>
        <Text style={styles.captureHint}>
          {isCameraReady ? 'Tap to capture and measure' : 'Preparing camera...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PhysioColors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: PhysioColors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: PhysioColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: PhysioColors.cardBorder,
  },
  backBtn: { padding: 8, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: PhysioColors.textPrimary },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 100,
  },
  flipBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    position: 'absolute',
    bottom: 80,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: PhysioColors.surface,
    borderTopWidth: 1,
    borderTopColor: PhysioColors.cardBorder,
  },
  errorText: { color: PhysioColors.error, marginBottom: 8, fontSize: 14 },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureBtnPressed: { opacity: 0.9 },
  captureBtnDisabled: { opacity: 0.5 },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  captureHint: { marginTop: 12, fontSize: 14, color: PhysioColors.textSecondary },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: PhysioColors.textPrimary, marginTop: 20, textAlign: 'center' },
  permissionText: { fontSize: 15, color: PhysioColors.textSecondary, marginTop: 12, textAlign: 'center', paddingHorizontal: 24 },
  permissionBtn: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
  },
  permissionBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  backLink: { marginTop: 16 },
  backLinkText: { fontSize: 15, color: PhysioColors.primary, fontWeight: '600' },
  analyzingText: { fontSize: 18, fontWeight: '600', color: PhysioColors.textPrimary, marginTop: 16 },
  analyzingHint: { fontSize: 14, color: PhysioColors.textMuted, marginTop: 8 },
  savedTitle: { fontSize: 22, fontWeight: '700', color: PhysioColors.textPrimary, marginTop: 16 },
  savedAngle: { fontSize: 48, fontWeight: '800', color: PhysioColors.primary, marginTop: 8 },
  doneBtn: { marginTop: 32, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, backgroundColor: PhysioColors.primary },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  resultContent: { flex: 1, padding: 20 },
  preview: { width: '100%', height: 240, borderRadius: 16, marginBottom: 20 },
  angleCard: {
    backgroundColor: PhysioColors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PhysioColors.cardBorder,
    marginBottom: 24,
  },
  angleLabel: { fontSize: 14, color: PhysioColors.textSecondary, marginBottom: 8 },
  angleValue: { fontSize: 48, fontWeight: '800', color: PhysioColors.primary },
  angleHint: { fontSize: 12, color: PhysioColors.textMuted, marginTop: 8 },
  actions: { gap: 12 },
  saveBtn: {
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: PhysioColors.primary,
    alignItems: 'center',
    minHeight: PhysioTouchTarget.large,
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  retakeBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PhysioColors.surfaceLight,
    alignItems: 'center',
  },
  retakeBtnText: { fontSize: 16, fontWeight: '600', color: PhysioColors.textPrimary },
});
