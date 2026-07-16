import { StatCard } from '@/components/dashboard/stat-card';
import { Activity, Cloud, Shield } from 'lucide-react';
import { fmtBytes } from '@/lib/utils';
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
  return (
    <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Buckets" value={bucketsCount} icon={Cloud} sub={`${providersCount} proveedores`} />
      <StatCard label="Almacenamiento" value={fmtBytes(totalSize)} icon={Cloud} sub={`${totalObjects.toLocaleString()} objetos`} />
      <StatCard label="Públicos" value={publicBuckets} icon={Shield} sub={`de ${bucketsCount} buckets`} />
      <StatCard label="Actividad hoy" value={activity.length} icon={Activity} sub="últimas 24 h" />
    </div>
  );
}
