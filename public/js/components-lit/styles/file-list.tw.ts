/**
 * File List (Explorer) Tailwind Classes
 */

export const fileListStyles = {
  // Container
  container: "flex flex-col h-full",
  listWrapper: "flex-1 overflow-y-auto",
  list: "divide-y divide-slate-100 dark:divide-dark-800",

  // Breadcrumb
  breadcrumb: "flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4 flex-wrap",
  breadcrumbItem: "hover:text-rose-500 cursor-pointer transition-colors",
  breadcrumbSeparator: "text-slate-300 dark:text-slate-600",
  breadcrumbCurrent: "text-slate-800 dark:text-slate-200 font-medium",

  // Toolbar
  toolbar: "flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-dark-800",
  toolbarLeft: "flex items-center gap-2",
  toolbarRight: "flex items-center gap-2",
  toolbarBtn:
    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border-0 cursor-pointer",
  toolbarBtnPrimary:
    "bg-rose-600 hover:bg-rose-700 text-white",
  toolbarBtnSecondary:
    "bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300",
  toolbarBtnGhost:
    "bg-transparent hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400",

  // File Item
  item: "flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors cursor-pointer group",
  itemSelected: "bg-rose-50 dark:bg-rose-900/20",
  checkbox: "w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500",
  checkboxChecked: "bg-rose-500 border-rose-500",
  fileIcon:
    "w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400",
  fileIconFolder: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500",
  fileInfo: "flex-1 min-w-0",
  fileName:
    "font-medium text-sm text-slate-800 dark:text-slate-200 truncate",
  fileMeta: "text-xs text-slate-400 dark:text-slate-500",
  fileSize: "text-xs text-slate-400 dark:text-slate-500 w-24 text-right",
  fileActions:
    "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
  fileActionBtn:
    "p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-all border-0 bg-transparent cursor-pointer",

  // Pagination
  pagination: "flex items-center justify-between py-3 px-4 border-t border-slate-100 dark:border-dark-800",
  paginationInfo: "text-xs text-slate-500 dark:text-slate-400",
  paginationControls: "flex items-center gap-1",
  paginationBtn:
    "px-3 py-1 rounded-lg text-xs font-medium transition-all border-0 cursor-pointer",
  paginationBtnActive:
    "bg-rose-600 text-white",
  paginationBtnInactive:
    "bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700",

  // Empty State
  empty: "flex flex-col items-center justify-center py-16 text-center",
  emptyIcon: "w-16 h-16 text-slate-300 dark:text-slate-600 mb-4",
  emptyTitle: "text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2",
  emptyDescription: "text-sm text-slate-500 dark:text-slate-400 mb-6",
};
