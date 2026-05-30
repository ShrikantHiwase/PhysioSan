/**
 * Local exercise GIF assets - maps exercise ID to bundled GIF
 * Add new entries when adding exercises with local GIFs
 */
export const EXERCISE_GIFS: Record<string, number> = {
  '1': require('../../assets/Excercises/Passive Finger Flexion.gif'),
  '2': require('../../assets/Excercises/Wrist_Circles.gif'),
  '3': require('../../assets/Excercises/Elbow flexion.gif'),
  '4': require('../../assets/Excercises/Shoulder Pendulum.gif'),
  '5': require('../../assets/Excercises/grip squeeze.gif'),
  '6': require('../../assets/Excercises/active finger extention.gif'),
  '7': require('../../assets/Excercises/Wrist Flexion stretch.gif'),
  '8': require('../../assets/Excercises/pronation supination.gif'),
};

export function getExerciseGifSource(exerciseId: string, gifUrl?: string | null): { uri: string } | number | undefined {
  const local = EXERCISE_GIFS[exerciseId];
  if (local) return local;
  if (gifUrl) return { uri: gifUrl };
  return undefined;
}
