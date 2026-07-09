import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/services/query-client';
import { ThemeProvider, LanguageProvider } from '@/store';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AppRouter />
          <Toaster position="top-right" />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
