import { useState } from 'react';
import { Play, Pause, SkipForward, Square, Leaf } from 'lucide-react';
import ProgressRing from '../components/ui/ProgressRing';
import AnimatedDigits from '../components/ui/AnimatedDigits';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useSession, useSessionTimer } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { formatMinutes } from '../lib/format';
import BreakAlert from '../components/BreakAlert';
import BreakMode from '../components/BreakMode';
import SessionComplete from '../components/SessionComplete';

export default function TimerPage() {
  const {
    phase,
    sessionNumber,
    totalPlannedSessions,
    startWork,
    pauseTimer,
    resumeTimer,
    skipToBreak,
    endSession,
  } = useSession();
  const { timerRemaining, timerProgress, timerStatus } = useSessionTimer();
  const { settings } = useSettings();
  const { todayWorkSeconds, todayCompletedSessions } = useSessionHistory();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);

  if (phase === 'break_alert') return <BreakAlert />;
  if (phase === 'breaking') return <BreakMode />;
  if (phase === 'session_complete') return <SessionComplete />;

  const isIdle = phase === 'idle';
  const isRunning = timerStatus === 'running';
  const isPaused = timerStatus === 'paused';
  const displaySeconds = isIdle ? settings.work_duration_minutes * 60 : timerRemaining;
  const isUrgent = !isIdle && timerRemaining <= 60 && timerRemaining > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 animate-fade-in dark:text-jet-100">
      <div className="text-center mb-8 animate-slide-down">
        <p className="text-xs font-semibold text-lilac uppercase tracking-widest mb-1">
          {isIdle ? 'Ready to focus' : 'Focus Session'}
        </p>
        <p className="text-sm text-jet-600 font-medium">
          Session {sessionNumber} of {totalPlannedSessions}
        </p>
      </div>

      <div className={`relative mb-10 ${isIdle ? 'animate-float' : ''}`}>
        {isIdle && (
          <div className="timer-ambient-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-breathe" aria-hidden="true" />
        )}
        <ProgressRing
          progress={isIdle ? 0 : timerProgress}
          size={260}
          strokeWidth={10}
          fillColor={isRunning ? '#2E6F40' : isPaused ? '#A39BA8' : '#B8C5D6'}
          glowing={isRunning}
        >
          <div className="text-center">
            <AnimatedDigits
              value={displaySeconds}
              running={isRunning}
              className={`text-5xl font-bold tracking-tight transition-colors duration-[2000ms] ${
                isUrgent ? 'text-lilac-600' : 'text-jet'
              }`}
            />
            {isRunning && (
              <div className="flex items-center justify-center gap-1.5 mt-2 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                <span className="text-xs font-semibold text-forest uppercase tracking-wider">
                  Focus
                </span>
              </div>
            )}
            {isPaused && (
              <p className="text-xs font-semibold text-lilac uppercase tracking-wider mt-2 animate-fade-in">
                Paused
              </p>
            )}
          </div>
        </ProgressRing>
      </div>

      {isIdle && (
        <div className="animate-slide-up text-center">
          <div className="flex items-center justify-center gap-1.5 mb-4" aria-hidden="true">
            {Array.from({ length: totalPlannedSessions }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < sessionNumber - 1
                    ? 'bg-forest'
                    : 'bg-powder-300 dark:bg-jet-600'
                }`}
              />
            ))}
          </div>
          <Button size="lg" onClick={startWork}>
            <Leaf className="w-5 h-5" />
            Start Studying
          </Button>
          {todayWorkSeconds > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3 animate-fade-in bg-white/80 dark:bg-jet-800/80 border border-powder-200 dark:border-jet-700 rounded-full px-4 py-2 shadow-sm mx-auto">
              <Leaf className="w-3.5 h-3.5 text-forest" />
              <p className="text-xs text-jet-600 dark:text-jet-300 font-medium">
                {formatMinutes(todayWorkSeconds)} focused &middot; {todayCompletedSessions} session{todayCompletedSessions !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {(isRunning || isPaused) && (
        <div className="flex items-center gap-4">
          <div className="animate-scale-in" style={{ animationDelay: '0ms' }}>
            <IconButton
              variant="default"
              size="lg"
              label="End session"
              onClick={() => setConfirmEnd(true)}
            >
              <Square className="w-5 h-5" />
            </IconButton>
          </div>

          <div className="animate-scale-in" style={{ animationDelay: '50ms' }}>
            <IconButton
              variant="primary"
              size="lg"
              label={isRunning ? 'Pause' : 'Resume'}
              onClick={isRunning ? pauseTimer : resumeTimer}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </IconButton>
          </div>

          <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
            <IconButton
              variant="default"
              size="lg"
              label="Skip to break"
              onClick={() => setConfirmSkip(true)}
            >
              <SkipForward className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      )}

      {isIdle && (() => {
        const sessionsLeft = settings.sessions_before_long_break - ((sessionNumber - 1) % settings.sessions_before_long_break);
        const longBreakText = sessionsLeft === 1
          ? 'Next break is a long break'
          : `${sessionsLeft} sessions until long break`;
        return (
          <p className="text-xs text-lilac-500 mt-6 text-center max-w-xs animate-fade-in" style={{ animationDelay: '300ms' }}>
            {settings.work_duration_minutes} min work &middot; {settings.short_break_minutes} min break &middot; {longBreakText}
          </p>
        );
      })()}

      <ConfirmDialog
        open={confirmEnd}
        title="End session?"
        message="Your current progress will be saved, but the session will be marked as incomplete."
        confirmLabel="End Session"
        variant="danger"
        onConfirm={() => { setConfirmEnd(false); endSession(); }}
        onCancel={() => setConfirmEnd(false)}
      />

      <ConfirmDialog
        open={confirmSkip}
        title="Skip to break?"
        message="Your work session will end early and a break will begin."
        confirmLabel="Skip"
        onConfirm={() => { setConfirmSkip(false); skipToBreak(); }}
        onCancel={() => setConfirmSkip(false)}
      />
    </div>
  );
}
