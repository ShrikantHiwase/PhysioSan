import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

const USER_ID = 'default';

export async function logExerciseCompletion(
  exerciseId: string,
  repsCompleted: number,
  painLevel: number
): Promise<void> {
  const db = await getDatabase();
  const id = uuidv4();
  await db.runAsync(
    `INSERT INTO logs (id, user_id, exercise_id, reps_completed, pain_level, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [id, USER_ID, exerciseId, repsCompleted, painLevel]
  );
}
