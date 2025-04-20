import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // Using http backend to load translations

i18n
  // Load translation using http -> see /public/locales
  // Learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // Detect user language
  // Learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  // For all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: process.env.NODE_ENV === 'development', // Enable debug output in development
    fallbackLng: 'en', // Use English if detected language is not available
    supportedLngs: ['en', 'ru', 'de', 'es'], // Supported languages
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    backend: {
      // Path where resources get loaded from
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // Keys or params to lookup language from
      caches: ['localStorage'], // Cache the language preference in localStorage
    },
  });

export default i18n;
