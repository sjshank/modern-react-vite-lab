import 'i18next';
// Import English translation JSON files for type definitions
// Use English as the key source of truth.
import enReadingList from '../locales/en/readingList.json';
// Import other English translation JSON files as needed for type definitions
import enCommon from '../locales/en/common.json';
import enMuiForm from '../locales/en/muiForm.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'readingList';
    fallbackLng: 'en';
    resources: {
      readingList: typeof enReadingList;
      common: typeof enCommon;
      muiForm: typeof enMuiForm;
    };
  }
}
