import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from './ui/Button';
import { useSession } from '../contexts/SessionContext';

const RATINGS = [
  { value: 1, label: 'Drained', selectedBg: 'bg-lilac-400' },
  { value: 2, label: 'Tired', selectedBg: 'bg-lilac-300' },
  { value: 3, label: 'Okay', selectedBg: 'bg-powder-400' },
  { value: 4, label: 'Good', selectedBg: 'bg-forest-300' },
  { value: 5, label: 'Energized', selectedBg: 'bg-forest' },
] as const;

export default function RestorationRating() {
  const { submitRestorationRating, skipRestorationRating } = useSession();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-bounce-in">
          <Sparkles className="w-8 h-8 text-forest" />
        </div>

        <h1
          className="text-2xl font-bold text-jet dark:text-jet-100 mb-1 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          How restored do you feel?
        </h1>
        <p
          className="text-sm text-lilac-600 mb-8 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          Rate how your break went
        </p>

        <div className="flex items-start justify-center gap-3 mb-8">
          {RATINGS.map((r, i) => {
            const isSelected = selected === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setSelected(r.value)}
                className="flex flex-col items-center gap-1.5 animate-scale-in"
                style={{ animationDelay: `${400 + i * 80}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                    isSelected
                      ? `${r.selectedBg} text-white scale-110`
                      : 'border border-powder-200 dark:border-jet-600 text-jet dark:text-jet-200 hover:border-powder-300 dark:hover:border-jet-500'
                  }`}
                >
                  {r.value}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors duration-200 ${
                    isSelected ? 'text-jet dark:text-jet-100' : 'text-lilac-400'
                  }`}
                >
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="space-y-3 animate-slide-up"
          style={{ animationDelay: '800ms' }}
        >
          <Button
            fullWidth
            size="lg"
            disabled={selected === null}
            onClick={() => selected !== null && submitRestorationRating(selected)}
          >
            Continue
          </Button>
          <button
            onClick={skipRestorationRating}
            className="w-full text-xs text-lilac-500 hover:text-jet dark:hover:text-jet-100 font-semibold py-2 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
