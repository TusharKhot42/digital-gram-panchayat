import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/services/query-client';
import { ThemeProvider, LanguageProvider, AuthProvider } from '@/store';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-right" />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
