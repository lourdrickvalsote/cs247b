import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';
import type { BreakActivity, UserActivityPreference, ActivityCategory } from '../types/database';

interface ActivitiesContextType {
  /** All non-hidden activities (no category filter) */
  activities: BreakActivity[];
  /** Activities filtered by activeCategory and hidden status */
  filteredActivities: BreakActivity[];
  favorites: BreakActivity[];
  loading: boolean;
  activeCategory: ActivityCategory | 'all';
  setActiveCategory: (cat: ActivityCategory | 'all') => void;
  getPreference: (activityId: string) => UserActivityPreference | undefined;
  toggleFavorite: (activityId: string) => void;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rawActivities, setRawActivities] = useState<BreakActivity[]>([]);
  const [preferences, setPreferences] = useState<UserActivityPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | 'all'>('all');

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [activitiesRes, prefsRes] = await Promise.all([
          supabase.from('break_activities').select('*').eq('is_default', true),
          supabase.from('user_activity_preferences').select('*').eq('user_id', user.id),
        ]);

        if (activitiesRes.error) throw activitiesRes.error;
        if (prefsRes.error) throw prefsRes.error;

        if (activitiesRes.data) setRawActivities(activitiesRes.data as BreakActivity[]);
        if (prefsRes.data) setPreferences(prefsRes.data as UserActivityPreference[]);
      } catch {
        showToast('Failed to load activities.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, showToast]);

  const getPreference = useCallback(
    (activityId: string) => preferences.find((p) => p.activity_id === activityId),
    [preferences],
  );

  const toggleFavorite = useCallback(
    async (activityId: string) => {
      if (!user) return;

      try {
        const existing = preferences.find((p) => p.activity_id === activityId);
        if (existing) {
          const newVal = !existing.is_favorited;
          setPreferences((prev) =>
            prev.map((p) => (p.activity_id === activityId ? { ...p, is_favorited: newVal } : p)),
          );
          const { error } = await supabase
            .from('user_activity_preferences')
            .update({ is_favorited: newVal })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const newPref: Partial<UserActivityPreference> = {
            user_id: user.id,
            activity_id: activityId,
            is_favorited: true,
            is_hidden: false,
          };
          const { data, error } = await supabase
            .from('user_activity_preferences')
            .insert(newPref)
            .select()
            .maybeSingle();
          if (error) throw error;
          if (data) setPreferences((prev) => [...prev, data as UserActivityPreference]);
        }
      } catch {
        showToast('Failed to update favorite.');
      }
    },
    [user, preferences, showToast],
  );

  // All non-hidden activities (used by BreakAlert for suggestions)
  const activities = useMemo(
    () => rawActivities.filter((a) => {
      const pref = preferences.find((p) => p.activity_id === a.id);
      return !pref?.is_hidden;
    }),
    [rawActivities, preferences],
  );

  // Category-filtered activities (used by ActivitiesPage / ActivityPicker)
  const filteredActivities = useMemo(
    () => activities.filter((a) => activeCategory === 'all' || a.category === activeCategory),
    [activities, activeCategory],
  );

  const favorites = useMemo(
    () => rawActivities.filter((a) => {
      const pref = preferences.find((p) => p.activity_id === a.id);
      return pref?.is_favorited && !pref.is_hidden;
    }),
    [rawActivities, preferences],
  );

  const value = useMemo<ActivitiesContextType>(() => ({
    activities,
    filteredActivities,
    favorites,
    loading,
    activeCategory,
    setActiveCategory,
    getPreference,
    toggleFavorite,
  }), [activities, filteredActivities, favorites, loading, activeCategory, getPreference, toggleFavorite]);

  return (
    <ActivitiesContext.Provider value={value}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error('useActivities must be used within ActivitiesProvider');
  return ctx;
}
