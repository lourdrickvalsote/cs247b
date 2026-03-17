const REMINDER_KEY = 'brevi_reminder';
const LAST_STUDIED_KEY = 'brevi_last_studied_date';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:MM" 24-hour format
}

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { enabled: false, time: '09:00' };
}

export function setReminderSettings(settings: ReminderSettings) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

export function markStudiedToday() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(LAST_STUDIED_KEY, today);
}

export function hasStudiedToday(): boolean {
  const lastDate = localStorage.getItem(LAST_STUDIED_KEY);
  const today = new Date().toISOString().slice(0, 10);
  return lastDate === today;
}

// Returns true if the current minute matches the reminder time and the user
// hasn't studied today. Call this every minute from a setInterval.
export function shouldFireReminder(): boolean {
  const settings = getReminderSettings();
  if (!settings.enabled) return false;
  if (hasStudiedToday()) return false;
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;

  const now = new Date();
  const [hh, mm] = settings.time.split(':').map(Number);
  return now.getHours() === hh && now.getMinutes() === mm;
}
