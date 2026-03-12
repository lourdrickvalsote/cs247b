import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StretchHorizontal,
  Wind,
  Brain,
  Footprints,
  Eye,
  Timer,
  Leaf,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function StepProblem() {
  return (
    <div className="text-center max-w-sm mx-auto">
      <div className="mb-8 animate-bounce-in">
        <ProgressRing progress={0.75} size={140} strokeWidth={6} showDot={false}>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-forest-50 text-forest">
            <Brain className="w-6 h-6" />
          </div>
        </ProgressRing>
      </div>

      <h1
        className="text-3xl font-bold text-jet mb-3 tracking-tight animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        Your breaks deserve better
      </h1>
      <p
        className="text-base text-lilac-600 mb-8 leading-relaxed animate-fade-in"
        style={{ animationDelay: '400ms' }}
      >
        Most students skip their breaks or scroll social media. That leaves you more drained, not recharged.
      </p>

      <div
        className="flex flex-wrap justify-center gap-2 animate-slide-up"
        style={{ animationDelay: '600ms' }}
      >
        {['Doomscrolling', 'Skipping breaks', 'Sitting still'].map((label) => (
          <span
            key={label}
            className="px-4 py-1.5 rounded-full bg-powder-100 text-jet-700 text-sm font-medium"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepSolution() {
  const icons = [
    { Icon: StretchHorizontal, label: 'Stretch' },
    { Icon: Wind, label: 'Breathe' },
    { Icon: Brain, label: 'Mindfulness' },
    { Icon: Footprints, label: 'Move' },
    { Icon: Eye, label: 'Eye rest' },
  ];

  return (
    <div className="text-center max-w-sm mx-auto">
      <div className="flex justify-center gap-3 mb-8">
        {icons.map(({ Icon, label }, i) => (
          <div
            key={label}
            className={`w-14 h-14 rounded-xl bg-forest-50 flex items-center justify-center animate-bounce-in ${
              i === 2 ? 'animate-float' : ''
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Icon className="w-6 h-6 text-forest" />
          </div>
        ))}
      </div>

      <h1
        className="text-3xl font-bold text-jet mb-3 tracking-tight animate-slide-up"
        style={{ animationDelay: '300ms' }}
      >
        Brevi guides your breaks
      </h1>
      <p
        className="text-base text-lilac-600 leading-relaxed animate-fade-in"
        style={{ animationDelay: '500ms' }}
      >
        After each focus session, choose a restorative activity — stretching, breathing, mindfulness, and more — with step-by-step guidance.
      </p>
    </div>
  );
}

function StepHowItWorks() {
  const steps = [
    {
      Icon: Timer,
      title: 'Focus',
      desc: 'Set your timer and dive into deep work.',
    },
    {
      Icon: Leaf,
      title: 'Recharge',
      desc: 'Follow a guided activity to truly rest.',
    },
    {
      Icon: BarChart3,
      title: 'Reflect',
      desc: 'Track your sessions and build better habits.',
    },
  ];

  return (
    <div className="text-center max-w-sm mx-auto">
      <h1
        className="text-3xl font-bold text-jet mb-8 tracking-tight animate-slide-up"
      >
        Your study flow
      </h1>

      <div className="relative flex flex-col items-center gap-0">
        <div
          className="absolute left-1/2 -translate-x-px top-[52px] bottom-[52px] w-0.5 bg-forest-200 animate-fade-in"
          style={{ animationDelay: '400ms' }}
        />

        {steps.map(({ Icon, title, desc }, i) => (
          <div key={title} className="relative z-10">
            <Card
              padding="sm"
              className="flex items-center gap-4 text-left w-72 animate-slide-up"
              style={{ animationDelay: `${200 + i * 150}ms` } as React.CSSProperties}
            >
              <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-bold text-jet text-sm">{title}</p>
                <p className="text-xs text-lilac-600 leading-snug">{desc}</p>
              </div>
            </Card>
            {i < steps.length - 1 && <div className="h-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsValues {
  work_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  sessions_before_long_break: number;
}

function StepSettings({
  values,
  onChange,
}: {
  values: SettingsValues;
  onChange: (v: SettingsValues) => void;
}) {
  const update = (key: keyof SettingsValues, delta: number, min: number, max: number, step: number) => {
    const next = Math.min(max, Math.max(min, values[key] + delta * step));
    onChange({ ...values, [key]: next });
  };

  const settings = [
    { key: 'work_duration_minutes' as const, label: 'Focus duration', unit: 'min', min: 10, max: 90, step: 5 },
    { key: 'short_break_minutes' as const, label: 'Short break', unit: 'min', min: 3, max: 15, step: 1 },
    { key: 'long_break_minutes' as const, label: 'Long break', unit: 'min', min: 10, max: 30, step: 5 },
    { key: 'sessions_before_long_break' as const, label: 'Sessions before long break', unit: '', min: 2, max: 6, step: 1 },
  ];

  return (
    <div className="max-w-sm mx-auto w-full">
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold text-jet mb-3 tracking-tight animate-slide-up"
        >
          Set your pace
        </h1>
        <p
          className="text-base text-lilac-600 leading-relaxed animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          Configure your ideal study rhythm. You can always change these later in Settings.
        </p>
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '300ms' } as React.CSSProperties}>
        <div className="space-y-5">
          {settings.map(({ key, label, unit, min, max, step }, i) => {
            const pct = ((values[key] - min) / (max - min)) * 100;
            return (
              <div
                key={key}
                className="animate-fade-in"
                style={{ animationDelay: `${400 + i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-jet dark:text-jet-100">{label}</span>
                  <span className="text-sm font-bold text-forest tabular-nums">
                    {values[key]}{unit && ` ${unit}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => update(key, -1, min, max, step)}
                    disabled={values[key] <= min}
                    className="w-8 h-8 rounded-full border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 flex items-center justify-center shrink-0 text-jet-600 dark:text-jet-300 hover:bg-powder-50 dark:hover:bg-jet-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={values[key]}
                    onChange={(e) => onChange({ ...values, [key]: Number(e.target.value) })}
                    style={{ background: `linear-gradient(to right, #2E6F40 0%, #2E6F40 ${pct}%, #dae1eb ${pct}%, #dae1eb 100%)` }}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-forest
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forest [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-forest [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer
                      [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-2"
                  />
                  <button
                    type="button"
                    onClick={() => update(key, 1, min, max, step)}
                    disabled={values[key] >= max}
                    className="w-8 h-8 rounded-full border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 flex items-center justify-center shrink-0 text-jet-600 dark:text-jet-300 hover:bg-powder-50 dark:hover:bg-jet-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StepReady({ displayName }: { displayName: string }) {
  return (
    <div className="text-center max-w-sm mx-auto">
      <div className="mb-6 animate-bounce-in">
        <div className="animate-float inline-block">
          <ProgressRing progress={1} size={100} strokeWidth={5} showDot={false}>
            <span className="text-lg font-bold text-jet tabular-nums">25:00</span>
          </ProgressRing>
        </div>
      </div>

      <h1
        className="text-3xl font-bold text-jet mb-3 tracking-tight animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        You're all set{displayName ? `, ${displayName}` : ''}!
      </h1>
      <p
        className="text-base text-lilac-600 mb-6 leading-relaxed animate-fade-in"
        style={{ animationDelay: '400ms' }}
      >
        Your preferences have been saved. Start your first focus session and discover restorative breaks along the way.
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { user, profile, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 5;

  const displayName = profile?.display_name ?? '';

  const [settingsValues, setSettingsValues] = useState<SettingsValues>({
    work_duration_minutes: 25,
    short_break_minutes: 5,
    long_break_minutes: 15,
    sessions_before_long_break: 4,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_settings')
      .select('work_duration_minutes, short_break_minutes, long_break_minutes, sessions_before_long_break')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettingsValues({
            work_duration_minutes: data.work_duration_minutes,
            short_break_minutes: data.short_break_minutes,
            long_break_minutes: data.long_break_minutes,
            sessions_before_long_break: data.sessions_before_long_break,
          });
        }
      });
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    await supabase
      .from('user_settings')
      .update(settingsValues)
      .eq('user_id', user.id);
  };

  const handleComplete = async () => {
    await saveSettings();
    await completeOnboarding();
    navigate('/timer', { replace: true });
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center px-6 relative">
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm text-lilac-600 hover:text-jet font-medium transition-colors"
      >
        Skip
      </button>

      <div className="flex-1 flex items-center justify-center w-full" key={step}>
        {step === 0 && <StepProblem />}
        {step === 1 && <StepSolution />}
        {step === 2 && <StepHowItWorks />}
        {step === 3 && <StepSettings values={settingsValues} onChange={setSettingsValues} />}
        {step === 4 && <StepReady displayName={displayName} />}
      </div>

      <div className="w-full max-w-sm pb-10 space-y-6">
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-forest'
                  : 'w-2 bg-powder-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          <Button
            fullWidth
            onClick={step === totalSteps - 1 ? handleComplete : () => setStep((s) => s + 1)}
          >
            {step === totalSteps - 1 ? (
              <>
                Start Your First Session
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
