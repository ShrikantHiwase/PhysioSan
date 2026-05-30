import { useEffect, useState } from 'react';
import { getDatabase } from '../db/database';
import * as SQLite from 'expo-sqlite';

/**
 * Hook to access the database connection.
 * Ensures the DB is initialized before returning.
 */
export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const database = await getDatabase();
        if (mounted) {
          setDb(database);
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setIsReady(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return { db, isReady, error };
}
