/**
 * Pagination Tailwind Classes
 */

export const paginationStyles = {
  container: "flex items-center justify-between py-3 px-4",
  info: "text-xs text-slate-500 dark:text-slate-400",
  controls: "flex items-center gap-1",
  button:
    "px-3 py-1 rounded-lg text-xs font-medium transition-all border-0 cursor-pointer",
  buttonActive: "bg-rose-600 text-white",
  buttonInactive:
    "bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700",
  buttonDisabled: "opacity-50 cursor-not-allowed",
};
