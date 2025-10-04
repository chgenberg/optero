import sv from '../locales/sv/common.json';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

export type Locale = 'sv' | 'en' | 'es' | 'fr';

const translations = {
  sv,
  en,
  es,
  fr,
};

export function getTranslations(locale: Locale = 'sv') {
  return translations[locale] || translations.sv;
}

export function getNestedTranslation(obj: any, path: string, params?: Record<string, string>): string {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  // Replace parameters like {profession}, {count}, etc.
  if (typeof result === 'string' && params) {
    return Object.entries(params).reduce((str, [key, value]) => {
      return str.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }, result);
  }
  
  return typeof result === 'string' ? result : path;
}

export const languages = [
  { code: 'sv' as Locale, name: 'Svenska', flag: '🇸🇪' },
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  { code: 'es' as Locale, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
];
