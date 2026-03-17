import { useState, useCallback, useEffect } from 'react';
import type { BreakActivity, ActivityStep, ActivityCategory } from '../types/database';

const STORAGE_KEY = 'brevi_custom_activities';

function loadActivities(): BreakActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivities(activities: BreakActivity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function useCustomActivities() {
  const [customActivities, setCustomActivities] = useState<BreakActivity[]>(loadActivities);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCustomActivities(loadActivities());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const createActivity = useCallback(
    (data: {
      title: string;
      description: string;
      category: ActivityCategory;
      icon_name: string;
      instructions: ActivityStep[];
    }) => {
      const activity: BreakActivity = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        category: data.category,
        icon_name: data.icon_name,
        instructions: data.instructions,
        duration_seconds: data.instructions.reduce((sum, s) => sum + s.duration_seconds, 0),
        is_default: false,
      };
      setCustomActivities((prev) => {
        const next = [...prev, activity];
        saveActivities(next);
        return next;
      });
      return activity;
    },
    [],
  );

  const updateActivity = useCallback(
    (
      id: string,
      data: {
        title: string;
        description: string;
        category: ActivityCategory;
        icon_name: string;
        instructions: ActivityStep[];
      },
    ) => {
      setCustomActivities((prev) => {
        const next = prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...data,
                duration_seconds: data.instructions.reduce((sum, s) => sum + s.duration_seconds, 0),
              }
            : a,
        );
        saveActivities(next);
        return next;
      });
    },
    [],
  );

  const deleteActivity = useCallback((id: string) => {
    setCustomActivities((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveActivities(next);
      return next;
    });
  }, []);

  const isCustomActivity = useCallback(
    (id: string) => customActivities.some((a) => a.id === id),
    [customActivities],
  );

  return { customActivities, createActivity, updateActivity, deleteActivity, isCustomActivity };
}
