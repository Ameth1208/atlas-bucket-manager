/**
 * Modal Tailwind Classes
 * Premium Apple-inspired design system
 */

export const modalStyles = {
  // ============================================
  // MODALS
  // ============================================
  modal: {
    overlay:
      "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto z-50 p-4",
    content:
      "bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 my-auto",
    header: "text-xl font-semibold text-slate-800 dark:text-white mb-4",
    footer: "flex gap-3 mt-6",
  },

  // ============================================
  // DELETE MODAL
  // ============================================
  deleteModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm",
    content:
      "relative bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-2xl animate-in my-auto",
    iconContainer:
      "w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 mb-6",
    title: "text-xl font-semibold mb-2 text-slate-800 dark:text-white",
    description: "text-sm text-slate-500 dark:text-white/50 mb-8",
    actions: "flex gap-3",
    btnCancel:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10",
    btnDelete:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-red-500 text-white hover:bg-red-600",
  },

  // ============================================
  // FOLDER MODAL
  // ============================================
  folderModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm",
    content:
      "relative bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-in my-auto",
    iconContainer:
      "w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 mb-4",
    title: "text-lg font-semibold mb-2 text-slate-800 dark:text-white",
    description: "text-sm text-slate-500 dark:text-white/50 mb-4",
    inputWrapper: "mb-5",
    actions: "flex gap-3",
    btnCancel:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10",
    btnCreate:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-rose-500 text-white hover:bg-rose-600",
  },

  // ============================================
  // SHARE MODAL
  // ============================================
  shareModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm",
    content:
      "relative bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-in my-auto",
    iconContainer:
      "w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 mb-4",
    title: "text-lg font-semibold mb-2 text-slate-800 dark:text-white",
    description: "text-sm text-slate-500 dark:text-white/50 mb-4",
    expiryWrapper: "mb-4",
    expiryLabel:
      "block text-xs font-medium text-slate-500 dark:text-white/40 mb-2",
    urlWrapper: "mb-5",
    urlLabel: "block text-xs font-medium text-slate-500 dark:text-white/40 mb-2",
    urlInput:
      "w-full px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-lg text-sm text-slate-700 dark:text-white font-mono border-0 outline-none",
    actions: "flex gap-3",
    btnClose:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10",
    btnCopy:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center gap-2",
  },

  // ============================================
  // COPY BUCKET MODAL
  // ============================================
  copyModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm",
    content:
      "relative bg-white dark:bg-[#1c1c1e] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-2xl animate-in my-auto",
    iconContainer:
      "w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 mb-5",
    title: "text-xl font-semibold mb-3 text-slate-800 dark:text-white",
    description: "text-base text-slate-500 dark:text-white/50 mb-6",
    
    // Source section
    sourceSection: "mb-6 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10",
    sectionLabel: "text-sm font-medium text-slate-500 dark:text-white/40 mb-4 uppercase tracking-wide",
    sourceBucket: "flex items-center gap-4",
    bucketIcon: "w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center",
    bucketInfo: "flex-1 min-w-0",
    bucketName: "font-semibold text-base text-slate-800 dark:text-white",
    bucketMeta: "text-sm text-slate-500 dark:text-white/40 mt-1",
    arrowIcon: "w-10 h-10 text-slate-300 dark:text-white/20 my-4",
    arrowDivider: "flex justify-center py-2",
    
    // Destination section
    destSection: "mb-6 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10",
    formGroup: "mb-5 last:mb-0",
    targetSection: "mb-6 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10",
    targetLabel: "text-sm font-medium text-slate-500 dark:text-white/40 mb-3 uppercase tracking-wide",
    targetProviderLabel: "text-sm font-medium text-slate-700 dark:text-white mb-2 block",
    targetBucketLabel: "text-sm font-medium text-slate-700 dark:text-white mb-2 block",
    
    // Options
    label: "block text-sm font-medium text-slate-700 dark:text-white mb-2",
    select: "w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-base appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
    input: "w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-slate-400 text-base",
    optionsSection: "space-y-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-6",
    option: "flex items-center gap-3",
    optionItem: "flex items-start justify-between gap-4 py-2",
    optionLabel: "text-base text-slate-700 dark:text-white font-medium",
    optionDescription: "text-sm text-slate-500 dark:text-white/40 mt-1",
    checkbox: "w-5 h-5 rounded text-rose-500 cursor-pointer accent-rose-500 mt-1",
    bucketSearchPlaceholder: "Buscar o crear bucket...",
    willCreateNew: "text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1",
    
    actions: "flex gap-4 pt-2",
    btnCancel:
      "flex-1 px-5 py-3 rounded-xl font-medium text-base transition-all cursor-pointer border-0 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10",
    btnCopy:
      "flex-1 px-5 py-3 rounded-xl font-medium text-base transition-all cursor-pointer border-0 bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center gap-2",
  },

  // ============================================
  // PREVIEW MODAL
  // ============================================
  previewModal: {
    backdrop:
      "fixed inset-0 z-50 flex items-center justify-center bg-black/80",
    content:
      "relative bg-black w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col",
    header: "flex items-center justify-between p-4 border-b border-white/10",
    headerActions: "flex items-center gap-2",
    btnDownload: "flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors cursor-pointer",
    btnClose: "size-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer",
    previewContainer: "flex-1 overflow-auto flex items-center justify-center p-4",
    fileName: "absolute bottom-4 left-4 right-4 text-center text-white/80 text-sm font-medium truncate bg-black/50 py-2 rounded-lg",
    mediaContainer: "w-full h-full flex items-center justify-center overflow-auto",
    mediaContent: "max-w-full max-h-full object-contain",
    fileInfo: "hidden",
    navBtn: "absolute top-1/2 -translate-y-1/2 size-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer",
    prevBtn: "left-4",
    nextBtn: "right-4",
    // Image Viewer
    imageToolbar: "flex items-center justify-center gap-2 p-2 bg-black/50 rounded-lg",
    btnControl: "size-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer",
    zoomLevel: "text-white/70 text-xs font-mono w-12 text-center",
    imageContainer: "flex items-center justify-center overflow-auto bg-black/50 rounded-lg",
    image: "max-w-full max-h-full object-contain",
    placeholder: "flex items-center justify-center w-full h-full text-white/30",
    loading: "animate-spin",
  },

  // ============================================
  // CONFIRM DIALOG
  // ============================================
  confirmDialog: {
    backdrop:
      "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm",
    content:
      "relative bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-in my-auto",
    iconContainer:
      "w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-500/10 text-amber-500 mb-4",
    title: "text-lg font-semibold mb-2 text-slate-800 dark:text-white",
    description: "text-sm text-slate-500 dark:text-white/50 mb-5",
    actions: "flex gap-3",
    btnCancel:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10",
    btnConfirm:
      "flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-0 bg-rose-500 text-white hover:bg-rose-600",
  },

  // ============================================
  // COPY/UPLOAD PROGRESS PANEL
  // ============================================
  copyProgress: {
    panel:
      "fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden",
    header: "flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10",
    headerLeft: "flex items-center gap-3",
    headerIcon: "w-10 h-10 rounded-xl flex items-center justify-center",
    headerIconRunning: "bg-rose-500/10 text-rose-500",
    headerIconCompleted: "bg-green-500/10 text-green-500",
    headerIconFailed: "bg-red-500/10 text-red-500",
    headerIconCancelled: "bg-amber-500/10 text-amber-500",
    headerTitle: "text-sm font-semibold text-slate-800 dark:text-white",
    headerSubtitle: "text-xs text-slate-500 dark:text-white/50",
    headerActions: "flex items-center gap-2",
    btnHeaderAction: "w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer",
    body: "p-4 max-h-80 overflow-y-auto",
    jobItem: "p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 mb-3 last:mb-0",
    jobHeader: "flex items-center justify-between mb-3",
    jobTitle: "text-sm font-medium text-slate-700 dark:text-white flex items-center",
    jobBadge: "px-2 py-0.5 rounded-full text-xs font-medium",
    jobBadgeRunning: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
    jobBadgeCompleted: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    jobBadgeFailed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    jobBadgeCancelled: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    progressWrapper: "mb-3",
    progressBar: "h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden",
    progressFill: "h-full rounded-full transition-all duration-300",
    progressFillRunning: "bg-rose-500",
    progressFillCompleted: "bg-green-500",
    progressFillFailed: "bg-red-500",
    progressStats: "flex items-center justify-between mt-2",
    progressLabel: "text-xs text-slate-500 dark:text-white/50",
    progressPercent: "text-xs font-medium text-slate-600 dark:text-white/70",
    statsGrid: "grid grid-cols-3 gap-2 mb-3",
    statItem: "text-center",
    statLabel: "block text-xs text-slate-500 dark:text-white/40",
    statValue: "block text-sm font-medium text-slate-700 dark:text-white",
    currentFile: "text-xs text-slate-500 dark:text-white/50 truncate mb-2",
    currentFileLabel: "font-medium text-slate-600 dark:text-white/70",
    speedEta: "flex items-center gap-4 mb-3",
    speedEtaItem: "flex items-center gap-1",
    speedEtaIcon: "text-slate-400 dark:text-white/40",
    speedEtaValue: "text-xs text-slate-600 dark:text-white/70",
    errorsSection: "mt-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg",
    errorsTitle: "text-xs font-medium text-red-600 dark:text-red-400 mb-2",
    errorsList: "space-y-1",
    errorItem: "text-xs text-red-600 dark:text-red-400 truncate",
    actions: "flex justify-end gap-2 mt-3",
    btnCancel: "px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors cursor-pointer",
    btnDismiss: "px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer",
    emptyState: "flex flex-col items-center justify-center py-8",
    emptyIcon: "text-slate-300 dark:text-white/20 mb-3",
    emptyText: "text-sm text-slate-500 dark:text-white/50",
  },
};
