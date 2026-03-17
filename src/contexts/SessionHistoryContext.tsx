import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';
import { cacheGet, cacheSet, queueWrite, CACHE_KEYS } from '../lib/fallbackStorage';
import { groupSessionsIntoRounds } from '../lib/groupSessions';
import type { Session, SessionWithActivity, StudyRound } from '../types/database';

export type DatePreset = 'today' | 'week' | 'month' | 'all';
export type TypeFilter = 'all' | 'work' | 'breaks';

interface DateRange {
  start: string;
  end: string;
}

interface SessionHistoryContextType {
  sessions: Session[];
  todayWorkSeconds: number;
  todayBreakCount: number;
  todayCompletedSessions: number;
  todayAvgRestoration: number | null;
  avgTirednessWithBreak: number | null;
  avgTirednessWithoutBreak: number | null;
  loading: boolean;
  saveSession: (session: Omit<Session, 'id' | 'user_id'>) => Promise<void>;
  refetch: () => void;

  rounds: StudyRound[];
  datePreset: DatePreset;
  setDatePreset: (preset: DatePreset) => void;
  customRange: DateRange | null;
  setCustomRange: (range: DateRange | null) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (filter: TypeFilter) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const SessionHistoryContext = createContext<SessionHistoryContextType | undefined>(undefined);

const PAGE_SIZE = 10;
const FETCH_LIMIT = 50;

function getDateRangeForPreset(preset: DatePreset): { start: string; end: string } | null {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const end = endOfDay.toISOString();

  switch (preset) {
    case 'today': {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: startOfDay.toISOString(), end };
    }
    case 'week': {
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      return { start: startOfWeek.toISOString(), end };
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth.toISOString(), end };
    }
    case 'all':
      return null;
  }
}

function filterRounds(rounds: StudyRound[], typeFilter: TypeFilter): StudyRound[] {
  if (typeFilter === 'all') return rounds;
  if (typeFilter === 'work') return rounds.filter((r) => r.rounds.some((p) => p.workSession !== null));
  return rounds.filter((r) => r.rounds.some((p) => p.breakSession !== null));
}

