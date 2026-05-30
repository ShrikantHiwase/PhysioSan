/**
 * QuickDASH questionnaire - 11 items, 5-point scale
 * Score 0-100 (0 = no disability, 100 = severe)
 */
export const QUICKDASH_QUESTIONS = [
  { id: 1, text: 'Open a tight or new jar' },
  { id: 2, text: 'Write' },
  { id: 3, text: 'Turn a key' },
  { id: 4, text: 'Prepare a meal' },
  { id: 5, text: 'Push open a heavy door' },
  { id: 6, text: 'Place an object on a shelf above your head' },
  { id: 7, text: 'Do heavy household chores (e.g. wash walls, floors)' },
  { id: 8, text: 'Garden or do yard work' },
  { id: 9, text: 'Make a bed' },
  { id: 10, text: 'Carry a shopping bag or briefcase' },
  { id: 11, text: 'Change a lightbulb overhead' },
] as const;

export const QUICKDASH_OPTIONS = [
  { value: 1, label: 'No difficulty' },
  { value: 2, label: 'Mild difficulty' },
  { value: 3, label: 'Moderate difficulty' },
  { value: 4, label: 'Severe difficulty' },
  { value: 5, label: 'Unable' },
] as const;

/** Calculate QuickDASH score: ((sum/n) - 1) * 25, 0-100 */
export function calculateQuickDASHScore(answers: number[]): number | null {
  const valid = answers.filter((a) => a >= 1 && a <= 5);
  if (valid.length < 10) return null;
  const avg = valid.reduce((s, a) => s + a, 0) / valid.length;
  return Math.round(((avg - 1) * 25) * 10) / 10;
}
