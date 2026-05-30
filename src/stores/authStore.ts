import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from '../db/database';
import { useProfileStore } from './profileStore';

const AUTH_GUEST_KEY = 'physiosan_auth_guest';

export type AuthState = 'loading' | 'signed_out' | 'needs_signup' | 'signed_in';

interface AuthStoreState {
  authState: AuthState;
  isAuthLoading: boolean;
  authError: string | null;

  init: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signUpAsGuest: (payload: { name: string; surgery_date?: string; fracture_type?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  navigateToSignup: () => void;
  clearAuthError: () => void;
  setAuthError: (msg: string) => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  authState: 'loading',
  isAuthLoading: false,
  authError: null,

  init: async () => {
    try {
      await getDatabase();
      const guest = await AsyncStorage.getItem(AUTH_GUEST_KEY);

      if (guest === 'true') {
        set({ authState: 'signed_in' });
        await useProfileStore.getState().loadProfile();
        return;
      }

      const profile = useProfileStore.getState().profile;
      if (profile) {
        set({ authState: 'signed_in' });
        return;
      }

      set({ authState: 'signed_out' });
    } catch (e) {
      console.error('Auth init error:', e);
      set({ authState: 'signed_out' });
    }
  },

  signInAsGuest: async () => {
    await AsyncStorage.setItem(AUTH_GUEST_KEY, 'true');
    set({ authState: 'signed_in' });
    const profileStore = useProfileStore.getState();
    await profileStore.loadProfile();
    if (!useProfileStore.getState().profile) {
      await profileStore.createProfile({ name: 'Patient' });
    }
  },

  signUpAsGuest: async (payload) => {
    await AsyncStorage.setItem(AUTH_GUEST_KEY, 'true');
    await useProfileStore.getState().createProfile(payload);
    set({ authState: 'signed_in' });
  },

  signOut: async () => {
    await AsyncStorage.removeItem(AUTH_GUEST_KEY);
    await useProfileStore.getState().clearProfile();
    set({ authState: 'signed_out' });
  },

  navigateToSignup: () => {
    set({ authState: 'needs_signup' });
  },

  clearAuthError: () => set({ authError: null }),
  setAuthError: (msg) => set({ authError: msg }),
}));
