import { useState, useRef, useCallback, useEffect } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface UseTimerOptions {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function useTimer({ initialSeconds, onComplete, onTick }: UseTimerOptions) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  const remainingRef = useRef(remaining);

  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;
  remainingRef.current = remaining;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback((seconds: number) => {
    clearTimer();
    setRemaining(seconds);
    remainingRef.current = seconds;
    endTimeRef.current = Date.now() + seconds * 1000;
    setStatus('running');

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      remainingRef.current = left;
      onTickRef.current?.(left);

      if (left <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setStatus('completed');
        onCompleteRef.current?.();
      }
    }, 1000);
  }, [clearTimer]);

  const start = useCallback((seconds?: number) => {
    const s = seconds ?? (remainingRef.current > 0 ? remainingRef.current : initialSeconds);
    startInterval(s);
  }, [initialSeconds, startInterval]);

  const pause = useCallback(() => {
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (remainingRef.current <= 0) return;
    startInterval(remainingRef.current);
  }, [startInterval]);

  const reset = useCallback((newSeconds?: number) => {
    clearTimer();
    const s = newSeconds ?? initialSeconds;
    setRemaining(s);
    remainingRef.current = s;
    setStatus('idle');
  }, [clearTimer, initialSeconds]);

  const extend = useCallback((additionalSeconds: number) => {
    if (status === 'running') {
      endTimeRef.current += additionalSeconds * 1000;
      setRemaining((prev) => {
        const next = prev + additionalSeconds;
        remainingRef.current = next;
        return next;
      });
    } else if (status === 'paused') {
      setRemaining((prev) => {
        const next = prev + additionalSeconds;
        remainingRef.current = next;
        return next;
      });
    }
  }, [status]);

  // Immediately sync timer when tab regains focus (intervals are throttled in background)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && intervalRef.current) {
        const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setRemaining(left);
        remainingRef.current = left;
        onTickRef.current?.(left);

        if (left <= 0) {
          clearTimer();
          setStatus('completed');
          onCompleteRef.current?.();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const elapsed = initialSeconds - remaining;
  const progress = initialSeconds > 0 ? elapsed / initialSeconds : 0;

  return {
    remaining,
    elapsed,
    progress,
    status,
    start,
    pause,
    resume,
    reset,
    extend,
  };
}
