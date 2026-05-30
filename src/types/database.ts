/**
 * Supabase Database Types for Physio Recovery App
 * Run: supabase gen types typescript --project-id <id> > src/types/database.ts
 * to regenerate from your Supabase project.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          surgery_date: string | null;
          fracture_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          surgery_date?: string | null;
          fracture_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          surgery_date?: string | null;
          fracture_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          video_url: string | null;
          description: string | null;
          phase: 1 | 2 | 3;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          video_url?: string | null;
          description?: string | null;
          phase: 1 | 2 | 3;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          video_url?: string | null;
          description?: string | null;
          phase?: 1 | 2 | 3;
          created_at?: string;
          updated_at?: string;
        };
      };
      logs: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          reps_completed: number;
          pain_level: number;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          reps_completed: number;
          pain_level: number;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          reps_completed?: number;
          pain_level?: number;
          timestamp?: string;
          created_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          dash_score: number | null;
          prwe_score: number | null;
          rom_degrees: number | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dash_score?: number | null;
          prwe_score?: number | null;
          rom_degrees?: number | null;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dash_score?: number | null;
          prwe_score?: number | null;
          rom_degrees?: number | null;
          date?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type Log = Database['public']['Tables']['logs']['Row'];
export type Assessment = Database['public']['Tables']['assessments']['Row'];
