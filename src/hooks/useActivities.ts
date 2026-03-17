import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useSettings } from './useSettings';
import { useCustomActivities } from './useCustomActivities';
import { cacheGet, cacheSet, queueWrite, CACHE_KEYS } from '../lib/fallbackStorage';
import type { BreakActivity, UserActivityPreference, ActivityCategory } from '../types/database';

export function useActivities() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const { customActivities, createActivity, updateActivity, deleteActivity, isCustomActivity } =
    useCustomActivities();
  const [defaultActivities, setDefaultActivities] = useState<BreakActivity[]>([]);
  const [preferences, setPreferences] = useState<UserActivityPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | 'all'>('all');

  const activities = useMemo(
    () => [...defaultActivities, ...customActivities],
    [defaultActivities, customActivities],
  );

  useEffect(() => {
    if (!user) return;

    const prefsKey = CACHE_KEYS.activityPrefs(user.id);

    const load = async () => {
      try {
        const [activitiesRes, prefsRes] = await Promise.all([
          supabase.from('break_activities').select('*').eq('is_default', true),
          supabase.from('user_activity_preferences').select('*').eq('user_id', user.id),
        ]);

        if (activitiesRes.error) throw activitiesRes.error;
        if (prefsRes.error) throw prefsRes.error;

        if (activitiesRes.data) {
          setDefaultActivities(activitiesRes.data as BreakActivity[]);
          cacheSet(CACHE_KEYS.activities, activitiesRes.data);
        }
        if (prefsRes.data) {
          setPreferences(prefsRes.data as UserActivityPreference[]);
          cacheSet(prefsKey, prefsRes.data);
        }
      } catch {
        // Fallback to localStorage cache
        const cachedActivities = cacheGet<BreakActivity[]>(CACHE_KEYS.activities);
        const cachedPrefs = cacheGet<UserActivityPreference[]>(prefsKey);
        if (cachedActivities) setDefaultActivities(cachedActivities);
        if (cachedPrefs) setPreferences(cachedPrefs);
        if (!cachedActivities) showToast('Failed to load activities.');
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

      const prefsKey = CACHE_KEYS.activityPrefs(user.id);
      const existing = getPreference(activityId);

      if (existing) {
        const newVal = !existing.is_favorited;
        const updated = preferences.map((p) =>
          p.activity_id === activityId ? { ...p, is_favorited: newVal } : p,
        );
        setPreferences(updated);
        cacheSet(prefsKey, updated);

        try {
          const { error } = await supabase
            .from('user_activity_preferences')
            .update({ is_favorited: newVal })
            .eq('id', existing.id);
          if (error) throw error;
        } catch {
          queueWrite(
            'user_activity_preferences',
            'update',
            { is_favorited: newVal },
            { id: existing.id },
          );
        }
      } else {
        const tempId = crypto.randomUUID();
        const newPref: UserActivityPreference = {
          id: tempId,
          user_id: user.id,
          activity_id: activityId,
          is_favorited: true,
          is_hidden: false,
        };
        const updated = [...preferences, newPref];
        setPreferences(updated);
        cacheSet(prefsKey, updated);

        try {
          const { data, error } = await supabase
            .from('user_activity_preferences')
            .insert({
              user_id: user.id,
              activity_id: activityId,
              is_favorited: true,
              is_hidden: false,
            })
            .select()
            .maybeSingle();
          if (error) throw error;
          // Replace temp entry with real one from DB
          if (data) {
            setPreferences((prev) => {
              const withReal = prev.map((p) => (p.id === tempId ? (data as UserActivityPreference) : p));
              cacheSet(prefsKey, withReal);
              return withReal;
            });
          }
        } catch {
          queueWrite('user_activity_preferences', 'insert', {
            user_id: user.id,
            activity_id: activityId,
            is_favorited: true,
            is_hidden: false,
          });
        }
      }
    },
    [user, getPreference, preferences],
  );

  const hiddenCategories = settings.hidden_categories ?? [];

  const filteredActivities = activities.filter((a) => {
    const pref = getPreference(a.id);
    if (pref?.is_hidden) return false;
    if (hiddenCategories.includes(a.category)) return false;
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const favorites = activities.filter((a) => {
    const pref = getPreference(a.id);
    if (hiddenCategories.includes(a.category)) return false;
    return pref?.is_favorited && !pref.is_hidden;
  });

  return {
    activities: filteredActivities,
    allActivities: activities,
    favorites,
    loading,
    activeCategory,
    setActiveCategory,
    getPreference,
    toggleFavorite,
    createActivity,
    updateActivity,
    deleteActivity,
    isCustomActivity,
  };
}
