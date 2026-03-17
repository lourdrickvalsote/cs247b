import { useState, useMemo } from 'react';
import { Leaf, Clock, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../hooks/useSettings';
import { useActivities } from '../hooks/useActivities';
import { getActivityIcon } from '../lib/icons';
import { getCategoryLabel, getCategoryStyles } from '../lib/format';
import ActivityPicker from './ActivityPicker';
import type { BreakActivity, ActivityCategory } from '../types/database';

const CATEGORY_ORDER: ActivityCategory[] = ['stretching', 'breathing', 'mindfulness', 'movement', 'eye_rest'];

export default function BreakAlert() {
  const { startBreak, extendWork, endSession, sessionNumber, totalPlannedSessions } = useSession();
  const { settings } = useSettings();
  const { activities, favorites, loading } = useActivities();
  const [showPicker, setShowPicker] = useState(false);

  const isLongBreak = sessionNumber % totalPlannedSessions === 0;
  const breakMinutes = isLongBreak ? settings.long_break_minutes : settings.short_break_minutes;

  // Build curated picks: 1 activity per category, preferring favorites
  const curatedPicks = useMemo<BreakActivity[]>(() => {
    if (loading) return [];
    const picks: BreakActivity[] = [];
    const pool = activities.length > 0 ? activities : [];

    for (const cat of CATEGORY_ORDER) {
      // Try favorites first for this category
      const fav = favorites.find((a) => a.category === cat);
      if (fav) {
        picks.push(fav);
        continue;
      }
      // Fall back to first available in this category
      const fallback = pool.find((a) => a.category === cat);
      if (fallback) picks.push(fallback);
    }
    return picks;
  }, [activities, favorites, loading]);

  // Auto-suggest top pick: prefer favorites, then rotate
  const suggested = useMemo<BreakActivity | null>(() => {
    if (curatedPicks.length === 0) return null;
    return curatedPicks[(sessionNumber - 1) % curatedPicks.length];
  }, [curatedPicks, sessionNumber]);

  const [selectedActivity, setSelectedActivity] = useState<BreakActivity | null>(null);
  const activity = selectedActivity ?? suggested;

  if (showPicker) {
    return (
      <ActivityPicker
        onSelect={(a) => {
          setSelectedActivity(a);
          setShowPicker(false);
        }}
        onBack={() => setShowPicker(false)}
      />
    );
  }

  // Other curated picks (excluding the currently selected one)
  const otherPicks = curatedPicks.filter((a) => a.id !== activity?.id);

  return (
    <div className={`fixed inset-0 z-40 bg-gradient-to-b ${isLongBreak ? 'from-alice via-forest-50/30 to-alice dark:from-jet-950 dark:via-forest-950/15 dark:to-jet-950' : 'from-alice via-powder-50/20 to-alice dark:from-jet-950 dark:via-powder-950/10 dark:to-jet-950'} flex flex-col items-center justify-center px-6 overflow-y-auto`}>
      <div className="absolute inset-0 bg-jet/5 animate-fade-in" />
      <div aria-hidden="true">
        <div className={`absolute top-[15%] left-[10%] w-12 h-12 rounded-full ${isLongBreak ? 'bg-forest/10 dark:bg-forest/5' : 'bg-powder/20 dark:bg-powder/10'} animate-float-slow`} />
        <div className={`absolute top-[25%] right-[12%] w-8 h-8 rounded-full ${isLongBreak ? 'bg-powder/20 dark:bg-powder/10' : 'bg-lilac/15 dark:bg-lilac/8'} animate-float-slow`} style={{ animationDelay: '2s' }} />
        <div className={`absolute bottom-[20%] left-[18%] w-10 h-10 rounded-full ${isLongBreak ? 'bg-lilac/15 dark:bg-lilac/8' : 'bg-powder/15 dark:bg-powder/8'} animate-float-slow`} style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-sm w-full text-center relative z-10 py-8">
        <div className={`w-16 h-16 ${isLongBreak ? 'bg-forest-50' : 'bg-powder-50'} rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-in`}>
          <Leaf className={`w-8 h-8 ${isLongBreak ? 'text-forest' : 'text-powder-600'} animate-wobble`} />
        </div>

        <h1
          className="text-3xl font-bold text-jet mb-2 animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          Time for a break
        </h1>
        <p
          className="text-sm text-lilac-600 mb-1 animate-fade-in"
          style={{ animationDelay: '250ms' }}
        >
          Great work staying focused! Your mind needs a moment to recharge.
        </p>
        <div
          className="flex items-center justify-center gap-1.5 text-sm text-jet-600 font-medium mt-3 mb-6 animate-fade-in"
          style={{ animationDelay: '350ms' }}
        >
          <Clock className={`w-4 h-4 ${isLongBreak ? 'text-forest' : 'text-powder-600'}`} />
          <span>{breakMinutes} minute {isLongBreak ? 'long' : 'short'} break</span>
          {isLongBreak && <Badge variant="forest">Long</Badge>}
        </div>

        {/* Top recommended activity */}
        {activity && (
          <div className="animate-slide-up mb-4" style={{ animationDelay: '400ms' }}>
            <SuggestedActivityCard
              activity={activity}
              onStart={() => startBreak(activity)}
            />
          </div>
        )}

        {/* Other curated picks (1 per remaining category) */}
        {otherPicks.length > 0 && (
          <div className="animate-slide-up mb-4" style={{ animationDelay: '460ms' }}>
            <p className="text-[10px] font-semibold text-lilac uppercase tracking-wider mb-2 text-left">
              Or try
            </p>
            <div className="space-y-1.5">
              {otherPicks.map((a) => (
                <MiniActivityCard
                  key={a.id}
                  activity={a}
                  onSelect={() => startBreak(a)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Browse all activities button */}
        <div className="animate-slide-up mb-4" style={{ animationDelay: '520ms' }}>
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-lilac-600 hover:text-jet hover:bg-white/60 dark:hover:bg-jet-800/60 transition-all duration-200 group"
          >
            Browse all activities
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* If no activity loaded yet, show a plain start button */}
          {!activity && (
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <Button fullWidth size="lg" onClick={() => startBreak()}>
                Start Break
              </Button>
            </div>
          )}

          <div className="animate-slide-up" style={{ animationDelay: '560ms' }}>
            <Button variant="outline" fullWidth onClick={() => startBreak()}>
              Just relax
            </Button>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '620ms' }}>
            <Button variant="outline" fullWidth onClick={() => extendWork(5)}>
              +5 min work
            </Button>
          </div>
        </div>

        <button
          onClick={endSession}
          className="text-xs text-lilac-500 hover:text-jet mt-6 font-medium transition-colors animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          End session
        </button>
      </div>
    </div>
  );
}

function SuggestedActivityCard({
  activity,
  onStart,
}: {
  activity: BreakActivity;
  onStart: () => void;
}) {
  const Icon = getActivityIcon(activity.icon_name);
  const mins = Math.ceil(activity.duration_seconds / 60);
  const styles = getCategoryStyles(activity.category);

  return (
    <Card padding="md" hoverable onClick={onStart} className="cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-lilac uppercase tracking-wider">
          Recommended for you
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${styles.text}`} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-jet truncate">{activity.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={styles.badgeVariant as any}>{getCategoryLabel(activity.category)}</Badge>
            <span className="flex items-center gap-1 text-xs text-lilac-500">
              <Clock className="w-3 h-3" />
              {mins}m
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-lilac-400 shrink-0" />
      </div>
    </Card>
  );
}

function MiniActivityCard({
  activity,
  onSelect,
}: {
  activity: BreakActivity;
  onSelect: () => void;
}) {
  const Icon = getActivityIcon(activity.icon_name);
  const styles = getCategoryStyles(activity.category);
  const mins = Math.ceil(activity.duration_seconds / 60);

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-jet-800/70 border border-powder-200/50 dark:border-jet-700/50 hover:bg-white dark:hover:bg-jet-800 transition-all duration-200 group text-left"
    >
      <div className={`w-8 h-8 rounded-lg ${styles.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${styles.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-jet truncate">{activity.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-medium ${styles.text}`}>{getCategoryLabel(activity.category)}</span>
          <span className="text-lilac-300">&middot;</span>
          <span className="text-[10px] text-lilac-500">{mins}m</span>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-lilac-400 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}
