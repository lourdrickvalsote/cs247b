import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { BreakActivity, UserActivityPreference, ActivityCategory } from '../types/database';

export function useActivities() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<BreakActivity[]>([]);
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

        if (activitiesRes.data) setActivities(activitiesRes.data as BreakActivity[]);
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
        const existing = getPreference(activityId);
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
    [user, getPreference, showToast],
  );

  const filteredActivities = activities.filter((a) => {
    const pref = getPreference(a.id);
    if (pref?.is_hidden) return false;
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const favorites = activities.filter((a) => {
    const pref = getPreference(a.id);
    return pref?.is_favorited && !pref.is_hidden;
  });

  return {
    activities: filteredActivities,
    favorites,
    loading,
    activeCategory,
    setActiveCategory,
    getPreference,
    toggleFavorite,
  };
}
