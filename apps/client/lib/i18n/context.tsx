import { createContext } from 'react';
import { type Dictionary, type Locale, LOCALE_META } from './types';

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  tx: (key: keyof Dictionary, vars?: Record<string, string | number>) => string;
  meta: (typeof LOCALE_META)[Locale];
}

export const I18nContext = createContext<I18nContextValue | null>(null);
