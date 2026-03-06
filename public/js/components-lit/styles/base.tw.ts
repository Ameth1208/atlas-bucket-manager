/**
 * Base Tailwind Classes - Form inputs, labels, buttons
 */

export const baseStyles = {
  // ============================================
  // FORM INPUTS
  // ============================================
  input: {
    base: "w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none transition-all dark:text-white text-sm font-medium",
    withIcon:
      "w-full px-4 py-3 pl-12 bg-slate-50 dark:bg-dark-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none transition-all dark:text-white text-sm font-medium",
    error:
      "w-full px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-500 rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm font-medium",
  },

  // ============================================
  // LABELS
  // ============================================
  label: {
    base: "block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 ml-1",
    required:
      'block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 ml-1 after:content-["*"] after:text-rose-500 after:ml-1',
  },

  // ============================================
  // BUTTONS
  // ============================================
  button: {
    primary:
      "w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2",
    secondary:
      "px-4 py-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all",
    ghost:
      "px-4 py-2 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 rounded-lg transition-all",
    icon: "p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors",
    disabled: "opacity-50 cursor-not-allowed",
  },
};
