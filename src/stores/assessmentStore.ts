import { create } from 'zustand';
import { getDatabase } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

const USER_ID = 'default';

interface AssessmentState {
  saveAssessment: (data: { dash_score?: number; prwe_score?: number; rom_degrees?: number }) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  saveAssessment: async (data) => {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM assessments WHERE user_id = ? AND date = ?',
      [USER_ID, today]
    );
    if (existing) {
      const updates: string[] = [];
      const values: (number | null)[] = [];
      if (data.dash_score !== undefined) {
        updates.push('dash_score = ?');
        values.push(data.dash_score ?? null);
      }
      if (data.prwe_score !== undefined) {
        updates.push('prwe_score = ?');
        values.push(data.prwe_score ?? null);
      }
      if (data.rom_degrees !== undefined) {
        updates.push('rom_degrees = ?');
        values.push(data.rom_degrees ?? null);
      }
      if (updates.length > 0) {
        values.push(existing.id);
        await db.runAsync(
          `UPDATE assessments SET ${updates.join(', ')} WHERE id = ?`,
          values as (string | number | null)[]
        );
      }
    } else {
      const id = uuidv4();
      await db.runAsync(
        `INSERT INTO assessments (id, user_id, dash_score, prwe_score, rom_degrees, date) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, USER_ID, data.dash_score ?? null, data.prwe_score ?? null, data.rom_degrees ?? null, today]
      );
    }
  },
}));
