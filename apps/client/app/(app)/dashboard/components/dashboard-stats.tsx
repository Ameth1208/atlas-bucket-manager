import { StatCard } from '@/components/dashboard/stat-card';
import { Activity, Cloud, Shield } from 'lucide-react';
import { fmtBytes } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { ActivityEntry } from '@/lib/api';

interface DashboardStatsProps {
  bucketsCount: number;
  providersCount: number;
  totalSize: number;
  totalObjects: number;
  publicBuckets: number;
  activity: ActivityEntry[];
}

export function DashboardStats({
  bucketsCount,
  providersCount,
  totalSize,
  totalObjects,
  publicBuckets,
  activity,
}: DashboardStatsProps) {
  const { t, tx } = useI18n();
  return (
    <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label={t.dashboardStatBuckets}
        value={bucketsCount}
        icon={Cloud}
        sub={tx('dashboardStatBucketsSub', { count: providersCount })}
      />
      <StatCard
        label={t.dashboardStatStorage}
        value={fmtBytes(totalSize)}
        icon={Cloud}
        sub={tx('dashboardStatStorageSub', { count: totalObjects })}
      />
      <StatCard
        label={t.dashboardStatPublic}
        value={publicBuckets}
        icon={Shield}
        sub={tx('dashboardStatPublicSub', { count: bucketsCount })}
      />
      <StatCard
        label={t.dashboardStatActivity}
        value={activity.length}
        icon={Activity}
        sub={t.dashboardStatActivitySub}
      />
    </div>
  );
}
