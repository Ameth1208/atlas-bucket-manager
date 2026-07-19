'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Database, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Toolbar } from '@/components/layout/toolbar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent } from '@/components/ui/card';

export default function FavoritesPage() {
  const router = useRouter();
  const { t, tx } = useI18n();

  const { data: listResult } = useQuery({ queryKey: ['buckets'], queryFn: api.buckets.list });
  const { data: providers = [] } = useQuery({ queryKey: ['providers'], queryFn: api.buckets.providers });
  const { data: favsData } = useQuery({ queryKey: ['favorites'], queryFn: api.favorites.list });
  const provMap = Object.fromEntries(providers.map((p) => [p.id, p.name]));

  const buckets = listResult?.buckets ?? [];
  const favSet = new Set((favsData ?? []).map((f) => `${f.providerId}:${f.bucketName}`));
  const favs = buckets.filter((b) => favSet.has(`${b.providerId}:${b.name}`));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.favoritesTitle }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <DashboardHeader title={t.favoritesTitle} subtitle={t.favoritesSubtitle}>
          {null}
        </DashboardHeader>

        {favs.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <Star size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">{t.favoritesEmpty}</p>
            <p className="text-[12px] text-muted-foreground/70 mt-1.5">{t.favoritesAddHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {favs.map((b) => (
              <Card
                key={`${b.providerId}-${b.name}`}
                className="cursor-pointer border-border hover:border-foreground/20 transition-all"
                onClick={() => router.push(`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted">
                      <Database size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground truncate">{b.name}</div>
                      <div className="text-[11.5px] text-muted-foreground">{provMap[b.providerId] || b.providerId}</div>
                    </div>
                    <Star size={14} className="shrink-0 text-warning" fill="currentColor" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {favs.length > 0 && (
          <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
            {tx('dashboardBucketsSubtitle', { count: favs.length })}
          </p>
        )}
      </div>
    </div>
  );
}
