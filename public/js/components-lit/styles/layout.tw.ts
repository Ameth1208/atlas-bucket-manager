/**
 * Layout Tailwind Classes - Containers, cards, spacing
 * Premium Apple-inspired design system
 */

export const layoutStyles = {
  // ============================================
  // CONTAINERS / CARDS
  // ============================================
  card: {
    base: "bg-white dark:bg-dark-800 p-6 rounded-2xl border border-border-light dark:border-dark-600 transition-all hover:border-accent/30",
    compact:
      "bg-white dark:bg-dark-800 p-4 rounded-xl border border-border-light dark:border-dark-600 transition-all",
    elevated:
      "bg-white dark:bg-dark-800 p-6 rounded-2xl border border-border-light dark:border-dark-600 shadow-xl shadow-black/5 dark:shadow-black/20",
  },

  // ============================================
  // ALERTS / MESSAGES
  // ============================================
  alert: {
    error:
      "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-900/30",
    success:
      "flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-900/30",
    warning:
      "flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-xl border border-amber-100 dark:border-amber-900/30",
    info: "flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-100 dark:border-blue-900/30",
  },

  // ============================================
  // SPACING UTILITIES
  // ============================================
  spacing: {
    stack2: "space-y-2",
    stack3: "space-y-3",
    stack4: "space-y-4",
    stack5: "space-y-5",
    stack6: "space-y-6",
    row2: "space-x-2",
    row3: "space-x-3",
    row4: "space-x-4",
  },

  // ============================================
  // TEXT UTILITIES
  // ============================================
  text: {
    heading1: "text-2xl font-bold text-text-primary dark:text-text-darkPrimary",
    heading2: "text-xl font-bold text-text-primary dark:text-text-darkPrimary",
    heading3: "text-lg font-semibold text-text-primary dark:text-text-darkPrimary",
    body: "text-sm text-text-primary dark:text-text-darkPrimary",
    bodySmall: "text-xs text-text-secondary dark:text-text-darkSecondary",
    muted: "text-sm text-text-tertiary dark:text-text-darkTertiary",
    error: "text-sm text-red-600 dark:text-red-400",
    success: "text-sm text-emerald-600 dark:text-emerald-400",
  },

  // ============================================
  // LAYOUT UTILITIES
  // ============================================
  layout: {
    container: "max-w-7xl mx-auto px-4",
    containerSm: "max-w-2xl mx-auto px-4",
    containerXs: "max-w-md mx-auto px-4",
    flexCenter: "flex items-center justify-center",
    flexBetween: "flex items-center justify-between",
    flexCol: "flex flex-col",
    grid2: "grid grid-cols-1 md:grid-cols-2 gap-4",
    grid3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  },
};
