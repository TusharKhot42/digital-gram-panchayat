import { createContext, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@dgp/shared';

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const language = i18n.language || 'mr';

  // Keep <html lang> in step with the active language so assistive tech announces the page in
  // the right language (WCAG 3.1.1). index.html ships a static default; this corrects it at
  // runtime and on every switch.
  useEffect(() => {
    const apply = (lng) => {
      document.documentElement.lang = lng;
    };
    apply(i18n.language);
    i18n.on('languageChanged', apply);
    return () => i18n.off('languageChanged', apply);
  }, [i18n]);

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
