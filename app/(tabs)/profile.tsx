/**
 * Profile - PhysioSan
 * Name, surgery date, fracture type, sign out
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PhysioColors, PhysioFontSize } from '../../src/constants/physioTheme';
import { useProfileStore } from '../../src/stores/profileStore';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useProfileStore();
  const signOut = useAuthStore((s) => s.signOut);

  const [name, setName] = useState(profile?.name ?? '');
  const [surgeryDate, setSurgeryDate] = useState(profile?.surgery_date ?? '');
  const [fractureType, setFractureType] = useState(profile?.fracture_type ?? '');

  React.useEffect(() => {
    setName(profile?.name ?? '');
    setSurgeryDate(profile?.surgery_date ?? '');
    setFractureType(profile?.fracture_type ?? '');
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      name: name.trim() || 'Patient',
      surgery_date: surgeryDate.trim() || null,
      fracture_type: fractureType.trim() || null,
    });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your local data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your recovery profile</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onBlur={handleSave}
            placeholder="Your name"
            placeholderTextColor={PhysioColors.textMuted}
          />

          <Text style={styles.label}>Surgery Date</Text>
          <TextInput
            style={styles.input}
            value={surgeryDate}
            onChangeText={setSurgeryDate}
            onBlur={handleSave}
            placeholder="e.g. 2024-01-15"
            placeholderTextColor={PhysioColors.textMuted}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Fracture Type</Text>
          <TextInput
            style={styles.input}
            value={fractureType}
            onChangeText={setFractureType}
            onBlur={handleSave}
            placeholder="e.g. Distal Radius"
            placeholderTextColor={PhysioColors.textMuted}
          />
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
        >
          <Ionicons name="log-out-outline" size={22} color={PhysioColors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PhysioColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: PhysioColors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: PhysioColors.textSecondary,
    marginTop: 6,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PhysioColors.textSecondary,
  },
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
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PhysioColors.error + '40',
  },
  signOutPressed: {
    opacity: 0.9,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: PhysioColors.error,
  },
});
