import { useState } from 'react';
import { Clock, Trophy, Coffee, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import StudyRoundCard from '../components/StudyRoundCard';
import StudyRoundDetail from '../components/StudyRoundDetail';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { formatMinutes } from '../lib/format';
import type { StudyRound } from '../types/database';
import type { DatePreset, TypeFilter } from '../contexts/SessionHistoryContext';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'breaks', label: 'Breaks' },
];

export default function HistoryPage() {
  const {
    todayWorkSeconds,
    todayBreakCount,
    todayCompletedSessions,
    loading,
    rounds,
    datePreset,
    setDatePreset,
    customRange,
    setCustomRange,
    typeFilter,
    setTypeFilter,
    page,
    setPage,
    totalCount,
    totalPages,
  } = useSessionHistory();

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [selectedRound, setSelectedRound] = useState<StudyRound | null>(null);

  const handlePresetChange = (preset: DatePreset) => {
    setShowCustomRange(false);
    setCustomRange(null);
    setDatePreset(preset);
  };

  const handleCustomRangeToggle = () => {
    const next = !showCustomRange;
    setShowCustomRange(next);
    if (!next) {
      setCustomRange(null);
    } else {
      const today = new Date();
      const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      setCustomRange({
        start: weekAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      });
    }
  };

  if (loading && rounds.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        <div className="h-7 w-32 skeleton rounded-lg mb-2" />
        <div className="h-4 w-56 skeleton rounded-lg mb-6" />
        <div className="grid grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 animate-fade-in">
      <h1 className="text-2xl font-bold text-jet mb-1">History</h1>
      <p className="text-sm text-lilac-600 mb-6">Your study activity overview.</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Clock, value: formatMinutes(todayWorkSeconds), label: 'Focus Today', delay: 0, gradient: 'bg-gradient-to-br from-forest-50/50 to-transparent dark:from-forest-950/20', iconBg: 'bg-forest-100 dark:bg-forest-900/40', iconColor: 'text-forest' },
          { icon: Trophy, value: `${todayCompletedSessions}`, label: 'Sessions', delay: 80, gradient: 'bg-gradient-to-br from-powder-50 to-transparent dark:from-powder-950/20', iconBg: 'bg-powder-200 dark:bg-powder-900/40', iconColor: 'text-powder-700 dark:text-powder-300' },
          { icon: Coffee, value: `${todayBreakCount}`, label: 'Breaks', delay: 160, gradient: 'bg-gradient-to-br from-lilac-50/50 to-transparent dark:from-lilac-950/20', iconBg: 'bg-lilac-100 dark:bg-lilac-950/40', iconColor: 'text-lilac-600 dark:text-lilac-400' },
        ].map(({ icon: StatIcon, value, label, delay, gradient, iconBg, iconColor }) => (
          <div
            key={label}
            className="animate-slide-up"
            style={{ animationDelay: `${delay}ms` }}
          >
            <Card padding="sm" className={gradient}>
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-1.5`}>
                  <StatIcon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <AnimatedCounter
                  value={value}
                  className="text-3xl font-bold text-jet block"
                />
                <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold mt-0.5">
                  {label}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetChange(preset.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  datePreset === preset.value && !showCustomRange
                    ? 'bg-forest text-white shadow-sm'
                    : 'bg-white dark:bg-jet-800 text-lilac-600 dark:text-jet-300 hover:bg-powder-50 dark:hover:bg-jet-700 border border-powder-200 dark:border-jet-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleCustomRangeToggle}
            className={`p-2 rounded-lg transition-all duration-200 shrink-0 ${
              showCustomRange
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white dark:bg-jet-800 text-lilac-600 dark:text-jet-300 hover:bg-powder-50 dark:hover:bg-jet-700 border border-powder-200 dark:border-jet-600'
            }`}
            title="Custom date range"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {showCustomRange && customRange && (
          <div className="flex gap-2 animate-slide-up">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-lilac-500 uppercase tracking-wider mb-1">From</label>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-sm text-jet dark:text-jet-100 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-lilac-500 uppercase tracking-wider mb-1">To</label>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-sm text-jet dark:text-jet-100 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-lilac-400" />
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                typeFilter === filter.value
                  ? 'bg-jet dark:bg-jet-200 text-white dark:text-jet-950'
                  : 'text-lilac-500 hover:text-jet dark:hover:text-jet-200 hover:bg-powder-50 dark:hover:bg-jet-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
          {totalCount > 0 && (
            <span className="ml-auto text-[10px] text-lilac-400 font-medium">
              {totalCount} round{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {rounds.length === 0 ? (
        <EmptyState hasFilters={datePreset !== 'all' || typeFilter !== 'all' || showCustomRange} />
      ) : (
        <>
          <RoundList rounds={rounds} onSelect={setSelectedRound} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-powder-100 dark:border-jet-700">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-jet-800 border border-powder-200 dark:border-jet-600 text-jet dark:text-jet-200 hover:bg-powder-50 dark:hover:bg-jet-700 hover:border-powder-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="text-xs text-lilac-500 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-jet-800 border border-powder-200 dark:border-jet-600 text-jet dark:text-jet-200 hover:bg-powder-50 dark:hover:bg-jet-700 hover:border-powder-300"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      <StudyRoundDetail
        round={selectedRound}
        open={selectedRound !== null}
        onClose={() => setSelectedRound(null)}
      />
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="relative w-20 h-20 mx-auto mb-4" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-forest-100 to-powder-100 dark:from-forest-950/30 dark:to-powder-950/20 animate-breathe" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-forest-50 to-powder-50 dark:from-forest-950/20 dark:to-powder-950/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className="w-8 h-8 text-forest/60" />
        </div>
      </div>
      <p className="text-sm font-medium text-jet dark:text-jet-200">
        {hasFilters ? 'No sessions found' : 'No sessions yet'}
      </p>
      <p className="text-xs text-lilac-500 mt-1 max-w-[200px] mx-auto">
        {hasFilters
          ? 'Try adjusting your filters or date range.'
          : 'Your study journey starts with a single session. Head to the Timer to begin!'}
      </p>
    </div>
  );
}

function RoundList({ rounds, onSelect }: { rounds: StudyRound[]; onSelect: (r: StudyRound) => void }) {
  const grouped = groupByDate(rounds);
  let itemIndex = 0;

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel}>
          <h3 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
            {dateLabel}
          </h3>
          <div className="space-y-2">
            {items.map((r) => {
              const delay = Math.min(itemIndex++ * 40, 400);
              return (
                <StudyRoundCard
                  key={r.id}
                  round={r}
                  delay={delay}
                  onClick={() => onSelect(r)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(rounds: StudyRound[]) {
  const groups: Record<string, StudyRound[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const r of rounds) {
    const date = new Date(r.startedAt).toDateString();
    let label: string;
    if (date === today) label = 'Today';
    else if (date === yesterday) label = 'Yesterday';
    else label = new Date(r.startedAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(r);
  }

  return groups;
}
