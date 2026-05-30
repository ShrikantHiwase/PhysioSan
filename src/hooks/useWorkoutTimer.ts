import { useState, useEffect, useRef, useCallback } from 'react';

export function useWorkoutTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return { seconds, isRunning, start, pause, reset, toggle };
}

export function useRestTimer(initialSeconds: number = 90) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const start = useCallback((duration?: number, onComplete?: () => void) => {
    setRemaining(duration || initialSeconds);
    setIsActive(true);
    onCompleteRef.current = onComplete || null;
  }, [initialSeconds]);

  const stop = useCallback(() => {
    setIsActive(false);
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  const skip = useCallback(() => {
    setIsActive(false);
    setRemaining(initialSeconds);
    onCompleteRef.current?.();
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onCompleteRef.current?.();
            return initialSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, remaining, initialSeconds]);

  return { remaining, isActive, start, stop, skip };
}
