/** PhysioSan profile - local/Supabase */
export interface PhysioProfile {
  id: string;
  name: string;
  surgery_date: string | null;
  fracture_type: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Exercise log entry */
export interface PhysioLog {
  id: string;
  user_id: string;
  exercise_id: string;
  reps_completed: number;
  pain_level: number;
  timestamp: string;
}

/** Assessment (QuickDASH, PRWE, ROM) */
export interface PhysioAssessment {
  id: string;
  user_id: string;
  dash_score: number | null;
  prwe_score: number | null;
  rom_degrees: number | null;
  date: string;
}
