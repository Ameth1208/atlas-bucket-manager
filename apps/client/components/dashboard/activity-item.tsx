'use client';
import { cn } from '@/lib/utils';
import { getActionMeta } from '@/app/(app)/activity/lib/action-meta';

interface ActivityItemProps {
  activity: { id: string | number; actor: string; action: string; target?: string; bucket?: string; createdAt: number };
  isLast?: boolean;
}

function timeAgo(ts: number): string {
  const s = Math.floor(Date.now() / 1000 - ts / 1000);
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const meta = getActionMeta(activity.action);
  const Icon = meta.icon;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b border-border')}>
      <div className={cn('w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', meta.iconBg)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] leading-snug tracking-[-0.224px]">
          <span className="font-medium text-muted-foreground font-mono text-[11px]">{activity.actor}</span>
          {' '}<span className="text-foreground">{meta.label}</span>
          {activity.target && <> <span className="font-semibold text-foreground">{activity.target}</span></>}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {activity.bucket ? `${activity.bucket} · ` : ''}{timeAgo(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}
