import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/services/query-client';
import { ThemeProvider, LanguageProvider, AuthProvider } from '@/store';
import { AppRouter } from '@/routes/AppRouter';
import { Splash } from '@/pages/Splash';
import { PwaReloadPrompt } from '@/components/PwaReloadPrompt';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { useOnboarding } from '@/features/onboarding/useOnboarding';

const SPLASH_DURATION_MS = 900;

export default function App() {
  const [booting, setBooting] = useState(true);
  const { open: onboardingOpen, finish: finishOnboarding } = useOnboarding();

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            {booting ? <Splash /> : <AppRouter />}
            {!booting && onboardingOpen && <Onboarding onFinish={finishOnboarding} />}
            <Toaster position="top-center" />
            <PwaReloadPrompt />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
