import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { useI18n } from '@/lib/i18n';
import type { ActivityEntry } from '@/lib/api';

interface ActivityPanelProps {
  activity: ActivityEntry[];
}

export function ActivityPanel({ activity }: ActivityPanelProps) {
  const { t } = useI18n();
  return (
    <div className="flex-1 min-h-[300px] bg-card/75 backdrop-blur-2xl border border-white/[0.08] rounded-[20px] shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
        <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.2px]">
          {t.dashboardRecentActivity}
        </h2>
        <Link
          href="/activity"
          className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          {t.dashboardViewAll} <ArrowRight size={12} />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activity.length > 0 ? (
          <Card className="border-0 shadow-none rounded-none bg-transparent">
            {activity.slice(0, 10).map((a, i) => (
              <ActivityItem
                key={a.id}
                activity={a}
                isLast={i === Math.min(9, activity.length - 1)}
              />
            ))}
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <p className="text-sm text-muted-foreground">{t.dashboardNoRecentActivity}</p>
          </div>
        )}
      </div>
    </div>
  );
}
