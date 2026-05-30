import { create } from 'zustand';
import { getDatabase } from '../db/database';
import type { PhysioProfile } from '../types/physio';

const DEFAULT_PROFILE_ID = 'default';

interface ProfileState {
  profile: PhysioProfile | null;
  isLoading: boolean;

  loadProfile: () => Promise<void>;
  createProfile: (data: { name: string; surgery_date?: string; fracture_type?: string }) => Promise<void>;
  updateProfile: (updates: Partial<Pick<PhysioProfile, 'name' | 'surgery_date' | 'fracture_type'>>) => Promise<void>;
  clearProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: true,

  loadProfile: async () => {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM profiles WHERE id = ?',
        [DEFAULT_PROFILE_ID]
      );
      if (row) {
        set({
          profile: {
            id: row.id,
            name: row.name,
            surgery_date: row.surgery_date,
            fracture_type: row.fracture_type,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
          isLoading: false,
        });
      } else {
        set({ profile: null, isLoading: false });
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
      set({ isLoading: false });
    }
  },

  createProfile: async (data) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO profiles (id, name, surgery_date, fracture_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_PROFILE_ID,
        data.name || 'Patient',
        data.surgery_date ?? null,
        data.fracture_type ?? null,
        now,
        now,
      ]
    );
    await get().loadProfile();
  },

  updateProfile: async (updates) => {
    const profile = get().profile;
    if (!profile) return;

    const db = await getDatabase();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.surgery_date !== undefined) {
      fields.push('surgery_date = ?');
      values.push(updates.surgery_date);
    }
    if (updates.fracture_type !== undefined) {
      fields.push('fracture_type = ?');
      values.push(updates.fracture_type);
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(profile.id);
      await db.runAsync(
        `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`,
        values as (string | number | null)[]
      );
      set({ profile: { ...profile, ...updates } });
    }
  },

  clearProfile: async () => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM profiles WHERE id = ?', [DEFAULT_PROFILE_ID]);
      set({ profile: null });
    } catch (e) {
      console.error('Clear profile error:', e);
    }
  },
}));
