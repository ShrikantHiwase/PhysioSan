import { create } from 'zustand';
import { getDatabase } from '../db/database';

const DEFAULT_USER_ID = 'default';

export interface ExercisePrescription {
  exercise_id: string;
  sets: number;
  reps: number;
  hold_seconds: number;
}

interface PrescriptionState {
  getPrescription: (exerciseId: string) => Promise<ExercisePrescription | null>;
  savePrescription: (exerciseId: string, data: { sets: number; reps: number; hold_seconds: number }) => Promise<void>;
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  getPrescription: async (exerciseId: string) => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ exercise_id: string; sets: number; reps: number; hold_seconds: number }>(
      'SELECT exercise_id, sets, reps, hold_seconds FROM exercise_prescriptions WHERE user_id = ? AND exercise_id = ?',
      [DEFAULT_USER_ID, exerciseId]
    );
    if (row) {
      return {
        exercise_id: row.exercise_id,
        sets: row.sets ?? 3,
        reps: row.reps ?? 10,
        hold_seconds: row.hold_seconds ?? 5,
      };
    }
    return null;
  },

  savePrescription: async (exerciseId: string, data: { sets: number; reps: number; hold_seconds: number }) => {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO exercise_prescriptions (user_id, exercise_id, sets, reps, hold_seconds)
       VALUES (?, ?, ?, ?, ?)`,
      [DEFAULT_USER_ID, exerciseId, data.sets, data.reps, data.hold_seconds]
    );
  },
}));
