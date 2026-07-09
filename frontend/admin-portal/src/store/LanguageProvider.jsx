import { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(undefined);

/** Officer portal is English-primary; Marathi kept available per SRS but not the default. */
export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';

  const value = useMemo(
    () => ({
      language,
      setLanguage: (lang) => {
        void i18n.changeLanguage(lang);
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
