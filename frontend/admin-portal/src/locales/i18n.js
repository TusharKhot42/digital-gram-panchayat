import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en/common.json';
import mr from './mr/common.json';

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      mr: { common: mr },
    },
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'mr'],
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dgp_admin_language',
      caches: ['localStorage'],
    },
  });

export default i18next;
