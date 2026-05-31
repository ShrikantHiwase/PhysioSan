import { getDatabase } from '../database';

const USER_ID = 'default';

export async function getTodayProgress(): Promise<{ completedSets: number; prescribedSets: number }> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const logsRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM logs WHERE user_id = ? AND date(timestamp) = ?`,
    [USER_ID, today]
  );
  const completedSets = logsRow?.count ?? 0;

  const rxRow = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(sets), 0) as total FROM exercise_prescriptions WHERE user_id = ?`,
    [USER_ID]
  );
  const prescribedSets = Math.max(1, rxRow?.total ?? 1);

  return { completedSets, prescribedSets };
}

export async function getPainTrend(days: number = 7): Promise<{ date: string; avgPain: number }[]> {
  const db = await getDatabase();
  const modifier = `-${days} days`;
  const rows = await db.getAllAsync<{ date: string; avg: number }>(
    `SELECT date(timestamp) as date, AVG(pain_level) as avg
     FROM logs
     WHERE user_id = ? AND date(timestamp) >= date('now', '${modifier}')
     GROUP BY date(timestamp)
     ORDER BY date ASC`,
    [USER_ID]
  );
  return (rows ?? []).map((r) => ({ date: r.date, avgPain: Math.round(r.avg * 10) / 10 }));
}

export async function getAssessments(): Promise<{ date: string; dash_score: number | null; prwe_score: number | null; rom_degrees: number | null }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string; dash_score: number | null; prwe_score: number | null; rom_degrees: number | null }>(
    `SELECT date, dash_score, prwe_score, rom_degrees FROM assessments WHERE user_id = ? ORDER BY date DESC LIMIT 30`,
    [USER_ID]
  );
  return rows ?? [];
}

export async function getCurrentStreak(): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT DISTINCT date(timestamp) as date FROM logs WHERE user_id = ? ORDER BY date DESC`,
    [USER_ID]
  );

  if (!rows || rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  for (let i = 0; i < rows.length; i++) {
    const rowDate = new Date(rows[i].date);
    rowDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((currentDate.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Match current expected day
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays === 1 && streak === 0 && i === 0) {
      // Didn't log today, but logged yesterday. Current date becomes yesterday - 1.
      streak++;
      currentDate.setDate(currentDate.getDate() - 2);
    } else {
      // Gap in days, streak broken
      break;
    }
  }

  return streak;
}
