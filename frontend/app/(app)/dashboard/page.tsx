'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { Toolbar } from '@/components/layout/toolbar';
import { BucketsList } from '@/components/dashboard/buckets-list';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

export default function DashboardPage() {
  const { setCreateBucketOpen } = useAppStore();

  const { buckets } = useBuckets();
  const { providers } = useProviders();
  const { data: activity = [] } = useQuery({ queryKey: ['activity'], queryFn: () => api.activity.list(10) });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Todos los buckets' }]} />

      <div className="flex-1 overflow-y-auto p-6">
        <DashboardHeader title="Todos los buckets" subtitle="Resumen" />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Buckets" value={buckets.length} sub={`${providers.length} proveedores`} />
          <StatCard label="Proveedores activos" value={providers.length} sub={providers.map(p => p.name).join(' · ') || '—'} />
          <StatCard label="Claves API" value="—" sub="Ver en API Keys" />
          <StatCard label="Actividad hoy" value={activity.length} sub="últimas 24 h" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Buckets</h2>
          <span className="text-xs text-muted-foreground">
            {buckets.length} · {providers.length} proveedor{providers.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <BucketsList />

        {activity.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Actividad reciente</h2>
              <Link href="/activity" className="text-xs text-primary hover:underline">Ver todo</Link>
            </div>
            <Card>
              {activity.slice(0, 8).map((a, i) => (
                <ActivityItem key={a.id} activity={a} isLast={i === Math.min(7, activity.length - 1)} />
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
