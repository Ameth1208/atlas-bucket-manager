'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { Toolbar } from '@/components/layout/toolbar';
import { BucketCard } from '@/components/dashboard/bucket-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

export default function DashboardPage() {
  const { setCreateBucketOpen } = useAppStore();

  const { buckets, isLoading: loadingB } = useBuckets();
  const { providers } = useProviders();
  const { data: activity = [] } = useQuery({ queryKey: ['activity'], queryFn: () => api.activity.list(10) });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Todos los buckets' }]} />

      <div className="flex-1 overflow-y-auto p-6">
        <DashboardHeader title="Todos los buckets" subtitle="Resumen" />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Buckets" value={buckets.length} sub={`${providers.length} proveedores`} />
          <StatCard label="Proveedores activos" value={providers.length} sub={providers.map(p => p.name).join(' · ') || '—'} />
          <StatCard label="Claves API" value="—" sub="Ver en API Keys" />
          <StatCard label="Actividad hoy" value={activity.length} sub="últimas 24 h" />
        </div>

        {/* Buckets */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Buckets</h2>
          <span className="text-xs text-muted-foreground">
            {buckets.length} · {providers.length} proveedor{providers.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {loadingB ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : buckets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Database size={36} className="mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-4">No hay buckets configurados</p>
              <Button onClick={() => setCreateBucketOpen(true)}>Crear primer bucket</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {buckets.map(b => (
              <BucketCard
                key={`${b.providerId}-${b.name}`}
                bucket={b}
                providerColor={b.providerId === 'minio' ? '#f43f5e' : b.providerId === 'aws' ? '#3b82f6' : '#10b981'}
              />
            ))}
          </div>
        )}

        {/* Activity */}
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
