import { useState } from 'react';
import { ArrowLeft, Heart, Clock, Layers, StretchHorizontal, Wind, ScanLine, Footprints, Eye } from 'lucide-react';
import { useDragScroll } from '../hooks/useDragScroll';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { useActivities } from '../hooks/useActivities';
import { getCategoryLabel, getCategoryStyles } from '../lib/format';
import { getActivityIcon } from '../lib/icons';
import type { BreakActivity, ActivityCategory } from '../types/database';
import type { LucideIcon } from 'lucide-react';

const CATEGORIES: (ActivityCategory | 'all')[] = ['all', 'stretching', 'breathing', 'mindfulness', 'movement', 'eye_rest'];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: Layers,
  stretching: StretchHorizontal,
  breathing: Wind,
  mindfulness: ScanLine,
  movement: Footprints,
  eye_rest: Eye,
};

interface ActivityPickerProps {
  onSelect: (activity: BreakActivity) => void;
  onBack: () => void;
}

export default function ActivityPicker({ onSelect, onBack }: ActivityPickerProps) {
  const { activities, favorites, activeCategory, setActiveCategory, getPreference, toggleFavorite, isCustomActivity } =
    useActivities();
  const { ref: dragRef, onPointerDown, onPointerMove, onPointerUp, onClickCapture } = useDragScroll<HTMLDivElement>();

  return (
    <div className="fixed inset-0 z-40 bg-alice dark:bg-jet-950 overflow-y-auto animate-fade-in">
      <div className="max-w-lg mx-auto px-5 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-lilac-600 hover:text-jet font-medium mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back
        </button>

        <h2 className="text-xl font-bold text-jet mb-1 animate-slide-up">Choose an activity</h2>
        <p className="text-sm text-lilac-600 mb-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
          Pick a restorative activity for your break.
        </p>

        <div ref={dragRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onClickCapture={onClickCapture} className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1 cursor-grab select-none" style={{ touchAction: 'pan-y' }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const CatIcon = CATEGORY_ICONS[cat];
            const label = cat === 'all' ? 'All' : getCategoryLabel(cat);

            if (cat === 'all') {
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-forest text-white border-forest shadow-sm'
                      : 'bg-white dark:bg-jet-800 text-jet-600 dark:text-jet-300 border-powder-200 dark:border-jet-700 hover:border-powder-300 dark:hover:border-jet-600'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            }

            const styles = getCategoryStyles(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shrink-0 active:scale-95 ${
                  isActive
                    ? `${styles.bg} ${styles.text} border-current shadow-sm`
                    : 'bg-white dark:bg-jet-800 text-jet-600 dark:text-jet-300 border-powder-200 dark:border-jet-700 hover:border-powder-300 dark:hover:border-jet-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'opacity-100' : 'opacity-40'}`} style={{ backgroundColor: styles.hex }} />
                {label}
              </button>
            );
          })}
        </div>

        {favorites.length > 0 && activeCategory === 'all' && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
              Your Favorites
            </h3>
            <div className="space-y-2">
              {favorites.map((a, i) => (
                <div
                  key={a.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <ActivityCard
                    activity={a}
                    isFavorited
                    isCustom={isCustomActivity(a.id)}
                    onSelect={() => onSelect(a)}
                    onToggleFav={() => toggleFavorite(a.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {activities.map((a, i) => {
            const pref = getPreference(a.id);
            return (
              <div
                key={a.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <ActivityCard
                  activity={a}
                  isFavorited={!!pref?.is_favorited}
                  isCustom={isCustomActivity(a.id)}
                  onSelect={() => onSelect(a)}
                  onToggleFav={() => toggleFavorite(a.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  isFavorited,
  isCustom,
  onSelect,
  onToggleFav,
}: {
  activity: BreakActivity;
  isFavorited: boolean;
  isCustom: boolean;
  onSelect: () => void;
  onToggleFav: () => void;
}) {
  const [heartAnim, setHeartAnim] = useState(false);
  const Icon = getActivityIcon(activity.icon_name);
  const mins = Math.ceil(activity.duration_seconds / 60);
  const styles = getCategoryStyles(activity.category);

  const handleToggleFav = () => {
    setHeartAnim(true);
    onToggleFav();
    setTimeout(() => setHeartAnim(false), 350);
  };

  return (
    <Card hoverable padding="sm" onClick={onSelect}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${styles.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-jet truncate">{activity.title}</p>
            {isCustom && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-lilac-100 text-lilac-600 dark:bg-lilac-950/40 dark:text-lilac-400 shrink-0">
                Custom
              </span>
            )}
          </div>
          <p className="text-xs text-lilac-500 line-clamp-1 mt-0.5">{activity.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={styles.badgeVariant as any}>
              {getCategoryLabel(activity.category)}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-lilac-500">
              <Clock className="w-3 h-3" />
              {mins}m
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFav();
          }}
          className="p-2 hover:bg-powder-50 dark:hover:bg-jet-800 rounded-lg transition-colors shrink-0"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-forest text-forest' : 'text-lilac-400'
            } ${heartAnim ? 'animate-heart-pop' : ''}`}
          />
        </button>
      </div>
    </Card>
  );
}
