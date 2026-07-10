'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { Toolbar } from '@/components/layout/toolbar';
import { BucketsList } from '@/components/dashboard/buckets-list';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { FileTypeChart } from '@/components/dashboard/file-type-chart';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { Search, ArrowRight, Activity, Cloud, Shield, Plus, CloudCog } from 'lucide-react';
import { fmtBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { setCreateBucketOpen, setConnectProviderOpen } = useAppStore();
  const [search, setSearch] = useState('');

  const { buckets } = useBuckets();
  const { providers } = useProviders();
  const { data: activity = [] } = useQuery({ queryKey: ['activity'], queryFn: () => api.activity.list(10) });
  const { data: fileTypes = [] } = useQuery({ queryKey: ['file-types'], queryFn: () => api.objects.fileTypes(), enabled: buckets.length > 0 });

  const { data: statsMap = {} } = useQuery({
    queryKey: ['buckets-stats', buckets.map(b => `${b.providerId}:${b.name}`).join(',')],
    queryFn: async () => {
      const map: Record<string, { totalSize: number; totalObjects: number }> = {};
      await Promise.allSettled(
        buckets.map(async b => {
          try {
            const stats = await api.buckets.stats(b.name, b.providerId);
            map[`${b.providerId}:${b.name}`] = stats;
          } catch {
            map[`${b.providerId}:${b.name}`] = { totalSize: 0, totalObjects: 0 };
          }
        })
      );
      return map;
    },
    enabled: buckets.length > 0,
  });

  const totalSize = buckets.reduce((sum, b) => {
    const stats = statsMap[`${b.providerId}:${b.name}`];
    return sum + (stats?.totalSize ?? 0);
  }, 0);
  const totalObjects = buckets.reduce((sum, b) => {
    const stats = statsMap[`${b.providerId}:${b.name}`];
    return sum + (stats?.totalObjects ?? 0);
  }, 0);
  const publicBuckets = buckets.filter(b => b.isPublic).length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Dashboard' }]} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-semibold text-foreground tracking-[-0.264px]">Dashboard</h1>
                <p className="text-[13px] text-muted-foreground">Resumen de almacenamiento y actividad</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setConnectProviderOpen(true)}>
                  <CloudCog size={14} />
                  Conectar proveedor
                </Button>
                <Button size="sm" onClick={() => setCreateBucketOpen(true)}>
                  <Plus size={14} />
                  Nuevo bucket
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Buckets" value={buckets.length} icon={Cloud} sub={`${providers.length} proveedores`} />
              <StatCard label="Almacenamiento" value={fmtBytes(totalSize)} icon={Cloud} sub={`${totalObjects.toLocaleString()} objetos`} />
              <StatCard label="Públicos" value={publicBuckets} icon={Shield} sub={`de ${buckets.length} buckets`} />
              <StatCard label="Actividad hoy" value={activity.length} icon={Activity} sub="últimas 24 h" />
            </div>

            {/* Main content */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 flex flex-col min-h-0 bg-card border border-border rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
                  <div>
                    <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.2px]">Buckets</h2>
                    <p className="text-[12px] text-muted-foreground">{`${buckets.length} buckets conectados`}</p>
                  </div>
                  <div className="relative flex items-center gap-2 w-full sm:w-64">
                    <Search size={14} className="absolute left-3 text-foreground/40" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar buckets..."
                      className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-md text-[13px] outline-none placeholder:text-muted-foreground/60 focus:border-border-strong transition-colors"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <BucketsList search={search} />
                </div>
              </div>

              <div className="flex flex-col min-h-0 gap-4">
                <div className="h-[280px] shrink-0">
                  <FileTypeChart data={fileTypes} />
                </div>

                <div className="flex-1 min-h-0 bg-card border border-border rounded-md flex flex-col">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.2px]">Actividad reciente</h2>
                    <Link href="/activity" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
