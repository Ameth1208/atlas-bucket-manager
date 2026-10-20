import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3.5 mb-7">
      <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#007aff] to-[#0051c7] flex items-center justify-center shrink-0 shadow-sm shadow-[#0051c7]/25 ring-1 ring-white/20 text-white">
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
