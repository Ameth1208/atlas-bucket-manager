/**
 * Explorer Header Tailwind Classes — Premium Apple Design
 */

export const explorerStyles = {
  // ============================================
  // EXPLORER HEADER
  // ============================================
  header: {
    container:
      "px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 bg-white dark:bg-[#1c1c1e]",
    leftSection: "flex items-center gap-4",
    backButton:
      "size-9 flex items-center justify-center text-slate-400 dark:text-white/50 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-white/5 rounded-lg border-0 cursor-pointer hover:bg-rose-500/10",
    icon: "size-9 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500",
    titleWrapper: "flex flex-col min-w-0",
    title: "text-[15px] font-semibold text-slate-800 dark:text-white font-mono tracking-tight truncate",
    breadcrumbWrapper:
      "flex items-center gap-1 text-[11px] text-slate-400 dark:text-white/40 font-mono overflow-x-auto whitespace-nowrap max-w-[250px] md:max-w-[400px]",
    breadcrumbRoot: "cursor-pointer hover:text-rose-500 transition-colors",
    breadcrumbSeparator: "text-slate-300 dark:text-white/20",
    breadcrumbItem: "cursor-pointer hover:text-rose-500 transition-colors",
  },

  // ============================================
  // EXPLORER TOOLBAR
  // ============================================
  toolbar: {
    container: "flex items-center gap-2",
    btnFolder:
      "size-9 flex items-center justify-center text-slate-400 dark:text-white/50 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-white/5 rounded-lg border-0 cursor-pointer hover:bg-rose-500/10",
    btnUploadFolder:
      "size-9 flex items-center justify-center text-slate-400 dark:text-white/50 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-white/5 rounded-lg border-0 cursor-pointer hover:bg-rose-500/10",
    btnUpload:
      "flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-0 shadow-lg shadow-rose-500/25",
    btnBulkDelete:
      "flex items-center gap-1.5 text-[12px] text-red-500 font-medium hover:text-red-600 transition-colors cursor-pointer",
    fileInput: "hidden",
  },

  // ============================================
  // EXPLORER FOOTER
  // ============================================
  footer: {
    container:
      "px-5 py-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-[12px] text-slate-500 dark:text-white/45 bg-white dark:bg-[#1c1c1e]",
    leftSection: "flex gap-4",
    fileCount: "",
  },

  // ============================================
  // BACK BUTTON (in file list)
  // ============================================
  backItem: {
    container:
      "flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-lg cursor-pointer text-slate-400 dark:text-white/50 transition-colors group hover:bg-slate-50 dark:hover:bg-white/5",
    icon: "size-9 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 dark:text-white/40 group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-colors",
    label: "text-[13px] font-medium font-mono",
  },

  // ============================================
  // EMPTY STATE
  // ============================================
  empty: {
    container:
      "text-center py-20 flex flex-col items-center gap-3 text-slate-400 dark:text-white/40",
    icon: "size-12 text-slate-200 dark:text-white/15",
    label: "text-[13px] font-light",
  },

  // ============================================
  // LOADING STATE
  // ============================================
  loading: {
    container: "text-center py-16 flex justify-center text-slate-200 dark:text-white/15",
    icon: "",
  },
};
