import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';
import { cacheGet, cacheSet, queueWrite, CACHE_KEYS } from '../lib/fallbackStorage';
import type { UserSettings } from '../types/database';

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id'> = {
  work_duration_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  sessions_before_long_break: 4,
  auto_start_breaks: false,
  auto_start_work: false,
  sound_enabled: true,
  notification_enabled: true,
  hidden_categories: [],
};

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSetting: (key: keyof Omit<UserSettings, 'id' | 'user_id'>, value: number | boolean | string[]) => void;
  bulkUpdate: (updates: Partial<Omit<UserSettings, 'id' | 'user_id'>>) => Promise<void>;
  lastSaved: number | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const cacheKey = CACHE_KEYS.settings(user.id);

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(data as UserSettings);
          cacheSet(cacheKey, data);
        } else {
          const { data: created, error: insertErr } = await supabase
            .from('user_settings')
            .insert({ user_id: user.id })
            .select()
            .maybeSingle();
          if (insertErr) throw insertErr;
          if (created) {
            setSettings(created as UserSettings);
            cacheSet(cacheKey, created);
          }
        }
      } catch {
        const cached = cacheGet<UserSettings>(cacheKey);
        if (cached) {
          setSettings(cached);
        } else {
          showToast('Failed to load settings. Using defaults.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, showToast]);

  const persistToSupabase = useCallback(
    async (updates: Record<string, unknown>, settingsId: string) => {
      try {
        const { error } = await supabase
          .from('user_settings')
          .update(updates)
          .eq('id', settingsId);
        if (error) throw error;
        setLastSaved(Date.now());
      } catch {
        queueWrite('user_settings', 'update', updates, { id: settingsId });
        setLastSaved(Date.now());
      }
    },
    [],
  );

  const updateSetting = useCallback(
    (key: keyof Omit<UserSettings, 'id' | 'user_id'>, value: number | boolean | string[]) => {
      if (!settings) return;

      const updated = { ...settings, [key]: value };
      setSettings(updated);
      if (user) cacheSet(CACHE_KEYS.settings(user.id), updated);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        persistToSupabase({ [key]: value }, settings.id);
      }, 500);
    },
    [settings, user, persistToSupabase],
  );

  const bulkUpdate = useCallback(
    async (updates: Partial<Omit<UserSettings, 'id' | 'user_id'>>) => {
      if (!settings) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      const updated = { ...settings, ...updates };
      setSettings(updated);
      if (user) cacheSet(CACHE_KEYS.settings(user.id), updated);

      await persistToSupabase(updates as Record<string, unknown>, settings.id);
    },
    [settings, user, persistToSupabase],
  );

  const effectiveSettings = settings ?? {
    id: '',
    user_id: '',
    ...DEFAULT_SETTINGS,
  };

  return (
    <SettingsContext.Provider value={{ settings: effectiveSettings, loading, updateSetting, bulkUpdate, lastSaved }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}
