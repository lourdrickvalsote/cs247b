import { useState } from 'react';
import { Heart, Clock, Leaf, StretchHorizontal, Wind, ScanLine, Footprints, Eye, Layers } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useActivities } from '../hooks/useActivities';
import { getCategoryLabel, getCategoryStyles } from '../lib/format';
import { getActivityIcon } from '../lib/icons';
import type { BreakActivity, ActivityCategory } from '../types/database';
import type { LucideIcon } from 'lucide-react';
import { useDragScroll } from '../hooks/useDragScroll';

const CATEGORIES: (ActivityCategory | 'all')[] = ['all', 'stretching', 'breathing', 'mindfulness', 'movement', 'eye_rest'];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: Layers,
  stretching: StretchHorizontal,
  breathing: Wind,
  mindfulness: ScanLine,
  movement: Footprints,
  eye_rest: Eye,
};

export default function ActivitiesPage() {
  const { activities, favorites, loading, activeCategory, setActiveCategory, getPreference, toggleFavorite } =
    useActivities();
  const [selectedActivity, setSelectedActivity] = useState<BreakActivity | null>(null);
  const { ref: dragRef, onPointerDown, onPointerMove, onPointerUp, onClickCapture } = useDragScroll<HTMLDivElement>();

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        <div className="h-7 w-48 skeleton rounded-lg mb-2" />
        <div className="h-4 w-64 skeleton rounded-lg mb-5" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 skeleton rounded-full" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 animate-fade-in">
      <h1 className="text-2xl font-bold text-jet mb-1">Break Activities</h1>
      <p className="text-sm text-lilac-600 mb-5">
        Browse and save your favorite restorative activities.
      </p>

      <div ref={dragRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onClickCapture={onClickCapture} className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1 cursor-grab select-none" style={{ touchAction: 'pan-y' }}>
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
                key={`fav-${a.id}`}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ActivityRow
                  activity={a}
                  isFavorited
                  onSelect={() => setSelectedActivity(a)}
                  onToggleFav={() => toggleFavorite(a.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
        {activeCategory === 'all' ? 'All Activities' : getCategoryLabel(activeCategory)}
      </h3>
      <div className="space-y-2">
        {activities.map((a, i) => {
          const pref = getPreference(a.id);
          return (
            <div
              key={a.id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <ActivityRow
                activity={a}
                isFavorited={!!pref?.is_favorited}
                onSelect={() => setSelectedActivity(a)}
                onToggleFav={() => toggleFavorite(a.id)}
              />
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="relative w-16 h-16 mx-auto mb-3" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-forest-100 to-powder-100 dark:from-forest-950/30 dark:to-powder-950/20 animate-breathe" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-forest-50 to-powder-50 dark:from-forest-950/20 dark:to-powder-950/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-forest/60" />
            </div>
          </div>
          <p className="text-sm font-medium text-jet dark:text-jet-200">No activities in this category</p>
          <p className="text-xs text-lilac-500 mt-1">Try a different category to find restorative exercises.</p>
        </div>
      )}

      <Modal
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.title}
      >
        {selectedActivity && (
          <ActivityDetail
            activity={selectedActivity}
            isFavorited={!!getPreference(selectedActivity.id)?.is_favorited}
            onToggleFav={() => toggleFavorite(selectedActivity.id)}
          />
        )}
      </Modal>
    </div>
  );
}

function ActivityRow({
  activity,
  isFavorited,
  onSelect,
  onToggleFav,
}: {
  activity: BreakActivity;
  isFavorited: boolean;
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
          <p className="text-sm font-semibold text-jet truncate">{activity.title}</p>
          <p className="text-xs text-lilac-500 line-clamp-1 mt-0.5">{activity.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={styles.badgeVariant as any}>{getCategoryLabel(activity.category)}</Badge>
            <span className="flex items-center gap-1 text-xs text-lilac-500">
              <Clock className="w-3 h-3" />
              {mins}m
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleFav(); }}
          className="p-2 hover:bg-powder-50 dark:hover:bg-jet-700 rounded-lg transition-colors shrink-0"
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

function ActivityDetail({ activity, isFavorited, onToggleFav }: { activity: BreakActivity; isFavorited: boolean; onToggleFav: () => void }) {
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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl ${styles.bg} flex items-center justify-center animate-scale-in`}>
          <Icon className={`w-5 h-5 ${styles.text}`} />
        </div>
        <div className="flex-1">
          <Badge variant={styles.badgeVariant as any}>{getCategoryLabel(activity.category)}</Badge>
          <p className="flex items-center gap-1 text-xs text-lilac-500 mt-1">
            <Clock className="w-3 h-3" />
            {mins} minutes &middot; {activity.instructions.length} steps
          </p>
        </div>
        <button
          onClick={handleToggleFav}
          className="p-2 hover:bg-powder-50 dark:hover:bg-jet-700 rounded-lg transition-colors shrink-0"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorited ? 'fill-forest text-forest' : 'text-lilac-400'
            } ${heartAnim ? 'animate-heart-pop' : ''}`}
          />
        </button>
      </div>

      <p className="text-sm text-jet-700 mb-5 leading-relaxed">{activity.description}</p>

      <h4 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
        Steps
      </h4>
      <div className="space-y-2">
        {activity.instructions.map((step, i) => (
          <div
            key={i}
            className="flex gap-3 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`w-6 h-6 rounded-full ${styles.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <span className={`text-[10px] font-bold ${styles.text}`}>{i + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-jet leading-relaxed">{step.instruction}</p>
              <p className="text-xs text-lilac-500 mt-0.5">{step.duration_seconds}s</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${styles.bg} dark:bg-forest-950/30`}>
          <Clock className={`w-4 h-4 ${styles.text} shrink-0`} />
          <p className="text-xs text-forest-700 dark:text-forest-300 font-medium">
            Activities can be started from the break alert screen when your work timer ends.
          </p>
        </div>
      </div>
    </div>
  );
}
