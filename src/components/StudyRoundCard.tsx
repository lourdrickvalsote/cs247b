import { Clock, Coffee, CheckCircle2, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import Card from './ui/Card';
import { getCategoryLabel, getCategoryStyles } from '../lib/format';
import type { StudyRound } from '../types/database';

interface StudyRoundCardProps {
  round: StudyRound;
  delay: number;
  onClick: () => void;
}

export default function StudyRoundCard({ round, delay, onClick }: StudyRoundCardProps) {
  const { rounds } = round;
  const workMins = Math.round(round.totalWorkSeconds / 60);
  const breakMins = Math.round(round.totalBreakSeconds / 60);
  const roundCount = rounds.length;

  const time = new Date(round.startedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasWork = rounds.some((r) => r.workSession !== null);
  const hasBreak = rounds.some((r) => r.breakSession !== null);

  const allCompleted = rounds.every(
    (r) => (r.workSession?.completed ?? true) && (r.breakSession?.completed ?? true),
  );
  const anyIncomplete = rounds.some(
    (r) =>
      (r.workSession && !r.workSession.completed) ||
      (r.breakSession && !r.breakSession.completed),
  );

  // Compute average restoration rating
  const ratedBreaks = rounds
    .map((r) => r.breakSession?.restoration_rating)
    .filter((r): r is number => r != null);
  const avgRating = ratedBreaks.length > 0
    ? ratedBreaks.reduce((sum, r) => sum + r, 0) / ratedBreaks.length
    : null;

  // Collect unique activities
  const activities = rounds
    .map((r) => r.breakSession?.break_activities)
    .filter((a): a is NonNullable<typeof a> => a !== null && a !== undefined);
  const uniqueActivities = [...new Map(activities.map((a) => [a.category, a])).values()];

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card padding="sm" hoverable onClick={onClick} className={`border-l-2 ${hasWork ? 'border-l-forest' : 'border-l-powder'} ${anyIncomplete ? 'opacity-80' : ''}`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasWork ? 'bg-forest-50' : 'bg-powder-50'
            }`}
          >
            {hasWork ? (
              <Clock className="w-4 h-4 text-forest" />
            ) : (
              <Coffee className="w-4 h-4 text-powder-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-jet truncate">
                {hasWork ? 'Focus Session' : 'Break'}
              </p>
              {uniqueActivities.map((activity) => {
                const catStyles = getCategoryStyles(activity.category);
                return (
                  <span
                    key={activity.category}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${catStyles.bg} ${catStyles.text} border border-powder-200 dark:border-powder-800 shrink-0`}
                  >
                    {getCategoryLabel(activity.category)}
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-lilac-500 mt-0.5">
              {time}
              {roundCount > 1 && (
                <span> &middot; {roundCount} rounds</span>
              )}
              {hasWork && (
                <span> &middot; {workMins}m focus</span>
              )}
              {hasBreak && (
                <span className="text-lilac-400">
                  {hasWork ? ' + ' : ' &middot; '}{breakMins}m break
                </span>
              )}
              {hasWork && !hasBreak && (
                <span className="text-lilac-400 italic"> &middot; no break</span>
              )}
              {avgRating !== null && (
                <span className={avgRating >= 4 ? 'text-forest' : avgRating >= 3 ? 'text-lilac-500' : 'text-lilac-400'}>
                  {' '}&middot; <Sparkles className="w-3 h-3 inline -mt-0.5" /> {avgRating.toFixed(1)}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {allCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-forest" />
            ) : anyIncomplete ? (
              <AlertCircle className="w-4 h-4 text-lilac-500" />
            ) : null}
            <ChevronRight className="w-3.5 h-3.5 text-lilac-300" />
          </div>
        </div>
      </Card>
    </div>
  );
}
