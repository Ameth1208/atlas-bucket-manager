'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import { pt } from './dictionaries/pt';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  type Dictionary,
  type Locale,
} from './types';
import { I18nContext, type I18nContextValue } from './context';

const STORAGE_KEY = 'atlas.locale';
const DICTIONARIES: Record<Locale, Dictionary> = { en, es, pt };

function isValidLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR + first client render: always default locale (no hydration mismatch).
  // The first time the user interacts with <LanguageSwitcher>, the stored
  // preference (or browser preference) is applied. We keep the <html lang>
  // attribute in sync via a one-time effect that doesn't touch React state.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    if (typeof document !== 'undefined') {
      document.documentElement.lang = LOCALE_META[stored].htmlLang;
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!isValidLocale(next)) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = LOCALE_META[next].htmlLang;
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: DICTIONARIES[locale],
      tx: (key, vars) => interpolate(DICTIONARIES[locale][key], vars ?? {}),
      meta: LOCALE_META[locale],
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
