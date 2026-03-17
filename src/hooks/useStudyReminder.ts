import { useEffect, useRef } from 'react';
import { shouldFireReminder } from '../lib/reminders';
import { sendNotification } from '../lib/notifications';

// Fires a "time to study" notification at the user's chosen reminder time
// if they haven't already studied today. Checks every 60 seconds while the
// app is open. Works as a best-effort in-browser reminder.
export function useStudyReminder() {
  const firedThisMinuteRef = useRef(false);

  useEffect(() => {
    const check = () => {
      const currentMinute = `${new Date().getHours()}:${new Date().getMinutes()}`;

      if (firedThisMinuteRef.current) {
        // Reset the flag when we move to the next minute
        const now = new Date();
        if (now.getSeconds() < 5) {
          // We're in a new minute (interval may drift), reset
          firedThisMinuteRef.current = false;
        }
        return;
      }

      if (shouldFireReminder()) {
        sendNotification(
          "Time to study! 📚",
          "Start a focus session with Brevi to keep your streak going.",
        );
        firedThisMinuteRef.current = true;
      }
      void currentMinute; // suppress unused variable
    };

    check();
    const id = setInterval(check, 30_000); // check every 30 seconds
    return () => clearInterval(id);
  }, []);
}
