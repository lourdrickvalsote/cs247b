import { Pause, Play, Square, Plus, ArrowRight } from 'lucide-react';
import ProgressRing from './ui/ProgressRing';
import AnimatedDigits from './ui/AnimatedDigits';
import IconButton from './ui/IconButton';
import { useSession } from '../contexts/SessionContext';
import GuidedActivityPlayer from './GuidedActivityPlayer';

export default function BreakMode() {
  const {
    timerRemaining,
    timerProgress,
    timerStatus,
    currentActivity,
    pauseTimer,
    resumeTimer,
    endBreakEarly,
    extendBreak,
    endSession,
  } = useSession();

  const isRunning = timerStatus === 'running';
  const isPaused = timerStatus === 'paused';

  if (currentActivity) {
    return <GuidedActivityPlayer />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 animate-fade-in">
      <div className="break-ambient-orb absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-breathe" aria-hidden="true" />
      <div aria-hidden="true">
        <div className="absolute top-[18%] left-[15%] w-8 h-8 rounded-full bg-powder/15 dark:bg-powder/8 animate-float-slow" />
        <div className="absolute top-[30%] right-[10%] w-6 h-6 rounded-full bg-lilac/12 dark:bg-lilac/6 animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[25%] left-[20%] w-5 h-5 rounded-full bg-powder/10 dark:bg-powder/5 animate-float-slow" style={{ animationDelay: '5s' }} />
      </div>
      <div className="relative mb-10 animate-scale-in z-10">
        <ProgressRing
          progress={timerProgress}
          size={260}
          strokeWidth={10}
          fillColor="#B8C5D6"
          glowing={isRunning}
        >
          <div className="text-center">
            <AnimatedDigits
              value={timerRemaining}
              running={isRunning}
              className="text-6xl font-bold text-jet tracking-tight"
            />
            {isRunning && (
              <div className="flex items-center justify-center gap-1.5 mt-2 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                <span className="text-xs font-semibold text-jet-600 dark:text-jet-300 uppercase tracking-wider">
                  Resting
                </span>
              </div>
            )}
            {isPaused && (
              <p className="text-xs font-semibold text-jet-600 dark:text-jet-300 uppercase tracking-wider mt-2 animate-fade-in">
                Paused
              </p>
            )}
          </div>
        </ProgressRing>
      </div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <IconButton
            variant="default"
            size="lg"
            label="End break"
            onClick={endBreakEarly}
          >
            <Square className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="animate-scale-in" style={{ animationDelay: '150ms' }}>
          <IconButton
            variant="primary"
            size="lg"
            label={isRunning ? 'Pause' : 'Resume'}
            onClick={isRunning ? pauseTimer : resumeTimer}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </IconButton>
        </div>

        <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          <IconButton
            variant="default"
            size="lg"
            label="Add 2 minutes"
            onClick={() => extendBreak(2)}
          >
            <Plus className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      <button
        onClick={endBreakEarly}
        className="flex items-center gap-1.5 text-xs text-lilac-500 hover:text-jet font-medium transition-colors animate-fade-in group"
        style={{ animationDelay: '300ms' }}
      >
        Skip break and focus
        <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      <button
        onClick={endSession}
        className="text-xs text-lilac-400 hover:text-lilac-600 dark:hover:text-jet-300 font-medium transition-colors animate-fade-in mt-3"
        style={{ animationDelay: '400ms' }}
      >
        End session
      </button>
    </div>
  );
}