export function SessionHistoryProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [allRounds, setAllRounds] = useState<StudyRound[]>([]);
  const [loading, setLoading] = useState(true);

  const [datePreset, setDatePreset] = useState<DatePreset>('week');
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);

  const fetchTodaySessions = useCallback(async () => {
    if (!user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const sessionsKey = CACHE_KEYS.sessions(user.id);

    // Guest mode: load from cache only
    if (isGuest) {
      const cached = cacheGet<Session[]>(sessionsKey);
      if (cached) setAllSessions(cached);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startOfDay.toISOString())
        .order('started_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setAllSessions(data as Session[]);
        cacheSet(sessionsKey, data);
      }
    } catch {
      // Fallback to cached sessions
      const cached = cacheGet<Session[]>(sessionsKey);
      if (cached) {
        setAllSessions(cached);
      } else {
        showToast('Failed to load today\'s sessions. Check your connection.');
      }
    }
  }, [user, isGuest, showToast]);

  // Build rounds from local session data (used as fallback and for immediate updates)
  const buildRoundsFromLocal = useCallback((sessions: Session[]) => {
    const effectiveRange = customRange ?? getDateRangeForPreset(datePreset);
    let filtered = sessions;
    if (effectiveRange) {
      filtered = sessions.filter((s) => s.started_at >= effectiveRange.start && s.started_at <= effectiveRange.end);
    }
    const asWithActivity: SessionWithActivity[] = filtered.map((s) => ({
      ...s,
      break_activities: null,
    }));
    return groupSessionsIntoRounds(asWithActivity);
  }, [datePreset, customRange]);

  const fetchFilteredSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Guest mode: build rounds from cached sessions
    if (isGuest) {
      const cached = cacheGet<Session[]>(CACHE_KEYS.sessions(user.id));
      if (cached && cached.length > 0) {
        setAllRounds(buildRoundsFromLocal(cached));
      }
      setLoading(false);
      return;
    }

    try {
      const effectiveRange = customRange ?? getDateRangeForPreset(datePreset);

      let query = supabase
        .from('sessions')
        .select('*, break_activities(*)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (effectiveRange) {
        query = query.gte('started_at', effectiveRange.start).lte('started_at', effectiveRange.end);
      }

      query = query.limit(FETCH_LIMIT);

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        const sessions = data as SessionWithActivity[];
        const grouped = groupSessionsIntoRounds(sessions);
        setAllRounds(grouped);
      }
    } catch (err) {
      console.error('[SessionHistory] fetchFilteredSessions failed:', err);
      // Fallback: build rounds from locally cached sessions
      const cached = cacheGet<Session[]>(CACHE_KEYS.sessions(user.id));
      if (cached && cached.length > 0) {
        setAllRounds(buildRoundsFromLocal(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [user, isGuest, datePreset, customRange, buildRoundsFromLocal]);

  useEffect(() => {
    fetchTodaySessions();
  }, [fetchTodaySessions]);

  useEffect(() => {
    fetchFilteredSessions();
  }, [fetchFilteredSessions]);

  // Keep rounds in sync with local sessions (handles optimistic adds immediately)
  useEffect(() => {
    if (allSessions.length > 0) {
      setAllRounds(buildRoundsFromLocal(allSessions));
    }
  }, [allSessions, buildRoundsFromLocal]);

  useEffect(() => {
    setPage(1);
  }, [datePreset, customRange, typeFilter]);

  const saveSession = useCallback(
    async (session: Omit<Session, 'id' | 'user_id'>) => {
      if (!user) return;

      const sessionsKey = CACHE_KEYS.sessions(user.id);

      // Optimistically create a local session for immediate UI update
      const localSession: Session = {
        ...session,
        id: crypto.randomUUID(),
        user_id: user.id,
      };
      setAllSessions((prev) => {
        const updated = [localSession, ...prev];
        cacheSet(sessionsKey, updated);
        return updated;
      });
      if (localSession.pre_work_tiredness != null) {
        setCheckinSessions((prev) => [localSession, ...prev]);
      }

      // Guest mode: local only, skip Supabase
      if (isGuest) return;

      try {
        const { data, error } = await supabase
          .from('sessions')
          .insert({ ...session, user_id: user.id })
          .select()
          .maybeSingle();

        if (error) throw error;
        if (data) {
          const saved = data as Session;
          // Replace optimistic entry with real DB entry
          setAllSessions((prev) => {
            const updated = prev.map((s) => (s.id === localSession.id ? saved : s));
            cacheSet(sessionsKey, updated);
            return updated;
          });
        }
      } catch (err) {
        console.error('[SessionHistory] saveSession failed:', err);
        // Queue for retry — the optimistic local entry stays in state & cache
        queueWrite('sessions', 'insert', { ...session, user_id: user.id });
      }
    },
    [user, isGuest],
  );

  const todaySessions = allSessions.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.started_at).toDateString() === today;
  });

  const todayWorkSeconds = todaySessions
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.actual_duration_seconds, 0);

  const todayBreakCount = todaySessions.filter(
    (s) => s.type === 'short_break' || s.type === 'long_break',
  ).length;

  const todayCompletedSessions = todaySessions.filter((s) => s.type === 'work').length;

  const todayAvgRestoration = (() => {
    const rated = todaySessions.filter(s => s.restoration_rating != null);
    if (rated.length === 0) return null;
    return rated.reduce((sum, s) => sum + s.restoration_rating!, 0) / rated.length;
  })();

  const [checkinSessions, setCheckinSessions] = useState<Session[]>([]);

  const fetchCheckinSessions = useCallback(async () => {
    if (!user) return;
    // Guest mode: filter from local sessions
    if (isGuest) {
      const cached = cacheGet<Session[]>(CACHE_KEYS.sessions(user.id));
      if (cached) {
        setCheckinSessions(cached.filter((s) => s.pre_work_tiredness != null));
      }
      return;
    }
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('pre_work_tiredness', 'is', null)
        .order('started_at', { ascending: false });
      if (error) throw error;
      if (data) setCheckinSessions(data as Session[]);
    } catch {
      // silent — non-critical stats
    }
  }, [user, isGuest]);

  useEffect(() => {
    fetchCheckinSessions();
  }, [fetchCheckinSessions]);

  const avgTirednessWithBreak = (() => {
    const sessions = checkinSessions.filter(s => s.pre_work_took_break === true && s.pre_work_tiredness != null);
    if (sessions.length === 0) return null;
    return sessions.reduce((sum, s) => sum + s.pre_work_tiredness!, 0) / sessions.length;
  })();

  const avgTirednessWithoutBreak = (() => {
    const sessions = checkinSessions.filter(s => s.pre_work_took_break === false && s.pre_work_tiredness != null);
    if (sessions.length === 0) return null;
    return sessions.reduce((sum, s) => sum + s.pre_work_tiredness!, 0) / sessions.length;
  })();

  const refetch = useCallback(() => {
    fetchTodaySessions();
    fetchFilteredSessions();
    fetchCheckinSessions();
  }, [fetchTodaySessions, fetchFilteredSessions, fetchCheckinSessions]);

  const filtered = filterRounds(allRounds, typeFilter);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;
  const rounds = filtered.slice(offset, offset + PAGE_SIZE);

  return (
    <SessionHistoryContext.Provider
      value={{
        sessions: allSessions,
        todayWorkSeconds,
        todayBreakCount,
        todayCompletedSessions,
        todayAvgRestoration,
        avgTirednessWithBreak,
        avgTirednessWithoutBreak,
        loading,
        saveSession,
        refetch,
        rounds,
        datePreset,
        setDatePreset,
        setCustomRange,
        customRange,
        typeFilter,
        setTypeFilter,
        page,
        setPage,
        pageSize: PAGE_SIZE,
        totalCount,
        totalPages,
      }}
    >
      {children}
    </SessionHistoryContext.Provider>
  );
}

export function useSessionHistoryContext() {
  const ctx = useContext(SessionHistoryContext);
  if (!ctx) throw new Error('useSessionHistoryContext must be used within SessionHistoryProvider');
  return ctx;
}
