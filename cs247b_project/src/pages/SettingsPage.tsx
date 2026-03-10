import { useState, useEffect } from 'react';
import { LogOut, Minus, Plus, Sun, Moon, Monitor } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../contexts/ThemeContext';
import { requestNotificationPermission } from '../lib/notifications';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { settings, loading, updateSetting, lastSaved } = useSettings();
  const { theme, setTheme } = useTheme();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved === null) return;
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [lastSaved]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        <div className="h-7 w-32 skeleton rounded-lg mb-2" />
        <div className="h-4 w-56 skeleton rounded-lg mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-3 w-16 skeleton rounded mb-3" />
            <div className="h-40 skeleton rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-jet">Settings</h1>
        {showSaved && (
          <span className="text-xs font-semibold text-forest animate-fade-in">Saved</span>
        )}
      </div>
      <p className="text-sm text-lilac-600 mb-6">Customize your study sessions.</p>

      <section className="mb-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <h2 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
          Timer
        </h2>
        <Card>
          <div className="space-y-5">
            <RangeSetting
              label="Work duration"
              value={settings.work_duration_minutes}
              min={10}
              max={90}
              step={5}
              unit="min"
              onChange={(v) => updateSetting('work_duration_minutes', v)}
            />
            <RangeSetting
              label="Short break"
              value={settings.short_break_minutes}
              min={3}
              max={15}
              step={1}
              unit="min"
              onChange={(v) => updateSetting('short_break_minutes', v)}
            />
            <RangeSetting
              label="Long break"
              value={settings.long_break_minutes}
              min={10}
              max={30}
              step={5}
              unit="min"
              onChange={(v) => updateSetting('long_break_minutes', v)}
            />
            <RangeSetting
              label="Long break every"
              value={settings.sessions_before_long_break}
              min={2}
              max={6}
              step={1}
              unit="sessions"
              description="Take a longer break after this many focus sessions"
              onChange={(v) => updateSetting('sessions_before_long_break', v)}
            />
          </div>
        </Card>
      </section>

      <section className="mb-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <h2 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
          Automation
        </h2>
        <Card>
          <div className="space-y-4">
            <ToggleSetting
              label="Auto-start breaks"
              description="Automatically begin break when work timer ends"
              value={settings.auto_start_breaks}
              onChange={(v) => updateSetting('auto_start_breaks', v)}
            />
            <div className="border-t border-powder-100 dark:border-jet-700" />
            <ToggleSetting
              label="Auto-start work"
              description="Automatically begin next work session after break"
              value={settings.auto_start_work}
              onChange={(v) => updateSetting('auto_start_work', v)}
            />
          </div>
        </Card>
      </section>

      <section className="mb-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
        <h2 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
          Notifications
        </h2>
        <Card>
          <div className="space-y-4">
            <ToggleSetting
              label="Sound alerts"
              description="Play a chime when timers complete"
              value={settings.sound_enabled}
              onChange={(v) => updateSetting('sound_enabled', v)}
            />
            <div className="border-t border-powder-100 dark:border-jet-700" />
            <ToggleSetting
              label="Browser notifications"
              description="Get notified even when the tab is in the background"
              value={settings.notification_enabled}
              onChange={async (v) => {
                if (v) {
                  const granted = await requestNotificationPermission();
                  if (!granted) return;
                }
                updateSetting('notification_enabled', v);
              }}
            />
          </div>
        </Card>
      </section>

      <section className="mb-6 animate-slide-up" style={{ animationDelay: '240ms' }}>
        <h2 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
          Appearance
        </h2>
        <Card>
          <div>
            <p className="text-sm font-medium text-jet dark:text-jet-100 mb-3">Theme</p>
            <div className="flex gap-2">
              {([
                { value: 'light' as const, label: 'Light', icon: Sun },
                { value: 'dark' as const, label: 'Dark', icon: Moon },
                { value: 'system' as const, label: 'System', icon: Monitor },
              ]).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    theme === value
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-white dark:bg-jet-800 text-jet-600 dark:text-jet-300 border border-powder-200 dark:border-jet-700 hover:bg-powder-50 dark:hover:bg-jet-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '320ms' }}>
        <h2 className="text-xs font-semibold text-lilac uppercase tracking-wider mb-3">
          Account
        </h2>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-jet">{user?.email}</p>
              <p className="text-xs text-lilac-500 mt-0.5">Signed in</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setConfirmSignOut(true)}>
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out?"
        message="You'll need to sign back in to continue your study sessions."
        confirmLabel="Sign Out"
        variant="danger"
        onConfirm={() => { setConfirmSignOut(false); signOut(); }}
        onCancel={() => setConfirmSignOut(false)}
      />
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
  description,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-jet dark:text-jet-100">{label}</label>
        <span className="text-sm font-bold text-forest tabular-nums transition-all duration-150">
          {value}{unit && ` ${unit}`}
        </span>
      </div>
      {description && (
        <p className="text-xs text-lilac-500 mb-2">{description}</p>
      )}
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

function ToggleSetting({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-jet dark:text-jet-100">{label}</p>
        <p className="text-xs text-lilac-500 dark:text-lilac-400 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0
          ${value ? 'bg-forest' : 'bg-powder-300 dark:bg-jet-600'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
            transition-transform duration-300
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </button>
    </div>
  );
}
