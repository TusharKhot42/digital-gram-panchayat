import { createContext, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(undefined);

/** Officer portal is English-primary; Marathi kept available per SRS but not the default. */
export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const rawLang = i18n.resolvedLanguage || i18n.language || 'en';
  const language = rawLang.toLowerCase().startsWith('mr') ? 'mr' : 'en';

  // Keep <html lang> in step with the active language for assistive tech (WCAG 3.1.1).
  useEffect(() => {
    const apply = (lng) => {
      document.documentElement.lang = (lng || '').toLowerCase().startsWith('mr') ? 'mr' : 'en';
    };
    apply(i18n.language);
    i18n.on('languageChanged', apply);
    return () => i18n.off('languageChanged', apply);
  }, [i18n]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (lang) => {
        const next = String(lang).toLowerCase().startsWith('mr') ? 'mr' : 'en';
        void i18n.changeLanguage(next);
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
