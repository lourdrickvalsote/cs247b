import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';
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
  const { user } = useAuth();
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

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startOfDay.toISOString())
        .order('started_at', { ascending: false });

      if (error) throw error;
      if (data) setAllSessions(data as Session[]);
    } catch {
      showToast('Failed to load today\'s sessions. Check your connection.');
    }
  }, [user, showToast]);

  const fetchFilteredSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

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
    } catch {
      showToast('Failed to load session history.');
    } finally {
      setLoading(false);
    }
  }, [user, datePreset, customRange, showToast]);

  useEffect(() => {
    fetchTodaySessions();
  }, [fetchTodaySessions]);

  useEffect(() => {
    fetchFilteredSessions();
  }, [fetchFilteredSessions]);

  useEffect(() => {
    setPage(1);
  }, [datePreset, customRange, typeFilter]);

  const saveSession = useCallback(
    async (session: Omit<Session, 'id' | 'user_id'>) => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('sessions')
          .insert({ ...session, user_id: user.id })
          .select()
          .maybeSingle();

        if (error) throw error;
        if (data) {
          const saved = data as Session;
          setAllSessions((prev) => [saved, ...prev]);
          fetchFilteredSessions();
        }
      } catch {
        showToast('Failed to save session. Your progress may not be recorded.');
      }
    },
    [user, fetchFilteredSessions, showToast],
  );

  const todaySessions = allSessions.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.started_at).toDateString() === today;
  });

  const todayWorkSeconds = todaySessions
    .filter((s) => s.type === 'work' && s.completed)
    .reduce((sum, s) => sum + s.actual_duration_seconds, 0);

  const todayBreakCount = todaySessions.filter(
    (s) => (s.type === 'short_break' || s.type === 'long_break') && s.completed,
  ).length;

  const todayCompletedSessions = todaySessions.filter((s) => s.type === 'work' && s.completed).length;

  const refetch = useCallback(() => {
    fetchTodaySessions();
    fetchFilteredSessions();
  }, [fetchTodaySessions, fetchFilteredSessions]);

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
