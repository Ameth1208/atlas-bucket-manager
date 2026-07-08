'use client';
import { Upload, Trash2, Copy, Share2, Shield, Cloud, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, LucideIcon> = {
  upload: Upload, delete: Trash2, clone: Copy, share: Share2, policy: Shield,
};
const ACTION_LABELS: Record<string, string> = {
  upload: 'subió', delete: 'eliminó', clone: 'clonó', share: 'compartió', policy: 'cambió política de',
};
const ACTION_COLOR: Record<string, string> = {
  upload: 'text-green-500 bg-green-500/10',
  delete: 'text-destructive bg-destructive/10',
  clone: 'text-primary bg-primary/10',
  share: 'text-primary bg-primary/10',
  policy: 'text-orange-500 bg-orange-500/10',
};

interface ActivityItemProps {
  activity: { id: string | number; actor: string; action: string; target?: string; bucket?: string; createdAt: number };
  isLast?: boolean;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() / 1000) - ts / 1000);
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const Icon = ACTION_ICONS[activity.action] ?? Cloud;
  const colorClass = ACTION_COLOR[activity.action] ?? 'text-muted-foreground bg-muted';
  const label = ACTION_LABELS[activity.action] ?? activity.action;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b border-border')}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium text-muted-foreground font-mono text-xs">{activity.actor}</span>
          {' '}<span className="text-foreground">{label}</span>
          {activity.target && <> <span className="font-semibold">{activity.target}</span></>}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {activity.bucket} · {timeAgo(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}
