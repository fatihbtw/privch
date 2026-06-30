import { createSignal } from 'solid-js';
import en from './locales/en';
import de from './locales/de';
import es from './locales/es';
import fr from './locales/fr';
import pt from './locales/pt';
import ru from './locales/ru';
import tr from './locales/tr';
import pl from './locales/pl';

export type Locale = 'en' | 'de' | 'es' | 'fr' | 'pt' | 'ru' | 'tr' | 'pl';

const dictionaries: Record<Locale, Record<string, string>> = {
    en,
    de,
    es,
    fr,
    pt,
    ru,
    tr,
    pl,
};

export const LOCALE_KEY = 'privch_locale';

export const LOCALES: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'pt', label: 'Português (BR)' },
    { value: 'ru', label: 'Русский' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'pl', label: 'Polski' },
];

const [locale, setLocaleSignal] = createSignal<Locale>(
    (localStorage.getItem(LOCALE_KEY) as Locale) || 'en'
);

export { locale };

export function setLocale(value: Locale) {
    setLocaleSignal(value);
    localStorage.setItem(LOCALE_KEY, value);
}

export function t(key: string): string {
    return dictionaries[locale()]?.[key] ?? dictionaries.en[key] ?? key;
}
