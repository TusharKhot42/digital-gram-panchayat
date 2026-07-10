import { useCallback, useEffect, useState } from 'react';

const KEY = 'dgp_onboarded';
export const REPLAY_EVENT = 'onboarding:replay';

/**
 * Tracks whether the citizen has seen the onboarding intro. Shown once on first launch;
 * "Replay onboarding" in Settings dispatches REPLAY_EVENT, which reopens the overlay
 * wherever this hook is mounted (the app root).
 */
export function useOnboarding() {
  const [open, setOpen] = useState(() => localStorage.getItem(KEY) !== '1');

  const finish = useCallback(() => {
    localStorage.setItem(KEY, '1');
    setOpen(false);
  }, []);

  useEffect(() => {
    const reopen = () => {
      localStorage.removeItem(KEY);
      setOpen(true);
    };
    window.addEventListener(REPLAY_EVENT, reopen);
    return () => window.removeEventListener(REPLAY_EVENT, reopen);
  }, []);

  return { open, finish };
}

/** Fire from anywhere (e.g. Settings) to replay the onboarding intro. */
export function replayOnboarding() {
  window.dispatchEvent(new CustomEvent(REPLAY_EVENT));
}
