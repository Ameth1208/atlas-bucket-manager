/**
 * Modal Tailwind Classes
 */

export const modalStyles = {
  // ============================================
  // MODALS
  // ============================================
  modal: {
    overlay:
      "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
    content:
      "bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-dark-800",
    header: "text-xl font-bold text-slate-900 dark:text-white mb-4",
    footer: "flex gap-3 mt-6",
  },

  // ============================================
  // DELETE MODAL
  // ============================================
  deleteModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur",
    content:
      "relative bg-white dark:bg-dark-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-dark-800 p-8 shadow-2xl animate-in",
    iconContainer:
      "w-14 h-14 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 mb-6",
    title: "text-xl font-bold mb-2 text-slate-900 dark:text-white",
    description: "text-sm text-slate-500 dark:text-slate-400 mb-8",
    actions: "flex gap-3",
    btnCancel:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700",
    btnDelete:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-red-600 text-white hover:bg-red-700 active:scale-95",
  },

  // ============================================
  // FOLDER MODAL
  // ============================================
  folderModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur",
    content:
      "relative bg-white dark:bg-dark-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-2xl animate-in",
    iconContainer:
      "w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-500 mb-4",
    title: "text-lg font-bold mb-2 text-slate-900 dark:text-white",
    description: "text-sm text-slate-500 dark:text-slate-400 mb-4",
    inputWrapper: "mb-6",
    actions: "flex gap-3",
    btnCancel:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700",
    btnCreate:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95",
  },

  // ============================================
  // SHARE MODAL
  // ============================================
  shareModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur",
    content:
      "relative bg-white dark:bg-dark-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-2xl animate-in",
    iconContainer:
      "w-12 h-12 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 mb-4",
    title: "text-lg font-bold mb-2 text-slate-900 dark:text-white",
    description: "text-sm text-slate-500 dark:text-slate-400 mb-4",
    expiryWrapper: "mb-4",
    expiryLabel: "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2",
    urlWrapper: "mb-6",
    urlLabel: "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2",
    urlInput:
      "w-full px-3 py-2 bg-slate-100 dark:bg-dark-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono border-0 outline-none",
    actions: "flex gap-3",
    btnClose:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700",
    btnCopy:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-rose-600 text-white hover:bg-rose-700 active:scale-95 flex items-center justify-center gap-2",
  },

  // ============================================
  // PREVIEW MODAL
  // ============================================
  previewModal: {
    backdrop:
      "fixed inset-0 z-60 bg-black/90 backdrop-blur flex items-center justify-center p-4",
    content:
      "relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center",
    header:
      "w-full flex justify-end mb-4 gap-4",
    fileName:
      "text-white/70 text-sm mt-4 font-mono",
    actions: "flex gap-2",
    btnAction:
      "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors",
    body: "flex-1 flex items-center justify-center overflow-auto",
    image:
      "max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-in",
    video:
      "max-w-full max-h-[75vh] rounded-lg shadow-2xl",
    audio:
      "w-full h-12",
    pdf:
      "w-full h-[75vh] rounded-lg border-0 shadow-2xl bg-white",
    previewContainer:
      "rounded-xl overflow-hidden flex items-center justify-center w-full h-full",
    placeholder:
      "flex flex-col items-center gap-6 p-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-in",
    iconContainer:
      "p-6 rounded-full",
    iconContainerAudio:
      "p-6 rounded-full bg-cyan-500/20 text-cyan-300",
    iconContainerAndroid:
      "p-6 rounded-full bg-green-500/20 text-green-400",
    iconContainerDefault:
      "p-6 rounded-full bg-slate-500/20 text-slate-300",
    placeholderText:
      "text-white/50 text-sm font-medium",
    placeholderTitle:
      "text-white text-xl font-bold",
    footer:
      "flex items-center justify-between mt-4 pt-4 border-t border-slate-700",
    fileInfo: "text-sm text-slate-400",
    btnDownload:
      "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-white/10 text-white hover:text-indigo-400",
    btnClose:
      "flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-white/10 text-white hover:text-rose-500",
    loading:
      "text-white/50",
  },
};
