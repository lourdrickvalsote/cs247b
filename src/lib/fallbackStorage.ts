/**
 * localStorage fallback for when Supabase is unreachable.
 *
 * Pattern:
 *  - Cache every successful Supabase read into localStorage.
 *  - On Supabase read failure, return the cached value.
 *  - On Supabase write failure, queue the operation for retry.
 *  - flushPending() retries all queued writes (call on reconnect / app focus).
 */

import { supabase } from './supabase';

// ── Cache helpers ──────────────────────────────────────────────────────

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full — ignore
  }
}

// ── Pending write queue ────────────────────────────────────────────────

interface PendingWrite {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'upsert';
  data: Record<string, unknown>;
  match?: Record<string, unknown>; // for .eq() filters on updates
  createdAt: number;
}

const PENDING_KEY = 'brevi_pending_writes';

function getPending(): PendingWrite[] {
  return cacheGet<PendingWrite[]>(PENDING_KEY) ?? [];
}

function setPending(items: PendingWrite[]): void {
  cacheSet(PENDING_KEY, items);
}

export function queueWrite(
  table: string,
  operation: 'insert' | 'update' | 'upsert',
  data: Record<string, unknown>,
  match?: Record<string, unknown>,
): void {
  const pending = getPending();
  pending.push({
    id: crypto.randomUUID(),
    table,
    operation,
    data,
    match,
    createdAt: Date.now(),
  });
  setPending(pending);
}

/**
 * Attempt to flush all pending writes to Supabase.
 * Returns the number of successfully flushed items.
 */
export async function flushPending(): Promise<number> {
  const pending = getPending();
  if (pending.length === 0) return 0;

  const remaining: PendingWrite[] = [];
  let flushed = 0;

  for (const item of pending) {
    try {
      let query;
      if (item.operation === 'insert') {
        query = supabase.from(item.table).insert(item.data);
      } else if (item.operation === 'update') {
        let q = supabase.from(item.table).update(item.data);
        if (item.match) {
          for (const [k, v] of Object.entries(item.match)) {
            q = q.eq(k, v as string);
          }
        }
        query = q;
      } else {
        query = supabase.from(item.table).upsert(item.data);
      }

      const { error } = await query;
      if (error) throw error;
      flushed++;
    } catch {
      // Keep failed items for next retry
      remaining.push(item);
    }
  }

  setPending(remaining);
  return flushed;
}

// ── Storage keys ───────────────────────────────────────────────────────

export const CACHE_KEYS = {
  settings: (userId: string) => `brevi_settings_${userId}`,
  sessions: (userId: string) => `brevi_sessions_${userId}`,
  activities: 'brevi_activities_cache',
  activityPrefs: (userId: string) => `brevi_activity_prefs_${userId}`,
} as const;
