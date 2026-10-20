'use client';
import { cn } from '@/lib/utils';
import { getActionMeta } from '@/app/(app)/activity/lib/action-meta';
import { useI18n } from '@/lib/i18n';

interface ActivityItemProps {
  activity: { id: string | number; actor: string; action: string; target?: string; bucket?: string; createdAt: number };
  isLast?: boolean;
}

function formatRelative(
  ts: number,
  t: { activityTimeNow: string; activityTimeMin: string; activityTimeHour: string; activityTimeDay: string },
  interpolate: (key: 'activityTimeMin' | 'activityTimeHour' | 'activityTimeDay', vars: { n: number }) => string,
): string {
  const s = Math.floor(Date.now() / 1000 - ts / 1000);
  if (s < 60) return t.activityTimeNow;
  const m = Math.floor(s / 60);
  if (m < 60) return interpolate('activityTimeMin', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return interpolate('activityTimeHour', { n: h });
  return interpolate('activityTimeDay', { n: Math.floor(h / 24) });
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const { t, tx } = useI18n();
  const meta = getActionMeta(activity.action, t);
  const Icon = meta.icon;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors', !isLast && 'border-b border-border/60')}>
      <div className={cn('size-8 rounded-[8px] flex items-center justify-center shrink-0 shadow-xs', meta.iconBg)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] leading-snug tracking-[-0.2px]">
          <span className="font-medium text-muted-foreground font-mono text-[11px]">{activity.actor}</span>
          {' '}<span className="text-foreground">{meta.label}</span>
          {activity.target && <> <span className="font-semibold text-foreground">{activity.target}</span></>}
        </p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">
          {activity.bucket ? `${activity.bucket} · ` : ''}{formatRelative(activity.createdAt, t, tx)}
        </p>
      </div>
    </div>
  );
}
