/**
 * Physio exercises - fallback data when Supabase is not configured
 * Phase 1: Early recovery, Phase 2: Mid, Phase 3: Late
 */
export interface PhysioExercise {
  id: string;
  name: string;
  description: string;
  phase: 1 | 2 | 3;
  video_url?: string;
  gif_url?: string; // GIF or image URL for exercise demo
  sets?: number;
  reps?: string; // e.g. "10" or "5 sec hold"
}

export const PHYSIO_EXERCISES: PhysioExercise[] = [
  {
    id: '1',
    name: 'Passive Finger Flexion',
    description: 'Gently bend fingers toward palm with assistance. Hold 5 seconds.',
    phase: 1,
    sets: 3,
    reps: '5 sec hold',
  },
  {
    id: '2',
    name: 'Wrist Circles',
    description: 'Slow circular motions with wrist. 10 reps each direction.',
    phase: 1,
    sets: 2,
    reps: '10 each way',
  },
  {
    id: '3',
    name: 'Elbow Flexion',
    description: 'Bend elbow bringing hand to shoulder. Hold 5 seconds.',
    phase: 1,
    sets: 3,
    reps: '5 sec hold',
  },
  {
    id: '4',
    name: 'Shoulder Pendulum',
    description: 'Lean forward, let arm hang and swing gently.',
    phase: 1,
    sets: 1,
    reps: '2 min',
  },
  {
    id: '5',
    name: 'Grip Squeeze',
    description: 'Squeeze soft ball or putty. 10 reps, 5 sec hold.',
    phase: 1,
    sets: 3,
    reps: '10',
  },
  {
    id: '6',
    name: 'Active Finger Extension',
    description: 'Extend fingers against light resistance. Hold 3 seconds.',
    phase: 2,
    sets: 3,
    reps: '10',
  },
  {
    id: '7',
    name: 'Wrist Flexion Stretch',
    description: 'Gently stretch wrist into flexion. Hold 15 seconds.',
    phase: 2,
    sets: 3,
    reps: '15 sec',
  },
  {
    id: '8',
    name: 'Pronation/Supination',
    description: 'Rotate forearm palm up and down. 10 reps each.',
    phase: 2,
    sets: 3,
    reps: '10',
  },
];
