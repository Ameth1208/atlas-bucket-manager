/**
 * Bucket Card Tailwind Classes
 */

export const bucketCardStyles = {
  container:
    "block bg-white dark:bg-dark-900 rounded-xl p-5 border border-slate-200 dark:border-dark-800 transition-all duration-200 shadow-sm hover:border-rose-500 hover:shadow-md",
  header: "flex justify-between items-start mb-6",
  iconWrapper: "flex flex-col gap-1",
  icon: "aspect-square w-12 flex items-center justify-center bg-slate-50 dark:bg-dark-800 rounded-xl text-rose-500 transition-all duration-300 shadow-sm group-hover:bg-rose-500 group-hover:text-white",
  providerBadge:
    "text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight mt-1",
  actions: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  actionBtn:
    "p-2 bg-transparent border-0 text-slate-400 dark:text-slate-500 cursor-pointer transition-colors duration-200 hover:text-rose-500",
  actionBtnDelete: "hover:text-rose-600",
  content: "mb-5",
  bucketName:
    "font-bold text-slate-900 dark:text-white font-mono text-sm tracking-tight whitespace-nowrap overflow-hidden text-ellipsis",
  metadata: "flex items-center gap-3 mt-1",
  date: "text-[0.625rem] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider opacity-60",
  stats: "text-[0.625rem] text-rose-500 dark:text-rose-400 font-bold",
  statsVisible: "block",
  statsBtn:
    "text-[0.625rem] text-slate-400 dark:text-slate-500 bg-transparent border-0 cursor-pointer transition-colors duration-200 hover:text-rose-500 hover:scale-110",
  footer: "flex items-center justify-between pt-5 border-t border-slate-100 dark:border-dark-800",
  statusPublic:
    "text-[0.625rem] font-black uppercase tracking-tight px-2 py-1 rounded bg-slate-50 dark:bg-dark-800 text-green-500",
  statusPrivate:
    "text-[0.625rem] font-black uppercase tracking-tight px-2 py-1 rounded bg-slate-50 dark:bg-dark-800 text-amber-500",
  toggleContainer: "relative inline-flex items-center cursor-pointer",
  toggleInput: "absolute opacity-0 pointer-events-none",
  toggleSwitch:
    "w-9 h-5 rounded-full relative transition-all duration-300 ease-in-out",
  toggleSwitchUnchecked: "bg-slate-300 dark:bg-slate-600",
  toggleSwitchChecked: "bg-rose-600 dark:bg-rose-600",
  toggleKnob:
    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ease-in-out",
  toggleKnobChecked: "translate-x-4",
};
