/**
 * File List (Explorer) Tailwind Classes — Premium Apple Design
 */

export const fileListStyles = {
  // Container
  container: "flex flex-col h-full",
  listWrapper: "flex-1 overflow-y-auto",
  list: "",

  // Breadcrumb
  breadcrumb: "flex items-center gap-1 text-sm text-slate-500 dark:text-white/50 mb-4 flex-wrap",
  breadcrumbItem: "hover:text-rose-500 cursor-pointer transition-colors",
  breadcrumbSeparator: "text-slate-300 dark:text-white/20",
  breadcrumbCurrent: "text-slate-800 dark:text-white font-medium",

  // Toolbar
  toolbar: "flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-white/10",
  toolbarLeft: "flex items-center gap-2",
  toolbarRight: "flex items-center gap-2",
  toolbarBtn:
    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border-0 cursor-pointer",
  toolbarBtnPrimary:
    "bg-rose-500 hover:bg-rose-600 text-white",
  toolbarBtnSecondary:
    "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10",
  toolbarBtnGhost:
    "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-white/50",

  // List Header
  listHeader: "flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 select-none bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl",
  listHeaderCol: "flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider cursor-pointer hover:text-rose-500 transition-colors",
  listHeaderColActive: "text-rose-500",
  sortIcon: "text-[10px]",

  // File Item
  item: "flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group hover:bg-slate-50 dark:hover:bg-white/5",
  itemSelected: "!bg-rose-500/10",
  checkbox: "w-4 h-4 rounded text-rose-500 cursor-pointer accent-rose-500",
  checkboxChecked: "bg-rose-500",
  fileIcon:
    "size-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/50 shrink-0",
  fileIconFolder: "bg-amber-50 dark:bg-amber-500/10 text-amber-500",
  fileInfo: "flex-1 min-w-0",
  fileName:
    "font-medium text-[13px] text-slate-700 dark:text-white truncate",
  fileMeta: "text-[11px] text-slate-400 dark:text-white/40",
  fileSize: "text-[11px] text-slate-400 dark:text-white/40 w-24 text-right tabular-nums",
  fileActions:
    "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
  fileActionBtn:
    "size-7 flex items-center justify-center rounded-md text-slate-400 dark:text-white/50 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border-0 bg-transparent cursor-pointer",

  // Pagination
  pagination: "flex items-center justify-between py-3 px-4 border-t border-slate-200 dark:border-white/10",
  paginationInfo: "text-xs text-slate-500 dark:text-white/40",
  paginationControls: "flex items-center gap-1",
  paginationBtn:
    "px-3 py-1 rounded-lg text-xs font-medium transition-all border-0 cursor-pointer",
  paginationBtnActive:
    "bg-rose-500 text-white",
  paginationBtnInactive:
    "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10",

  // Empty State
  empty: "flex flex-col items-center justify-center py-20 text-center",
  emptyIcon: "size-12 text-slate-200 dark:text-white/15 mb-3",
  emptyTitle: "text-[15px] font-medium text-slate-500 dark:text-white/50 mb-1",
  emptyDescription: "text-[13px] text-slate-400 dark:text-white/40",
};
