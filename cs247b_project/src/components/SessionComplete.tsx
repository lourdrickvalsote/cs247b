import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Coffee, Target, ArrowRight, BarChart3 } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import AnimatedCounter from './ui/AnimatedCounter';
import { useSession } from '../contexts/SessionContext';
import { formatMinutes } from '../lib/format';

export default function SessionComplete() {
  const navigate = useNavigate();
  const { resetAll, sessionNumber, totalPlannedSessions, completedStats, continueStudying, startNextRound } = useSession();
  const allSessionsDone = completedStats?.allDone ?? false;

  const workMins = completedStats ? formatMinutes(completedStats.totalWorkSeconds) : '0m';
  const breakMins = completedStats ? formatMinutes(completedStats.totalBreakSeconds) : '0m';
  const totalMins = completedStats
    ? formatMinutes(completedStats.totalWorkSeconds + completedStats.totalBreakSeconds)
    : '0m';
  const roundsDone = completedStats?.roundsCompleted ?? 0;

  const timeRange = completedStats
    ? `${new Date(completedStats.sessionStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -- ${new Date(completedStats.sessionEndedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '';

  const handleFinish = () => {
    resetAll();
    navigate('/timer');
  };

  const handleViewHistory = () => {
    resetAll();
    navigate('/history');
  };

  const confettiParticles = useMemo(() => allSessionsDone ? Array.from({ length: 10 }).map((_, i) => {
    const angle = (i / 10) * 360;
    const rad = (angle * Math.PI) / 180;
    const dist = 40 + Math.random() * 30;
    const x = Math.cos(rad) * dist;
    const y = Math.sin(rad) * dist;
    const colors = ['#2E6F40', '#B8C5D6', '#A39BA8', '#63A875', '#418d57'];
    return { x, y, color: colors[i % colors.length], delay: i * 60 };
  }) : [], [allSessionsDone]);

  if (allSessionsDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
        <div className="max-w-sm w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 bg-forest-50 rounded-3xl flex items-center justify-center animate-bounce-in">
              <Trophy className="w-10 h-10 text-forest" />
            </div>
            <div aria-hidden="true">
              {confettiParticles.map((p, i) => (
                <span
                  key={i}
                  className="confetti-particle"
                  style={{
                    top: '50%',
                    left: '50%',
                    backgroundColor: p.color,
                    '--confetti-x': `${p.x}px`,
                    '--confetti-y': `${p.y}px`,
                    animationDelay: `${p.delay}ms`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          <h1
            className="text-2xl font-bold text-jet mb-1 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            Session complete!
          </h1>
          <p
            className="text-sm text-lilac-600 mb-2 animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            Great work! You finished all {totalPlannedSessions} rounds.
          </p>
          {timeRange && (
            <p
              className="text-xs text-lilac-400 mb-8 animate-fade-in"
              style={{ animationDelay: '350ms' }}
            >
              {timeRange}
            </p>
          )}

          <div className="rounded-2xl bg-gradient-to-br from-forest-50/50 via-transparent to-powder-50/50 dark:from-forest-950/20 dark:to-powder-950/10 p-3 mb-8">
            <div
              className="grid grid-cols-2 gap-3 mb-3 animate-slide-up"
              style={{ animationDelay: '400ms' }}
            >
              <Card padding="sm" className="bg-white/70 dark:bg-jet-800/70">
                <div className="text-center">
                  <Clock className="w-4 h-4 text-forest mx-auto mb-1" />
                  <AnimatedCounter
                    value={workMins}
                    className="text-2xl font-bold text-jet block"
                  />
                  <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                    Focus
                  </p>
                </div>
              </Card>
              <Card padding="sm" className="bg-white/70 dark:bg-jet-800/70">
                <div className="text-center">
                  <Coffee className="w-4 h-4 text-powder-600 mx-auto mb-1" />
                  <AnimatedCounter
                    value={breakMins}
                    className="text-2xl font-bold text-jet block"
                  />
                  <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                    Break
                  </p>
                </div>
              </Card>
            </div>

            <div
              className="grid grid-cols-2 gap-3 animate-slide-up"
              style={{ animationDelay: '550ms' }}
            >
              <Card padding="sm" className="bg-white/70 dark:bg-jet-800/70">
                <div className="text-center">
                  <Target className="w-4 h-4 text-forest mx-auto mb-1" />
                  <AnimatedCounter
                    value={`${roundsDone}`}
                    className="text-2xl font-bold text-jet block"
                  />
                  <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                    Rounds
                  </p>
                </div>
              </Card>
              <Card padding="sm" className="bg-white/70 dark:bg-jet-800/70">
                <div className="text-center">
                  <Trophy className="w-4 h-4 text-forest mx-auto mb-1" />
                  <AnimatedCounter
                    value={totalMins}
                    className="text-2xl font-bold text-jet block"
                  />
                  <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                    Total
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <div
            className="space-y-3 animate-slide-up"
            style={{ animationDelay: '600ms' }}
          >
            <Button fullWidth size="lg" onClick={handleFinish}>
              Done
            </Button>
            <Button variant="outline" fullWidth onClick={handleViewHistory}>
              <BarChart3 className="w-4 h-4" />
              View History
            </Button>
            <button
              onClick={continueStudying}
              className="w-full text-xs text-lilac-500 hover:text-jet dark:hover:text-jet-100 font-semibold py-2 transition-colors"
            >
              Keep Going <ArrowRight className="w-3 h-3 inline ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Between rounds — not all sessions done yet
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-bounce-in">
          <Coffee className="w-8 h-8 text-forest" />
        </div>

        <h1
          className="text-2xl font-bold text-jet mb-1 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          Break complete!
        </h1>
        <p
          className="text-sm text-lilac-600 mb-8 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          Ready for round {sessionNumber} of {totalPlannedSessions}?
        </p>

        <div
          className="grid grid-cols-3 gap-3 mb-8 animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <Card padding="sm">
            <div className="text-center">
              <Clock className="w-4 h-4 text-forest mx-auto mb-1" />
              <AnimatedCounter
                value={workMins}
                className="text-lg font-bold text-jet block"
              />
              <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                Focus
              </p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <Target className="w-4 h-4 text-forest mx-auto mb-1" />
              <AnimatedCounter
                value={`${roundsDone}`}
                className="text-lg font-bold text-jet block"
              />
              <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                Rounds
              </p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <Coffee className="w-4 h-4 text-powder-600 mx-auto mb-1" />
              <AnimatedCounter
                value={breakMins}
                className="text-lg font-bold text-jet block"
              />
              <p className="text-[10px] text-lilac-500 uppercase tracking-wider font-semibold">
                Break
              </p>
            </div>
          </Card>
        </div>

        <div
          className="space-y-3 animate-slide-up"
          style={{ animationDelay: '500ms' }}
        >
          <Button fullWidth size="lg" onClick={startNextRound}>
            Continue Studying
          </Button>
          <Button variant="outline" fullWidth onClick={handleFinish}>
            Done for now
          </Button>
        </div>
      </div>
    </div>
  );
}
