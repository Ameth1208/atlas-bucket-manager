export type Locale = 'en' | 'es' | 'pt';
export const LOCALES: Locale[] = ['en', 'es', 'pt'];
export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_META: Record<Locale, { label: string; flag: string; htmlLang: string }> = {
  en: { label: 'English', flag: '🇺🇸', htmlLang: 'en' },
  es: { label: 'Español', flag: '🇪🇸', htmlLang: 'es' },
  pt: { label: 'Português', flag: '🇧🇷', htmlLang: 'pt' },
};

export interface Dictionary {
  // Card chrome
  cardTitle: string;
  cardSubtitle: string;

  // Progress
  stepWelcome: string;
  stepAccount: string;
  stepDone: string;

  // Welcome step
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDescription: string;
  featBuckets: string;
  featProviders: string;
  featApiKeys: string;
  featUsers: string;
  welcomeCta: string;
  welcomeSkip: string;

  // Account step
  accountTitle: string;
  accountSubtitle: string;
  fieldName: string;
  fieldNamePh: string;
  fieldEmail: string;
  fieldEmailPh: string;
  fieldPassword: string;
  fieldPasswordPh: string;
  fieldConfirm: string;
  fieldConfirmPh: string;
  passwordWeak: string;
  passwordOk: string;
  passwordStrong: string;
  passwordHint: string;
  back: string;
  create: string;
  creating: string;
  required: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordMismatch: string;

  // Done step
  doneTitle: string;
  doneDescription: string;
  tipTitle: string;
  tipDescription: string;
  goDashboard: string;

  // Language switcher
  languageLabel: string;
}
