-- Physio Recovery App - Initial Schema
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles: User recovery profile
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Patient',
  surgery_date DATE,
  fracture_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises: Rehabilitation exercises by phase
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  video_url TEXT,
  description TEXT,
  phase SMALLINT NOT NULL CHECK (phase IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs: Exercise completion logs with pain tracking
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  reps_completed INTEGER NOT NULL DEFAULT 0,
  pain_level SMALLINT NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments: QuickDASH, PRWE, ROM scores
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dash_score DECIMAL(5,2),
  prwe_score DECIMAL(5,2),
  rom_degrees DECIMAL(5,2),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_exercise_id ON logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_exercises_phase ON exercises(phase);
CREATE INDEX IF NOT EXISTS idx_assessments_user_date ON assessments(user_id, date);

-- Enable Row Level Security (RLS) - adjust policies for your auth setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- For development: allow all operations (replace with proper auth policies in production)
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for exercises" ON exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for logs" ON logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for assessments" ON assessments FOR ALL USING (true) WITH CHECK (true);

-- Seed sample exercises (Phase 1 - Early recovery)
-- Run once; re-running will add duplicates. Truncate exercises first to re-seed.
INSERT INTO exercises (name, description, phase, video_url) VALUES
  ('Passive Finger Flexion', 'Gently bend fingers toward palm with assistance. Hold 5 seconds.', 1, NULL),
  ('Wrist Circles', 'Slow circular motions with wrist. 10 reps each direction.', 1, NULL),
  ('Elbow Flexion', 'Bend elbow bringing hand to shoulder. Hold 5 seconds.', 1, NULL),
  ('Shoulder Pendulum', 'Lean forward, let arm hang and swing gently. 2 min.', 1, NULL),
  ('Grip Squeeze', 'Squeeze soft ball or putty. 10 reps, 5 sec hold.', 1, NULL);
