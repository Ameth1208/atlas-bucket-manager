/**
 * Bucket Card Tailwind Classes — Premium Apple Design
 */

export const bucketCardStyles = {
  container:
    "group block bg-white dark:bg-dark-800 rounded-2xl p-5 border border-border-light dark:border-dark-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 hover:border-accent/30",
  header: "flex justify-between items-start mb-5",
  iconWrapper: "flex flex-col gap-2",
  icon: "size-11 flex items-center justify-center bg-accent/10 dark:bg-accent/20 rounded-2xl text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white",
  providerBadge:
    "text-[10px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-darkTertiary",
  actions:
    "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  actionBtn:
    "size-8 flex items-center justify-center bg-transparent border-0 text-text-tertiary dark:text-text-darkTertiary cursor-pointer transition-colors duration-200 hover:text-accent dark:hover:text-accent-light rounded-xl",
  actionBtnDelete: "hover:text-red-500 dark:hover:text-red-400",
  content: "mb-5",
  bucketName:
    "font-semibold text-text-primary dark:text-text-darkPrimary font-mono text-[14px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis",
  metadata: "flex items-center gap-3 mt-2",
  date: "text-[11px] text-text-tertiary dark:text-text-darkTertiary font-medium",
  stats: "text-[11px] text-accent font-medium tabular-nums",
  statsVisible: "block",
  statsBtn:
    "text-[11px] text-text-tertiary dark:text-text-darkTertiary bg-transparent border-0 cursor-pointer transition-colors duration-200 hover:text-accent",
  footer:
    "flex items-center justify-between pt-5 border-t border-border-light dark:border-dark-600",
  statusPublic:
    "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  statusPrivate:
    "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  toggleContainer: "relative inline-flex items-center cursor-pointer",
  toggleInput: "absolute opacity-0 pointer-events-none",
  toggleSwitch:
    "w-11 h-6 rounded-full relative transition-all duration-300 ease-in-out",
  toggleSwitchUnchecked: "bg-border-light dark:bg-dark-600",
  toggleSwitchChecked: "bg-accent",
  toggleKnob:
    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ease-in-out shadow-sm",
  toggleKnobChecked: "translate-x-5",
};
