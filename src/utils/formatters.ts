// ============================================
// FitForge Utility Formatters
// ============================================

/**
 * Format duration from seconds to readable string
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format weight with unit
 */
export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${Math.round(kg * 2.20462)} lbs`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format calories
 */
export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format date as short day name
 */
export function formatDayShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days ago in ISO format
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

/**
 * Format percentage change with sign
 */
export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Math.round(value * 10) / 10}%`;
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}
