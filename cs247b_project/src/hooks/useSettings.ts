import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
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
};

export function useSettings() {
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
        } else {
          const { data: created, error: insertErr } = await supabase
            .from('user_settings')
            .insert({ user_id: user.id })
            .select()
            .maybeSingle();
          if (insertErr) throw insertErr;
          if (created) setSettings(created as UserSettings);
        }
      } catch {
        showToast('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, showToast]);

  const updateSetting = useCallback(
    (key: keyof Omit<UserSettings, 'id' | 'user_id'>, value: number | boolean) => {
      if (!settings) return;

      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from('user_settings')
            .update({ [key]: value })
            .eq('id', settings.id);
          if (error) throw error;
          setLastSaved(Date.now());
        } catch {
          showToast('Failed to save setting. Please try again.');
        }
      }, 500);
    },
    [settings, showToast],
  );

  const effectiveSettings = settings ?? {
    id: '',
    user_id: '',
    ...DEFAULT_SETTINGS,
  };

  return { settings: effectiveSettings, loading, updateSetting, lastSaved };
}
