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
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import { useAuth } from '../contexts/AuthContext';

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
        Your defaults: 25 min focus, 5 min break, 4 rounds. You can adjust these anytime in Settings.
      </p>

      <div
        className="flex justify-center gap-3 animate-slide-up"
        style={{ animationDelay: '600ms' }}
      >
        {[
          { label: '25 min', sub: 'Focus' },
          { label: '5 min', sub: 'Break' },
          { label: '4x', sub: 'Rounds' },
        ].map(({ label, sub }) => (
          <div
            key={sub}
            className="px-4 py-2 rounded-xl bg-forest-50 text-center"
          >
            <p className="text-sm font-bold text-forest">{label}</p>
            <p className="text-xs text-forest-700">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { profile, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 4;

  const displayName = profile?.display_name ?? '';

  const handleComplete = async () => {
    await completeOnboarding();
    navigate('/timer', { replace: true });
  };

  const handleSkip = () => {
    handleComplete();
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
        {step === 3 && <StepReady displayName={displayName} />}
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
