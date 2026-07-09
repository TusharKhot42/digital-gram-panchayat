import { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@dgp/shared';

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const language = i18n.language || 'mr';

  const value = useMemo(
    () => ({
      language,
      setLanguage: (lang) => {
        void i18n.changeLanguage(lang);
      },
      toggleLanguage: () => {
        const next = language === 'mr' ? 'en' : 'mr';
        void i18n.changeLanguage(next);
      },
    }),
    [language, i18n],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export const availableLanguages = SUPPORTED_LANGUAGES;
