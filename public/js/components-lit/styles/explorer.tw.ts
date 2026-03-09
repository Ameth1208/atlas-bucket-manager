/**
 * Explorer Tailwind Classes
 */

export const explorerStyles = {
  // ============================================
  // EXPLORER HEADER
  // ============================================
  header: {
    container:
      "p-5 border-b border-slate-100 dark:border-dark-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 dark:bg-dark-800/50 gap-4",
    leftSection: "flex items-center gap-3",
    backButton:
      "aspect-square w-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700",
    icon: "bg-indigo-500/10 dark:bg-indigo-500/20 aspect-square w-10 flex items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400",
    titleWrapper: "flex flex-col",
    title: "text-lg font-bold text-slate-900 dark:text-white font-mono",
    breadcrumbWrapper:
      "flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono overflow-x-auto whitespace-nowrap",
    breadcrumbRoot: "cursor-pointer hover:text-indigo-500",
    breadcrumbSeparator: "text-slate-300 dark:text-slate-600",
    breadcrumbItem: "cursor-pointer hover:text-rose-500 transition-colors",
  },

  // ============================================
  // EXPLORER TOOLBAR
  // ============================================
  toolbar: {
    container: "flex items-center gap-2 w-full md:w-auto",
    btnFolder:
      "aspect-square w-10 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700",
    btnUpload:
      "flex-grow md:flex-grow-0 bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95",
    btnBulkDelete:
      "text-rose-500 font-bold hover:underline cursor-pointer",
    fileInput: "hidden",
  },

  // ============================================
  // EXPLORER FOOTER
  // ============================================
  footer: {
    container:
      "p-4 border-t border-slate-100 dark:border-dark-800 bg-white dark:bg-dark-900 flex justify-between items-center text-xs text-slate-400",
    leftSection: "flex gap-4",
    fileCount: "",
  },

  // ============================================
  // BACK BUTTON (in file list)
  // ============================================
  backItem: {
    container:
      "flex items-center gap-4 p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl cursor-pointer text-slate-500 mb-1 transition-all group",
    icon: "aspect-square w-10 flex items-center justify-center bg-slate-200/50 dark:bg-dark-700/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all",
    label: "text-sm font-bold font-mono",
  },

  // ============================================
  // EMPTY STATE
  // ============================================
  empty: {
    container:
      "text-center py-20 flex flex-col items-center gap-4 text-slate-400 opacity-60",
    icon: "",
    label: "text-sm font-medium tracking-tight",
  },

  // ============================================
  // LOADING STATE
  // ============================================
  loading: {
    container: "text-center py-16 flex justify-center text-slate-400",
    icon: "",
  },
};
