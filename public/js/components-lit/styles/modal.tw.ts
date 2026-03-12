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
    expiryLabel:
      "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2",
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
  // COPY BUCKET MODAL
  // ============================================
  copyModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur",
    content:
      "relative bg-white dark:bg-dark-900 w-full max-w-lg rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-2xl animate-in",
    iconContainer:
      "w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 mb-4",
    title: "text-lg font-bold mb-2 text-slate-900 dark:text-white",
    description: "text-sm text-slate-500 dark:text-slate-400 mb-6",
    
    // Source section
    sourceSection: "mb-6 p-4 bg-slate-50 dark:bg-dark-800 rounded-lg border border-slate-200 dark:border-dark-700",
    sectionLabel: "text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide",
    sourceBucket: "flex items-center gap-3",
    bucketIcon: "w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center",
    bucketInfo: "flex-1",
    bucketName: "font-bold text-slate-900 dark:text-white",
    bucketMeta: "text-xs text-slate-500 dark:text-slate-400",
    
    // Arrow divider
    arrowDivider: "flex justify-center my-4",
    arrowIcon: "w-8 h-8 text-slate-400 dark:text-slate-500",
    
    // Target section
    targetSection: "space-y-4 mb-6",
    formGroup: "space-y-2",
    label: "block text-sm font-bold text-slate-700 dark:text-slate-300",
    select: "w-full px-3 py-2.5 bg-white dark:bg-dark-800 border border-slate-300 dark:border-dark-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
    input: "w-full px-3 py-2.5 bg-white dark:bg-dark-800 border border-slate-300 dark:border-dark-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400",
    
    // Options
    optionsSection: "space-y-3 p-4 bg-slate-50 dark:bg-dark-800 rounded-lg border border-slate-200 dark:border-dark-700 mb-6",
    optionItem: "flex items-center justify-between",
    optionLabel: "text-sm text-slate-700 dark:text-slate-300",
    optionDescription: "text-xs text-slate-500 dark:text-slate-400",
    checkbox: "w-4 h-4 text-blue-600 bg-white dark:bg-dark-700 border-slate-300 dark:border-dark-600 rounded focus:ring-2 focus:ring-blue-500",
    
    // Actions
    actions: "flex gap-3",
    btnCancel:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700",
    btnCopy:
      "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-blue-600 text-white hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-2",
  },

  // ============================================
  // COPY PROGRESS PANEL
  // ============================================
  copyProgress: {
    // Panel container (floating bottom-right)
    panel: "fixed bottom-6 right-6 w-96 bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800 shadow-2xl z-40 animate-in",
    
    // Header
    header: "flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-800",
    headerLeft: "flex items-center gap-3",
    headerIcon: "w-10 h-10 rounded-lg flex items-center justify-center",
    headerIconRunning: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 animate-pulse",
    headerIconCompleted: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500",
    headerIconFailed: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500",
    headerIconCancelled: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500",
    headerTitle: "font-bold text-slate-900 dark:text-white",
    headerSubtitle: "text-xs text-slate-500 dark:text-slate-400",
    headerActions: "flex gap-2",
    btnHeaderAction: "p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors",
    
    // Body
    body: "p-4 space-y-4 max-h-96 overflow-y-auto",
    
    // Job item (for multiple jobs)
    jobItem: "p-3 rounded-lg bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 space-y-3",
    jobHeader: "flex items-center justify-between",
    jobTitle: "font-medium text-sm text-slate-900 dark:text-white",
    jobBadge: "px-2 py-0.5 rounded text-xs font-bold",
    jobBadgeRunning: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500",
    jobBadgeCompleted: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500",
    jobBadgeFailed: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500",
    jobBadgeCancelled: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500",
    
    // Progress bar
    progressWrapper: "space-y-2",
    progressBar: "h-2 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden",
    progressFill: "h-full transition-all duration-300 rounded-full",
    progressFillRunning: "bg-gradient-to-r from-blue-500 to-blue-600",
    progressFillCompleted: "bg-gradient-to-r from-green-500 to-green-600",
    progressFillFailed: "bg-gradient-to-r from-red-500 to-red-600",
    progressStats: "flex justify-between text-xs",
    progressLabel: "text-slate-600 dark:text-slate-400 font-medium",
    progressPercent: "text-slate-900 dark:text-white font-bold",
    
    // Stats grid
    statsGrid: "grid grid-cols-2 gap-2 text-xs",
    statItem: "flex justify-between",
    statLabel: "text-slate-500 dark:text-slate-400",
    statValue: "font-mono text-slate-900 dark:text-white",
    
    // Current file
    currentFile: "text-xs text-slate-500 dark:text-slate-400 truncate",
    currentFileLabel: "font-bold",
    
    // Speed & ETA
    speedEta: "flex items-center gap-4 text-xs",
    speedEtaItem: "flex items-center gap-1.5",
    speedEtaIcon: "text-slate-400",
    speedEtaValue: "font-mono text-slate-900 dark:text-white",
    
    // Errors section
    errorsSection: "mt-3 pt-3 border-t border-slate-200 dark:border-dark-700",
    errorsTitle: "text-xs font-bold text-red-600 dark:text-red-500 mb-2",
    errorsList: "space-y-1 max-h-24 overflow-y-auto",
    errorItem: "text-xs text-slate-600 dark:text-slate-400 font-mono truncate",
    
    // Actions
    actions: "flex gap-2",
    btnCancel: "flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer border-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50",
    btnDismiss: "flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer border-0 bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700",
    
    // Empty state
    emptyState: "p-8 text-center",
    emptyIcon: "w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600",
    emptyText: "text-sm text-slate-500 dark:text-slate-400",
  },

  // ============================================
  // PREVIEW MODAL
  // ============================================
  previewModal: {
    backdrop:
      "fixed inset-0 z-[9999] bg-black/90 backdrop-blur flex items-center justify-center p-4",
    content:
      "relative max-w-4xl w-full flex flex-col items-center",
    header: "w-full flex justify-between items-center mb-4 gap-4",
    headerActions: "flex gap-2",
    fileName: "text-white/70 text-sm mt-4 font-mono",

    // Image controls toolbar
    imageToolbar:
      "flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20",
    btnControl:
      "w-8 h-8 aspect-square p-2 flex item-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-0 active:scale-95",
    zoomLevel:
      "px-3 py-1 text-white/70 text-sm font-mono min-w-[3.5rem] text-center",

    // Image container
    imageContainer:
      "relative overflow-hidden cursor-move flex items-center justify-center w-full h-full select-none",
    image: "max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl",

    // Other media
    actions: "flex gap-2",
    btnAction:
      "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors",
    body: "flex-1 flex items-center justify-center overflow-auto",
    video: "max-w-full max-h-[75vh] rounded-lg shadow-2xl",
    audio: "w-full h-12",
    pdf: "w-full h-[75vh] rounded-lg border-0 shadow-2xl bg-white",
    previewContainer:
      "rounded-xl flex items-center justify-center w-full",
    placeholder:
      "flex flex-col items-center gap-6 p-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-in",

    // Icons
    iconContainer: "p-6 rounded-full",
    iconContainerAudio: "p-6 rounded-full bg-cyan-500/20 text-cyan-300",
    iconContainerAndroid: "p-6 rounded-full bg-green-500/20 text-green-400",
    iconContainerDefault: "p-6 rounded-full bg-slate-500/20 text-slate-300",
    placeholderText: "text-white/50 text-sm font-medium",
    placeholderTitle: "text-white text-xl font-bold",

    // Actions
    footer:
      "flex items-center justify-between mt-4 pt-4 border-t border-slate-700",
    fileInfo: "text-sm text-slate-400",
    btnDownload:
      "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-white/10 text-white hover:text-indigo-400",
    btnClose:
      "flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-white/10 text-white hover:text-rose-500",
    loading: "text-white/50",
  },
};
