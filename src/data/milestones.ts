/**
 * Recovery milestones - configurable by surgery date
 */
export interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  completed: boolean;
}

export const DEFAULT_MILESTONES: Omit<Milestone, 'completed'>[] = [
  { id: '1', week: 1, title: 'Week 1: Initial Healing', description: 'Rest, elevation, gentle movement as advised' },
  { id: '2', week: 2, title: 'Week 2: Early Mobilization', description: 'Begin passive range of motion exercises' },
  { id: '3', week: 4, title: 'Week 4: Splint Removal', description: 'Splint/cast removed, active exercises begin' },
  { id: '4', week: 6, title: 'Week 6: Strengthening', description: 'Progressive resistance exercises' },
  { id: '5', week: 12, title: 'Week 12: Return to Activity', description: 'Gradual return to normal activities' },
];

export function getWeeksSinceDate(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}
