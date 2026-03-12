import { useEffect } from 'react';
import { flushPending } from '../lib/fallbackStorage';

/**
 * Automatically flushes queued localStorage writes to Supabase
 * when the browser comes back online or the tab regains focus.
 */
export function useSyncPending() {
  useEffect(() => {
    // Flush on mount (app start)
    flushPending();

    const handleOnline = () => flushPending();
    const handleFocus = () => flushPending();

    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
}
