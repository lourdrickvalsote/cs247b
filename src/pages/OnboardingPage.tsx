import { useState } from 'react';
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
  Cog,
  Minus,
  Plus,
  Settings2,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';

function StepProblem() {
  return (
    <div className="text-center max-w-sm mx-auto">
      <div className="mb-8 animate-bounce-in">
        <ProgressRing progress={0.75} size={140} strokeWidth={6} showDot={false}>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-forest-50 text-forest">
            <Brain className="w-6 h-6" />
            <Cog className="w-4 h-4 -ml-1 opacity-60" />
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
        {/* Connecting line */}
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

interface OnboardingSettings {
  work_duration_minutes: number;
  short_break_minutes: number;
  sessions_before_long_break: number;
  hidden_categories: string[];
}

const ACTIVITY_CATEGORIES = [
  { key: 'stretching', label: 'Stretching', Icon: StretchHorizontal },
  { key: 'breathing', label: 'Breathing', Icon: Wind },
  { key: 'mindfulness', label: 'Mindfulness', Icon: Brain },
  { key: 'movement', label: 'Movement', Icon: Footprints },
  { key: 'eye_rest', label: 'Eye Rest', Icon: Eye },
] as const;

function StepPreferences({
  hiddenCategories,
  onToggle,
}: {
  hiddenCategories: string[];
  onToggle: (category: string) => void;
}) {
  return (
    <div className="text-center max-w-sm mx-auto">
      <div
        className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mx-auto mb-5 animate-bounce-in"
      >
        <Leaf className="w-6 h-6 text-forest" />
      </div>

      <h1
        className="text-3xl font-bold text-jet mb-2 tracking-tight animate-slide-up"
        style={{ animationDelay: '150ms' }}
      >
        Activity preferences
      </h1>
      <p
        className="text-base text-lilac-600 mb-6 leading-relaxed animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        Choose which types of break activities you'd like. You can change these later in Settings.
      </p>

      <div className="space-y-2">
        {ACTIVITY_CATEGORIES.map(({ key, label, Icon }, i) => {
          const included = !hiddenCategories.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left animate-slide-up ${
                included
                  ? 'bg-forest-50 border-forest/30 dark:bg-forest-950/20 dark:border-forest/20'
                  : 'bg-white dark:bg-jet-800 border-powder-200 dark:border-jet-700 opacity-60'
              }`}
              style={{ animationDelay: `${400 + i * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                included ? 'bg-forest-100 dark:bg-forest-900/40' : 'bg-powder-100 dark:bg-jet-700'
              }`}>
                <Icon className={`w-5 h-5 ${included ? 'text-forest' : 'text-lilac-400'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${included ? 'text-jet' : 'text-jet-500'}`}>
                  {label}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                included
                  ? 'bg-forest border-forest'
                  : 'border-powder-300 dark:border-jet-600'
              }`}>
                {included && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeSetting({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-jet dark:text-jet-100">{label}</label>
        <span className="text-sm font-bold text-forest tabular-nums transition-all duration-150">
          {value} {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 flex items-center justify-center shrink-0 text-jet-600 dark:text-jet-300 hover:bg-powder-50 dark:hover:bg-jet-700 hover:border-powder-300 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background: `linear-gradient(to right, #2E6F40 0%, #2E6F40 ${pct}%, #dae1eb ${pct}%, #dae1eb 100%)` }}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-forest
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forest [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-forest [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-2"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 flex items-center justify-center shrink-0 text-jet-600 dark:text-jet-300 hover:bg-powder-50 dark:hover:bg-jet-700 hover:border-powder-300 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepSettings({
  displayName,
  settings,
  onUpdate,
}: {
  displayName: string;
  settings: OnboardingSettings;
  onUpdate: (key: keyof OnboardingSettings, value: number) => void;
}) {
  return (
    <div className="text-center max-w-sm mx-auto">
      <div
        className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mx-auto mb-5 animate-bounce-in"
      >
        <Settings2 className="w-6 h-6 text-forest" />
      </div>

      <h1
        className="text-3xl font-bold text-jet mb-2 tracking-tight animate-slide-up"
        style={{ animationDelay: '150ms' }}
      >
        Set your pace{displayName ? `, ${displayName}` : ''}
      </h1>
      <p
        className="text-base text-lilac-600 mb-6 leading-relaxed animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        Configure your session. You can always change these later in Settings.
      </p>

      <Card
        className="text-left animate-slide-up"
        style={{ animationDelay: '400ms' } as React.CSSProperties}
      >
        <div className="space-y-5">
          <RangeSetting
            label="Focus duration"
            value={settings.work_duration_minutes}
            min={10}
            max={90}
            step={5}
            unit="min"
            onChange={(v) => onUpdate('work_duration_minutes', v)}
          />
          <RangeSetting
            label="Short break"
            value={settings.short_break_minutes}
            min={3}
            max={15}
            step={1}
            unit="min"
            onChange={(v) => onUpdate('short_break_minutes', v)}
          />
          <RangeSetting
            label="Sessions before long break"
            value={settings.sessions_before_long_break}
            min={2}
            max={6}
            step={1}
            unit="sessions"
            onChange={(v) => onUpdate('sessions_before_long_break', v)}
          />
        </div>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { profile, completeOnboarding } = useAuth();
  const { bulkUpdate } = useSettings();
  const navigate = useNavigate();
  const totalSteps = 5;

  const displayName = profile?.display_name ?? '';

  const [localSettings, setLocalSettings] = useState<OnboardingSettings>({
    work_duration_minutes: 25,
    short_break_minutes: 5,
    sessions_before_long_break: 4,
    hidden_categories: [],
  });

  const handleUpdateSetting = (key: keyof OnboardingSettings, value: number) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleCategory = (category: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      hidden_categories: prev.hidden_categories.includes(category)
        ? prev.hidden_categories.filter((c) => c !== category)
        : [...prev.hidden_categories, category],
    }));
  };

  const saveSettings = () => {
    bulkUpdate({
      work_duration_minutes: localSettings.work_duration_minutes,
      short_break_minutes: localSettings.short_break_minutes,
      sessions_before_long_break: localSettings.sessions_before_long_break,
      hidden_categories: localSettings.hidden_categories,
    });
  };

  const handleComplete = async () => {
    saveSettings();
    await completeOnboarding();
    navigate('/timer', { replace: true });
  };

  const handleSkip = async () => {
    saveSettings();
    await completeOnboarding();
    navigate('/timer', { replace: true });
  };

  return (
    <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center px-6 relative">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm text-lilac-600 hover:text-jet font-medium transition-colors"
      >
        Skip
      </button>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center w-full" key={step}>
        {step === 0 && <StepProblem />}
        {step === 1 && <StepSolution />}
        {step === 2 && <StepHowItWorks />}
        {step === 3 && (
          <StepPreferences
            hiddenCategories={localSettings.hidden_categories}
            onToggle={handleToggleCategory}
          />
        )}
        {step === 4 && (
          <StepSettings
            displayName={displayName}
            settings={localSettings}
            onUpdate={handleUpdateSetting}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <div className="w-full max-w-sm pb-10 space-y-6">
        {/* Dot indicator */}
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

        {/* Buttons */}
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
