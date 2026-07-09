import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/services/query-client';
import { ThemeProvider, LanguageProvider } from '@/store';
import { AppRouter } from '@/routes/AppRouter';
import { Splash } from '@/pages/Splash';

const SPLASH_DURATION_MS = 900;

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          {booting ? <Splash /> : <AppRouter />}
          <Toaster position="top-center" />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
