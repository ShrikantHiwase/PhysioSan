# PhysioSan

Rehabilitation app for wrist/hand recovery post-surgery. Built with Expo, NativeWind (Tailwind), and Supabase.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run on Android**
   ```bash
   npx expo start --android
   ```

3. **Sign in** – Use "Continue as Guest" to skip Google auth and access the app immediately.

4. **Daily Exercises** – Tap the "Exercises" tab to see your prescribed rehabilitation routine.

## Supabase Setup (Optional)

For cloud-synced exercises and progress:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor
3. Copy `.env.example` to `.env` and add:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

Without Supabase, the app uses built-in exercise data.

## Database Schema

- **profiles** – id, name, surgery_date, fracture_type
- **exercises** – id, name, video_url, description, phase (1–3)
- **logs** – id, user_id, exercise_id, reps_completed, pain_level (0–10), timestamp
- **assessments** – id, dash_score, prwe_score, rom_degrees, date

## Modules (Planned)

- **Module A:** One-handed dashboard (progress circle, pain trend)
- **Module B:** Guided exercise player (timer, GIF, voice cues, pain feedback)
- **Module C:** Progress analytics (QuickDASH, ROM growth chart, milestones)
- **Module D:** Computer vision (MediaPipe hand-tracking for ROM measurement)

## Design

- Medical-clean aesthetic (white/soft blue)
- Large touch targets for one-handed use
- High accessibility (large fonts)
