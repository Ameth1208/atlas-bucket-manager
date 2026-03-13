/**
 * i18n Main Export
 * Centralizes all translations and exports helpers
 */

// ============================================
// EXPORTS
// ============================================
export * from './flags';
export * from './types';
export * from './helpers';

// ============================================
// IMPORT ALL TRANSLATIONS
// ============================================
import { commonTranslations } from './translations/common.i18n';
import { copyModalTranslations } from './translations/copy-modal.i18n';
import { deleteModalTranslations } from './translations/delete-modal.i18n';
import { shareModalTranslations } from './translations/share-modal.i18n';
import { folderModalTranslations } from './translations/folder-modal.i18n';
import { previewModalTranslations } from './translations/preview-modal.i18n';
import { explorerTranslations } from './translations/explorer.i18n';

// ============================================
// MERGE ALL TRANSLATIONS BY LANGUAGE
// ============================================
export const translations: Record<string, Record<string, string>> = {
  en: {
    ...commonTranslations.en,
    ...copyModalTranslations.en,
    ...deleteModalTranslations.en,
    ...shareModalTranslations.en,
    ...folderModalTranslations.en,
    ...previewModalTranslations.en,
    ...explorerTranslations.en
  },
  es: {
    ...commonTranslations.es,
    ...copyModalTranslations.es,
    ...deleteModalTranslations.es,
    ...shareModalTranslations.es,
    ...folderModalTranslations.es,
    ...previewModalTranslations.es,
    ...explorerTranslations.es
  },
  pt: {
    ...commonTranslations.pt,
    ...copyModalTranslations.pt,
    ...deleteModalTranslations.pt,
    ...shareModalTranslations.pt,
    ...folderModalTranslations.pt,
    ...previewModalTranslations.pt,
    ...explorerTranslations.pt
  },
  fr: {
    ...commonTranslations.fr,
    ...copyModalTranslations.fr,
    ...deleteModalTranslations.fr,
    ...shareModalTranslations.fr,
    ...folderModalTranslations.fr,
    ...previewModalTranslations.fr,
    ...explorerTranslations.fr
  },
  ja: {
    ...commonTranslations.ja,
    ...copyModalTranslations.ja,
    ...deleteModalTranslations.ja,
    ...shareModalTranslations.ja,
    ...folderModalTranslations.ja,
    ...previewModalTranslations.ja,
    ...explorerTranslations.ja
  },
  zh: {
    ...commonTranslations.zh,
    ...copyModalTranslations.zh,
    ...deleteModalTranslations.zh,
    ...shareModalTranslations.zh,
    ...folderModalTranslations.zh,
    ...previewModalTranslations.zh,
    ...explorerTranslations.zh
  }
};

// ============================================
// GLOBAL EXPOSURE (for Lit components)
// ============================================
if (typeof window !== 'undefined') {
  window.translations = translations;
}
