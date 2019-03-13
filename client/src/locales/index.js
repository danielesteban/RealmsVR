import diff from 'deep-diff';
import { recursive as merge } from 'merge';
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';
import en from './en';
import es from './es';

const locales = {
  en,
  es,
};
const availableLocales = Object.keys(locales);
const defaultLocale = 'en';

// Populate locales with default literals
const translations = {};
availableLocales.forEach((locale) => {
  translations[locale] = merge(true, locales[defaultLocale], locales[locale]);
});

// Translations loader handler (for hot-reloading)
export const load = (store) => {
  store.dispatch(loadTranslations(translations));
};

export default (store) => {
  // Locale Autodetection
  const storedLocale = localStorage.getItem('REALMSVR::LOCALE');
  const browserLocale = (
    (window.navigator.languages ? window.navigator.languages[0] : null)
    || window.navigator.language
    || window.navigator.browserLanguage
    || window.navigator.userLanguage
    || defaultLocale
  ).substr(0, 2).toLowerCase();

  let locale = defaultLocale;
  if (~availableLocales.indexOf(storedLocale)) locale = storedLocale;
  else if (~availableLocales.indexOf(browserLocale)) locale = browserLocale;

  // Setup react-i18nify
  syncTranslationWithStore(store);
  load(store);
  store.dispatch(setLocale(locale));

  if (!__PRODUCTION__) {
    // Warn about missing translations
    const missing = availableLocales
      .reduce((missing, locale) => {
        if (locale === defaultLocale) {
          return missing;
        }
        const keys = diff(locales[defaultLocale], locales[locale])
          .reduce((missing, { kind, path }) => {
            if (kind === 'E') {
              return missing;
            }
            return [
              ...missing,
              path.join('.'),
            ];
          }, []);
        if (!keys.length) {
          return missing;
        }
        return [
          ...missing,
          `\nMissing translations for "${locale.toUpperCase()}" locale:`,
          ...keys,
        ];
      }, []);
    if (missing.length) {
      console.warn(missing.join('\n'));
    }
  }
};
