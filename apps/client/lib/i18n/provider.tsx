'use client';

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
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

let currentLocale: Locale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* ignore */
  }
  const nav = window.navigator?.language?.toLowerCase() ?? '';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Locale {
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    currentLocale = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = LOCALE_META[next].htmlLang;
    }
    listeners.forEach((l) => l());
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
