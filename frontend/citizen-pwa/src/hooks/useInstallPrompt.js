import { useCallback, useEffect, useState } from 'react';

/**
 * Captures the browser's `beforeinstallprompt` event so the app can offer a custom
 * "Add to Home screen" button at a moment of its choosing. `promptInstall` triggers the
 * native dialog; `installed` flips true once the app is added (or already running
 * standalone), which callers use to hide the prompt.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches,
  );

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault(); // keep the mini-infobar from showing; we drive our own UI
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    void deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    return outcome === 'accepted';
  }, [deferred]);

  return { canInstall: Boolean(deferred) && !installed, installed, promptInstall };
}
