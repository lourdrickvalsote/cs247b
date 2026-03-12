import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { useTimer, type TimerStatus } from '../hooks/useTimer';
import { useSettings } from './SettingsContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { sendNotification, playChime } from '../lib/notifications';
import type { SessionType, BreakActivity } from '../types/database';

type SessionPhase = 'idle' | 'working' | 'break_alert' | 'breaking' | 'session_complete';

const SESSION_STORAGE_KEY = 'brevi_active_session';

interface PersistedSession {
  phase: SessionPhase;
  sessionNumber: number;
  currentType: SessionType;
  endTime: number; // absolute ms timestamp
  remainingOnPause: number | null; // seconds, if paused
  plannedDuration: number; // seconds
  sessionStartedAt: string;
  groupId: string | null;
}

function saveToStorage(data: PersistedSession | null) {
  if (data && data.phase !== 'idle' && data.phase !== 'session_complete' && data.phase !== 'break_alert') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

function loadFromStorage(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

interface CompletedSessionStats {
  roundsCompleted: number;
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  sessionStartedAt: string;
  sessionEndedAt: string;
  allDone: boolean;
}

// --- Stable context: phase, session info, and actions (changes infrequently) ---
interface SessionContextType {
  phase: SessionPhase;
  sessionNumber: number;
  totalPlannedSessions: number;
  currentType: SessionType;
  currentActivity: BreakActivity | null;
  completedStats: CompletedSessionStats | null;

  startWork: () => void;
  startNextRound: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipToBreak: () => void;
  startBreak: (activity?: BreakActivity) => void;
  extendWork: (minutes: number) => void;
  endBreakEarly: () => void;
  extendBreak: (minutes: number) => void;
  endSession: () => void;
  resetAll: () => void;
  cancelActivity: () => void;
  continueStudying: () => void;
}

// --- Volatile context: timer data that changes every tick ---
interface SessionTimerContextType {
  timerRemaining: number;
  timerProgress: number;
  timerStatus: TimerStatus;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);
const SessionTimerContext = createContext<SessionTimerContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { saveSession } = useSessionHistory();

  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [totalPlannedSessions, setTotalPlannedSessions] = useState(settings.sessions_before_long_break);
  const [currentType, setCurrentType] = useState<SessionType>('work');
  const [currentActivity, setCurrentActivity] = useState<BreakActivity | null>(null);
  const sessionStartRef = useRef<Date>(new Date());
  const groupIdRef = useRef<string | null>(null);
  const studySessionStartRef = useRef<string>(new Date().toISOString());
  const accumulatedWorkSecsRef = useRef(0);
  const accumulatedBreakSecsRef = useRef(0);
  const roundsCompletedRef = useRef(0);
  const [completedStats, setCompletedStats] = useState<CompletedSessionStats | null>(null);

  // Memoize derived values from settings to stabilize callback dependencies
  const workSeconds = useMemo(() => settings.work_duration_minutes * 60, [settings.work_duration_minutes]);

  const getBreakSeconds = useCallback(() => {
    const isLongBreak = sessionNumber % settings.sessions_before_long_break === 0;
    return isLongBreak ? settings.long_break_minutes * 60 : settings.short_break_minutes * 60;
  }, [sessionNumber, settings.sessions_before_long_break, settings.long_break_minutes, settings.short_break_minutes]);

  const getBreakType = useCallback((): SessionType => {
    return sessionNumber % settings.sessions_before_long_break === 0 ? 'long_break' : 'short_break';
  }, [sessionNumber, settings.sessions_before_long_break]);

  const handleWorkComplete = useCallback(() => {
    setPhase('break_alert');
    if (settings.sound_enabled) playChime();
    if (settings.notification_enabled) {
      sendNotification(
        'Break time!',
        `You have been focused for ${settings.work_duration_minutes} minutes. Time for a restorative break.`,
      );
    }

    accumulatedWorkSecsRef.current += workSeconds;
    roundsCompletedRef.current += 1;

    saveSession({
      started_at: sessionStartRef.current.toISOString(),
      ended_at: new Date().toISOString(),
      type: 'work',
      planned_duration_seconds: workSeconds,
      actual_duration_seconds: workSeconds,
      completed: true,
      activity_id: null,
      session_group_id: groupIdRef.current,
    });
  }, [settings.sound_enabled, settings.notification_enabled, settings.work_duration_minutes, saveSession, workSeconds]);

  const handleBreakComplete = useCallback(() => {
    const breakSecs = getBreakSeconds();

    accumulatedBreakSecsRef.current += breakSecs;

    saveSession({
      started_at: sessionStartRef.current.toISOString(),
      ended_at: new Date().toISOString(),
      type: getBreakType(),
      planned_duration_seconds: breakSecs,
      actual_duration_seconds: breakSecs,
      completed: true,
      activity_id: currentActivity?.id ?? null,
      session_group_id: groupIdRef.current,
    });

    if (settings.sound_enabled) playChime();
    setCurrentActivity(null);

    const allDone = sessionNumber >= totalPlannedSessions;

    if (allDone) {
      setCompletedStats({
        roundsCompleted: roundsCompletedRef.current,
        totalWorkSeconds: accumulatedWorkSecsRef.current,
        totalBreakSeconds: accumulatedBreakSecsRef.current,
        sessionStartedAt: studySessionStartRef.current,
        sessionEndedAt: new Date().toISOString(),
        allDone: true,
      });
      setSessionNumber((n) => n + 1);
      setPhase('session_complete');
    } else if (settings.auto_start_work) {
      setSessionNumber((n) => n + 1);
      setCurrentType('work');
      setPhase('working');
      sessionStartRef.current = new Date();
      workTimer.start(workSeconds);
    } else {
      setCompletedStats({
        roundsCompleted: roundsCompletedRef.current,
        totalWorkSeconds: accumulatedWorkSecsRef.current,
        totalBreakSeconds: accumulatedBreakSecsRef.current,
        sessionStartedAt: studySessionStartRef.current,
        sessionEndedAt: new Date().toISOString(),
        allDone: false,
      });
      setSessionNumber((n) => n + 1);
      setPhase('session_complete');
    }
  }, [getBreakSeconds, getBreakType, settings.sound_enabled, settings.auto_start_work, currentActivity, saveSession, sessionNumber, totalPlannedSessions, workSeconds]);

  const workTimer = useTimer({
    initialSeconds: workSeconds,
    onComplete: handleWorkComplete,
  });

  const breakTimer = useTimer({
    initialSeconds: getBreakSeconds(),
    onComplete: handleBreakComplete,
  });

  const startWork = useCallback(() => {
    groupIdRef.current = crypto.randomUUID();
    studySessionStartRef.current = new Date().toISOString();
    accumulatedWorkSecsRef.current = 0;
    accumulatedBreakSecsRef.current = 0;
    roundsCompletedRef.current = 0;
    setTotalPlannedSessions(settings.sessions_before_long_break);
    setCompletedStats(null);
    setSessionNumber(1);
    setPhase('working');
    setCurrentType('work');
    sessionStartRef.current = new Date();
    workTimer.start(workSeconds);
  }, [workTimer, settings.sessions_before_long_break, workSeconds]);

  const continueStudying = useCallback(() => {
    setTotalPlannedSessions((n) => n + settings.sessions_before_long_break);
    setCompletedStats(null);
    setPhase('working');
    setCurrentType('work');
    sessionStartRef.current = new Date();
    workTimer.start(workSeconds);
  }, [workTimer, settings.sessions_before_long_break, workSeconds]);

  const startNextRound = useCallback(() => {
    setCompletedStats(null);
    setPhase('working');
    setCurrentType('work');
    sessionStartRef.current = new Date();
    workTimer.start(workSeconds);
  }, [workTimer, workSeconds]);

  const pauseTimer = useCallback(() => {
    if (phase === 'working') workTimer.pause();
    else if (phase === 'breaking') breakTimer.pause();
  }, [phase, workTimer, breakTimer]);

  const resumeTimer = useCallback(() => {
    if (phase === 'working') workTimer.resume();
    else if (phase === 'breaking') breakTimer.resume();
  }, [phase, workTimer, breakTimer]);

  const skipToBreak = useCallback(() => {
    const elapsed = workSeconds - workTimer.remaining;
    accumulatedWorkSecsRef.current += elapsed;
    roundsCompletedRef.current += 1;
    saveSession({
      started_at: sessionStartRef.current.toISOString(),
      ended_at: new Date().toISOString(),
      type: 'work',
      planned_duration_seconds: workSeconds,
      actual_duration_seconds: elapsed,
      completed: false,
      activity_id: null,
      session_group_id: groupIdRef.current,
    });
    workTimer.reset();
    setPhase('break_alert');
  }, [workTimer, saveSession, workSeconds]);

  const startBreak = useCallback(
    (activity?: BreakActivity) => {
      setCurrentActivity(activity ?? null);
      setCurrentType(getBreakType());
      setPhase('breaking');
      sessionStartRef.current = new Date();

      const seconds = activity ? activity.duration_seconds : getBreakSeconds();
      breakTimer.start(seconds);
    },
    [breakTimer, getBreakType, getBreakSeconds],
  );

  const extendWork = useCallback(
    (minutes: number) => {
      const extraSeconds = minutes * 60;
      if (workTimer.status === 'running' || workTimer.status === 'paused') {
        workTimer.extend(extraSeconds);
        setPhase('working');
        if (workTimer.status === 'paused') {
          workTimer.resume();
        }
      } else {
        setPhase('working');
        workTimer.start(extraSeconds);
      }
    },
    [workTimer],
  );

  const endBreakEarly = useCallback(() => {
    const breakSecs = getBreakSeconds();
    const elapsed = breakSecs - breakTimer.remaining;
    breakTimer.reset();

    accumulatedBreakSecsRef.current += elapsed;

    saveSession({
      started_at: sessionStartRef.current.toISOString(),
      ended_at: new Date().toISOString(),
      type: getBreakType(),
      planned_duration_seconds: breakSecs,
      actual_duration_seconds: elapsed,
      completed: false,
      activity_id: currentActivity?.id ?? null,
      session_group_id: groupIdRef.current,
    });

    setCurrentActivity(null);

    // All planned sessions done — show completion screen
    if (sessionNumber >= totalPlannedSessions) {
      setCompletedStats({
        roundsCompleted: roundsCompletedRef.current,
        totalWorkSeconds: accumulatedWorkSecsRef.current,
        totalBreakSeconds: accumulatedBreakSecsRef.current,
        sessionStartedAt: studySessionStartRef.current,
        sessionEndedAt: new Date().toISOString(),
        allDone: true,
      });
      setSessionNumber((n) => n + 1);
      setPhase('session_complete');
    } else {
      setSessionNumber((n) => n + 1);
      setCurrentType('work');
      setPhase('working');
      sessionStartRef.current = new Date();
      workTimer.start(workSeconds);
    }
  }, [breakTimer, workTimer, currentActivity, saveSession, getBreakSeconds, getBreakType, sessionNumber, totalPlannedSessions, workSeconds]);

  const extendBreak = useCallback(
    (minutes: number) => {
      breakTimer.extend(minutes * 60);
    },
    [breakTimer],
  );

  const cancelActivity = useCallback(() => {
    setCurrentActivity(null);
    const left = breakTimer.remaining;
    breakTimer.start(left);
  }, [breakTimer]);

  const endSession = useCallback(() => {
    if (phase === 'working') {
      const elapsed = workSeconds - workTimer.remaining;
      if (elapsed > 0) {
        saveSession({
          started_at: sessionStartRef.current.toISOString(),
          ended_at: new Date().toISOString(),
          type: 'work',
          planned_duration_seconds: workSeconds,
          actual_duration_seconds: elapsed,
          completed: false,
          activity_id: null,
          session_group_id: groupIdRef.current,
        });
      }
    }
    workTimer.reset();
    breakTimer.reset();
    setCurrentActivity(null);
    groupIdRef.current = null;
    setPhase('idle');
    saveToStorage(null);
  }, [workTimer, breakTimer, phase, saveSession, workSeconds]);

  const resetAll = useCallback(() => {
    workTimer.reset(workSeconds);
    breakTimer.reset(getBreakSeconds());
    setSessionNumber(1);
    setTotalPlannedSessions(settings.sessions_before_long_break);
    setCurrentType('work');
    setCurrentActivity(null);
    setCompletedStats(null);
    groupIdRef.current = null;
    accumulatedWorkSecsRef.current = 0;
    accumulatedBreakSecsRef.current = 0;
    roundsCompletedRef.current = 0;
    setPhase('idle');
    saveToStorage(null);
  }, [workTimer, breakTimer, settings.sessions_before_long_break, workSeconds, getBreakSeconds]);

  // --- Persist active session to localStorage ---
  const persistSession = useCallback(() => {
    if (phase === 'working' || phase === 'breaking') {
      const timer = phase === 'working' ? workTimer : breakTimer;
      const planned = phase === 'working' ? workSeconds : getBreakSeconds();
      saveToStorage({
        phase,
        sessionNumber,
        currentType,
        endTime: timer.status === 'running' ? Date.now() + timer.remaining * 1000 : 0,
        remainingOnPause: timer.status === 'paused' ? timer.remaining : null,
        plannedDuration: planned,
        sessionStartedAt: sessionStartRef.current.toISOString(),
        groupId: groupIdRef.current,
      });
    } else {
      saveToStorage(null);
    }
  }, [phase, sessionNumber, currentType, workTimer, breakTimer, workSeconds, getBreakSeconds]);

  // Persist whenever key state changes (only on phase/status transitions, not every tick)
  useEffect(() => {
    persistSession();
  }, [phase, workTimer.status, breakTimer.status, persistSession]);

  // Restore session on mount
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const saved = loadFromStorage();
    if (!saved) return;

    const { phase: savedPhase, sessionNumber: savedNum, currentType: savedType, endTime, remainingOnPause, sessionStartedAt, groupId } = saved;

    // Calculate remaining time
    let remaining: number;
    if (remainingOnPause !== null) {
      remaining = remainingOnPause;
    } else {
      remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    }

    // If timer already expired while page was closed, go to next phase
    if (remaining <= 0 && remainingOnPause === null) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      if (savedPhase === 'working') {
        setPhase('break_alert');
        setSessionNumber(savedNum);
        setCurrentType(savedType);
        groupIdRef.current = groupId;
        sessionStartRef.current = new Date(sessionStartedAt);
      }
      return;
    }

    // Restore state
    setSessionNumber(savedNum);
    setCurrentType(savedType);
    setPhase(savedPhase);
    groupIdRef.current = groupId;
    sessionStartRef.current = new Date(sessionStartedAt);

    const timer = savedPhase === 'working' ? workTimer : breakTimer;
    if (remainingOnPause !== null) {
      timer.start(remaining);
      // Start then immediately pause to set remaining correctly
      setTimeout(() => timer.pause(), 0);
    } else {
      timer.start(remaining);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTimer = phase === 'working' ? workTimer : breakTimer;

  // Memoize stable context value — only changes when phase/session state changes
  const sessionValue = useMemo<SessionContextType>(() => ({
    phase,
    sessionNumber,
    totalPlannedSessions,
    currentType,
    currentActivity,
    completedStats,
    startWork,
    startNextRound,
    pauseTimer,
    resumeTimer,
    skipToBreak,
    startBreak,
    extendWork,
    endBreakEarly,
    extendBreak,
    endSession,
    resetAll,
    cancelActivity,
    continueStudying,
  }), [
    phase, sessionNumber, totalPlannedSessions, currentType, currentActivity, completedStats,
    startWork, startNextRound, pauseTimer, resumeTimer, skipToBreak, startBreak,
    extendWork, endBreakEarly, extendBreak, endSession, resetAll, cancelActivity, continueStudying,
  ]);

  // Memoize volatile timer context — changes every tick, but only timer-consuming components subscribe
  const timerValue = useMemo<SessionTimerContextType>(() => ({
    timerRemaining: activeTimer.remaining,
    timerProgress: activeTimer.progress,
    timerStatus: activeTimer.status,
  }), [activeTimer.remaining, activeTimer.progress, activeTimer.status]);

  return (
    <SessionContext.Provider value={sessionValue}>
      <SessionTimerContext.Provider value={timerValue}>
        {children}
      </SessionTimerContext.Provider>
    </SessionContext.Provider>
  );
}

/** Use for phase, session info, and actions — does NOT re-render on timer ticks */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

/** Use for timer data (remaining, progress, status) — re-renders every tick */
export function useSessionTimer() {
  const ctx = useContext(SessionTimerContext);
  if (!ctx) throw new Error('useSessionTimer must be used within SessionProvider');
  return ctx;
}
