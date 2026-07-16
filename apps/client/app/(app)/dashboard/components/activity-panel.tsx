import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ActivityItem } from '@/components/dashboard/activity-item';
import type { ActivityEntry } from '@/lib/api';

interface ActivityPanelProps {
  activity: ActivityEntry[];
}

export function ActivityPanel({ activity }: ActivityPanelProps) {
  return (
    <div className="flex-1 min-h-0 bg-card border border-border rounded-md flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.2px]">Actividad reciente</h2>
        <Link
          href="/activity"
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
        >
          Ver todo <ArrowRight size={12} />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activity.length > 0 ? (
          <Card className="border-0 shadow-none rounded-none">
            {activity.slice(0, 10).map((a, i) => (
              <ActivityItem key={a.id} activity={a} isLast={i === Math.min(9, activity.length - 1)} />
            ))}
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  );
}
