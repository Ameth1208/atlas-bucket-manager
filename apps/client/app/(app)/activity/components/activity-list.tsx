import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityItem } from '@/components/dashboard/activity-item';
import type { ActivityEntry } from '@/lib/api';

interface ActivityListProps {
  entries: ActivityEntry[];
  isLoading: boolean;
}

export function ActivityList({ entries, isLoading }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 rounded-[11px]" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-[13px]">
        Sin actividad registrada
      </div>
    );
  }

  return (
    <Card className="border-border overflow-hidden">
      {entries.map((a, i) => (
        <ActivityItem key={a.id} activity={a} isLast={i === entries.length - 1} />
      ))}
    </Card>
  );
}
