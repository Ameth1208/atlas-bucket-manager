'use client';
import { useQuery } from '@tanstack/react-query';
import { Upload, Trash2, Copy, Share2, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { Toolbar } from '@/components/layout/toolbar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ICONS: Record<string, React.ElementType> = {
  upload: Upload, delete: Trash2, clone: Copy, share: Share2, policy: Shield,
};

export default function ActivityPage() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['activity-full'],
    queryFn: () => api.activity.list(100),
    refetchInterval: 10_000,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Actividad' }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <DashboardHeader title="Actividad" subtitle="Fuentes" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse bg-success" />
            <span className="text-[12px] text-muted-foreground">en vivo</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <Skeleton key={i} className="h-12 rounded-[11px]" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-[13px]">Sin actividad registrada</div>
        ) : (
          <Card className="border-border overflow-hidden">
            {entries.map((a, i) => (
              <ActivityItem key={a.id} activity={a} isLast={i === entries.length - 1} />
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
