/**
 * Base Tailwind Classes - Form inputs, labels, buttons
 * Premium Apple-inspired design system
 */

export const baseStyles = {
  // ============================================
  // FORM INPUTS
  // ============================================
  input: {
    base: "w-full px-4 py-3 bg-white dark:bg-dark-800 border border-border-light dark:border-dark-600 rounded-2xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all dark:text-white text-sm font-medium placeholder:text-text-tertiary dark:placeholder:text-text-darkTertiary",
    withIcon:
      "w-full px-4 py-3 pl-12 bg-white dark:bg-dark-800 border border-border-light dark:border-dark-600 rounded-2xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all dark:text-white text-sm font-medium placeholder:text-text-tertiary dark:placeholder:text-text-darkTertiary",
    error:
      "w-full px-4 py-3 bg-white dark:bg-dark-800 border-2 border-red-500 rounded-2xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm font-medium dark:text-white",
  },

  // ============================================
  // FORM CONTROLS (select, textarea, etc)
  // ============================================
  formControl:
    "w-full px-3 py-2.5 bg-white dark:bg-dark-800 border border-border-light dark:border-dark-600 rounded-xl text-sm text-text-primary dark:text-text-darkPrimary focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all font-medium",

  // ============================================
  // LABELS
  // ============================================
  label: {
    base: "block text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-darkSecondary mb-2 ml-1",
    required:
      'block text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary dark:text-text-darkSecondary mb-2 ml-1 after:content-["*"] after:text-red-500 after:ml-1',
  },

  // ============================================
  // BUTTONS
  // ============================================
  button: {
    primary:
      "w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2",
    secondary:
      "px-4 py-2.5 bg-surface-raised dark:bg-dark-700 hover:bg-border-light dark:hover:bg-dark-600 text-text-primary dark:text-text-darkPrimary font-semibold rounded-xl transition-all",
    ghost:
      "px-4 py-2 hover:bg-surface-raised dark:hover:bg-dark-800 text-text-secondary dark:text-text-darkSecondary rounded-xl transition-all",
    icon: "p-2 hover:bg-surface-raised dark:hover:bg-dark-800 rounded-xl transition-colors",
    disabled: "opacity-50 cursor-not-allowed",
  },
};
