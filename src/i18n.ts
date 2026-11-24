import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enReadingList from './locales/en/readingList.json';
import frReadingList from './locales/fr/readingList.json';
import frCommon from './locales/fr/common.json';
import enCommon from './locales/en/common.json';
import frMuiForm from './locales/fr/muiForm.json';
import enMuiForm from './locales/en/muiForm.json';

// Initialize i18next with the react-i18next plugin and provide translation resources for English and French.
// initReactI18next ? This plugin allows i18next to integrate with React, enabling the use of translation hooks and components.
// connects this instance to React, so useTranslation() can access it.
void i18n.use(initReactI18next).init({
  // Define the translation resources for each supported language.
  // resources maps each language to its namespaces and translation keys.
  resources: {
    // English translations
    en: {
      readingList: enReadingList,
      common: enCommon,
      muiForm: enMuiForm,
    },
    // French translations
    fr: {
      readingList: frReadingList,
      common: frCommon,
      muiForm: frMuiForm,
    },
  },
  lng: 'en', // Set the default language to English
  fallbackLng: 'en', // Fallback language in case the current language translations are not available
  defaultNS: 'readingList', // Set the default namespace for translations
  ns: ['readingList', 'common', 'muiForm'], // Define the available namespaces for translations
  // what is interpolation? Interpolation allows you to insert dynamic values into translation strings.
  interpolation: {
    escapeValue: false, // React already escapes values to prevent XSS
  },
});

export default i18n;
