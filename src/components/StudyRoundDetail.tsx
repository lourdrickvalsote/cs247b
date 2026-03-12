import { useState } from 'react';
import { Clock, Coffee, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from './ui/Modal';
import { formatMinutes, getCategoryLabel, getCategoryStyles } from '../lib/format';
import Badge from './ui/Badge';
import { getActivityIcon } from '../lib/icons';
import type { StudyRound, RoundPair, ActivityStep } from '../types/database';

interface StudyRoundDetailProps {
  round: StudyRound | null;
  open: boolean;
  onClose: () => void;
}

function formatTimeRange(startIso: string, endIso: string | null): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const start = fmt(new Date(startIso));
  if (!endIso) return start;
  return `${start} -- ${fmt(new Date(endIso))}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function ProgressBar({ actual, planned }: { actual: number; planned: number }) {
  const pct = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-lilac-500 mb-1">
        <span>{formatMinutes(actual)} of {formatMinutes(planned)}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 bg-powder-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 100 ? '#2E6F40' : '#A39BA8',
          }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ completed }: { completed: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        completed
          ? 'bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-300 border border-forest-100 dark:border-forest-800'
          : 'bg-lilac-50 dark:bg-lilac-950 text-lilac-700 dark:text-lilac-300 border border-lilac-200 dark:border-lilac-800'
      }`}
    >
      {completed ? 'Completed' : 'Ended Early'}
    </span>
  );
}

function TimelineBar({ workSecs, breakSecs }: { workSecs: number; breakSecs: number }) {
  const total = workSecs + breakSecs;
  if (total === 0) return null;
  const workPct = Math.round((workSecs / total) * 100);

  return (
    <div className="mt-1">
      <div className="h-2.5 rounded-full overflow-hidden flex bg-powder-100">
        {workSecs > 0 && (
          <div
            className="h-full bg-forest rounded-l-full transition-all duration-500"
            style={{ width: `${workPct}%` }}
          />
        )}
        {breakSecs > 0 && (
          <div
            className="h-full bg-powder-300 transition-all duration-500"
            style={{ width: `${100 - workPct}%`, borderTopRightRadius: '9999px', borderBottomRightRadius: '9999px' }}
          />
        )}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-forest" />
          <span className="text-[10px] text-lilac-500">Focus {formatMinutes(workSecs)}</span>
        </div>
        {breakSecs > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-powder-300" />
            <span className="text-[10px] text-lilac-500">Break {formatMinutes(breakSecs)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivitySteps({ steps }: { steps: ActivityStep[] }) {
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-semibold text-lilac-600 hover:text-jet transition-colors"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Hide' : 'Show'} {steps.length} step{steps.length !== 1 ? 's' : ''}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-powder-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-lilac-500">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-jet leading-relaxed">{step.instruction}</p>
                <p className="text-[10px] text-lilac-400 mt-0.5">{step.duration_seconds}s</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoundPairDetail({ pair, index, total }: { pair: RoundPair; index: number; total: number }) {
  const { workSession, breakSession } = pair;
  const activity = breakSession?.break_activities;
  const ActIcon = activity ? getActivityIcon(activity.icon_name) : Activity;

  return (
    <div className="space-y-3">
      {total > 1 && (
        <p className="text-[10px] font-semibold text-lilac-400 uppercase tracking-wider">
          Round {index + 1} of {total}
        </p>
      )}

      {workSession && (
        <div className="bg-forest-50/50 rounded-xl p-4 border border-forest-100/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-forest" />
              <span className="text-sm font-semibold text-jet">Focus</span>
            </div>
            <StatusBadge completed={workSession.completed} />
          </div>
          <p className="text-xs text-lilac-500">
            {formatTimeRange(workSession.started_at, workSession.ended_at)}
          </p>
          <ProgressBar
            actual={workSession.actual_duration_seconds}
            planned={workSession.planned_duration_seconds}
          />
        </div>
      )}

      {breakSession && (
        <div className="bg-powder-50/50 rounded-xl p-4 border border-powder-200/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-powder-600" />
              <span className="text-sm font-semibold text-jet">
                {breakSession.type === 'long_break' ? 'Long Break' : 'Short Break'}
              </span>
            </div>
            <StatusBadge completed={breakSession.completed} />
          </div>
          <p className="text-xs text-lilac-500">
            {formatTimeRange(breakSession.started_at, breakSession.ended_at)}
          </p>
          <ProgressBar
            actual={breakSession.actual_duration_seconds}
            planned={breakSession.planned_duration_seconds}
          />
        </div>
      )}

      {activity && (() => {
        const catStyles = getCategoryStyles(activity.category);
        return (
        <div className="bg-white dark:bg-jet-800 rounded-xl p-4 border border-powder-200 dark:border-jet-600">
          <div className="flex items-center gap-2 mb-2">
            <ActIcon className={`w-4 h-4 ${catStyles.text}`} />
            <span className="text-sm font-semibold text-jet">{activity.title}</span>
            <Badge variant={catStyles.badgeVariant as any}>
              {getCategoryLabel(activity.category)}
            </Badge>
          </div>
          {activity.description && (
            <p className="text-xs text-lilac-500 leading-relaxed">{activity.description}</p>
          )}
          <p className="text-[10px] text-lilac-400 mt-1.5">
            {formatMinutes(activity.duration_seconds)} guided activity
          </p>
          <ActivitySteps steps={(activity.instructions ?? []) as ActivityStep[]} />
        </div>
        );
      })()}
    </div>
  );
}

export default function StudyRoundDetail({ round, open, onClose }: StudyRoundDetailProps) {
  if (!round) return null;

  const { rounds } = round;

  return (
    <Modal open={open} onClose={onClose} title="Session Details">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-jet">{formatDate(round.startedAt)}</p>
          <p className="text-xs text-lilac-500 mt-0.5">
            {formatTimeRange(round.startedAt, round.endedAt)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-jet-50 dark:bg-jet-800 text-jet-600 dark:text-jet-300 border border-jet-100 dark:border-jet-700">
              {formatMinutes(round.totalDurationSeconds)} total
            </span>
            {rounds.length > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-100">
                {rounds.length} rounds
              </span>
            )}
          </div>
        </div>

        {rounds.map((pair, i) => (
          <RoundPairDetail key={i} pair={pair} index={i} total={rounds.length} />
        ))}

        <div className="pt-3 border-t border-powder-100 dark:border-jet-700">
          <p className="text-[10px] font-semibold text-lilac-400 uppercase tracking-wider mb-2">
            Session Summary
          </p>
          <TimelineBar workSecs={round.totalWorkSeconds} breakSecs={round.totalBreakSeconds} />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-jet">{formatMinutes(round.totalWorkSeconds)}</p>
              <p className="text-[10px] text-lilac-400 uppercase tracking-wider font-semibold">Focus</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-jet">{formatMinutes(round.totalBreakSeconds)}</p>
              <p className="text-[10px] text-lilac-400 uppercase tracking-wider font-semibold">Break</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-jet">{formatMinutes(round.totalDurationSeconds)}</p>
              <p className="text-[10px] text-lilac-400 uppercase tracking-wider font-semibold">Total</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
