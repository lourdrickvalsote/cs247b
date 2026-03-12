import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ProgressRing from './ui/ProgressRing';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import { useSession, useSessionTimer } from '../contexts/SessionContext';
import { formatTime, getCategoryStyles } from '../lib/format';
import { getActivityIcon } from '../lib/icons';

export default function GuidedActivityPlayer() {
  const { currentActivity, endBreakEarly, cancelActivity } = useSession();
  const { timerRemaining } = useSessionTimer();
  const [stepIndex, setStepIndex] = useState(0);
  const [stepKey, setStepKey] = useState(0);
  const stepEndTimeRef = useRef<number>(0);

  const steps = currentActivity?.instructions ?? [];
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const isBreathing = currentActivity?.category === 'breathing';

  // Set step end time when stepIndex or currentStep changes
  useEffect(() => {
    if (currentStep) {
      stepEndTimeRef.current = Date.now() + currentStep.duration_seconds * 1000;
      setStepKey((k) => k + 1);
    }
  }, [stepIndex, currentStep]);

  // Derive stepTimeLeft from wall clock — no separate interval needed
  // This re-computes every time timerRemaining changes (every 1s)
  const stepTimeLeft = currentStep
    ? Math.max(0, Math.round((stepEndTimeRef.current - Date.now()) / 1000))
    : 0;

  // Auto-advance to next step when time runs out
  useEffect(() => {
    if (stepTimeLeft <= 0 && currentStep && stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    }
  }, [stepTimeLeft, currentStep, stepIndex, totalSteps]);

  const goNext = () => {
    if (stepIndex < totalSteps - 1) setStepIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (!currentActivity || !currentStep) return null;

  const Icon = getActivityIcon(currentActivity.icon_name);
  const catStyles = getCategoryStyles(currentActivity.category);
  const stepProgress = currentStep.duration_seconds > 0
    ? 1 - stepTimeLeft / currentStep.duration_seconds
    : 1;

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-alice via-white to-alice flex flex-col items-center justify-center px-6 animate-fade-in">
      <button
        onClick={cancelActivity}
        className="absolute top-6 left-5 flex items-center gap-1.5 text-sm text-lilac-600 hover:text-jet font-medium transition-colors group z-10"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
        Back
      </button>

      <div className="max-w-sm w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-2 animate-slide-down">
          <Icon className={`w-4 h-4 ${catStyles.text}`} />
          <p className={`text-xs font-semibold ${catStyles.text} uppercase tracking-wider`}>
            {currentActivity.title}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <span className="text-xs text-lilac-500 font-medium">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className="text-lilac-300">&middot;</span>
          <span className="text-xs text-lilac-500 font-medium tabular-nums">
            {formatTime(timerRemaining)} remaining
          </span>
        </div>

        <div className="w-full bg-powder-100 rounded-full h-1.5 mb-8 overflow-hidden">
          <div
            className="bg-forest h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {isBreathing ? (
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-powder-200/30 animate-ripple-ring" />
              <div
                className="w-36 h-36 rounded-full bg-gradient-to-br from-powder-200 to-alice border-2 border-powder-300 animate-breathe flex items-center justify-center relative"
              >
                <p className="text-xs font-semibold text-jet-600 uppercase tracking-wider">
                  {currentStep.instruction.length < 30
                    ? currentStep.instruction
                    : 'Breathe'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-8">
            <ProgressRing
              progress={stepProgress}
              size={160}
              strokeWidth={6}
              fillColor={catStyles.hex}
              glowing
              showDot={false}
            >
              <p className="text-2xl font-bold text-jet tabular-nums">
                {stepTimeLeft}s
              </p>
            </ProgressRing>
          </div>
        )}

        <div
          key={stepKey}
          className="bg-white dark:bg-jet-800 rounded-2xl border border-powder-200 dark:border-jet-600 px-6 py-5 mb-8 min-h-[80px] flex items-center justify-center animate-fade-in transition-all duration-300"
        >
          <p className="text-base font-medium text-jet leading-relaxed">
            {currentStep.instruction}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <IconButton
            variant="default"
            label="Previous step"
            onClick={goPrev}
            disabled={stepIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </IconButton>

          <IconButton
            variant="default"
            label="Next step"
            onClick={goNext}
            disabled={stepIndex === totalSteps - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </IconButton>
        </div>

        <Button variant="ghost" size="sm" onClick={endBreakEarly}>
          Skip break and focus
        </Button>
      </div>
    </div>
  );
}
