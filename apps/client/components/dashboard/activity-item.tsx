'use client';
import { Upload, Trash2, Copy, Share2, Shield, Cloud, FolderPlus, Box, Server, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, LucideIcon> = {
  upload: Upload,
  delete: Trash2,
  delete_bucket: Trash2,
  clone: Copy,
  share: Share2,
  policy: Shield,
  folder: FolderPlus,
  create: Box,
  provider: Server,
};

const ACTION_LABELS: Record<string, string> = {
  upload: 'subió',
  delete: 'eliminó',
  delete_bucket: 'eliminó el bucket',
  clone: 'clonó',
  share: 'compartió',
  policy: 'cambió política de',
  folder: 'creó carpeta',
  create: 'creó',
  provider: 'configuró proveedor',
};

const ACTION_COLOR: Record<string, string> = {
  upload: 'text-foreground bg-muted border border-border',
  delete: 'text-foreground bg-muted border border-border',
  delete_bucket: 'text-foreground bg-muted border border-border',
  clone: 'text-foreground bg-muted border border-border',
  share: 'text-foreground bg-muted border border-border',
  policy: 'text-foreground bg-muted border border-border',
  folder: 'text-foreground bg-muted border border-border',
  create: 'text-foreground bg-muted border border-border',
  provider: 'text-foreground bg-muted border border-border',
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
  const colorClass = ACTION_COLOR[activity.action] ?? 'text-foreground bg-muted border border-border';
  const label = ACTION_LABELS[activity.action] ?? activity.action;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b border-border')}>
      <div className={cn('w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', colorClass)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] leading-snug tracking-[-0.224px]">
          <span className="font-medium text-muted-foreground font-mono text-[11px]">{activity.actor}</span>
          {' '}<span className="text-foreground">{label}</span>
          {activity.target && <> <span className="font-semibold text-foreground">{activity.target}</span></>}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {activity.bucket ? `${activity.bucket} · ` : ''}{timeAgo(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}
