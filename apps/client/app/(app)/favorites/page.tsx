'use client';

import { useI18n } from '@/lib/i18n';
import { Toolbar } from '@/components/layout/toolbar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useFavorites } from './hooks/use-favorites';
import { FavoritesList } from './components/favorites-list';

export default function FavoritesPage() {
  const { t, tx } = useI18n();
  const { favorites, providerNames } = useFavorites();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.favoritesTitle }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <DashboardHeader title={t.favoritesTitle} subtitle={t.favoritesSubtitle}>
          {null}
        </DashboardHeader>

        <FavoritesList favorites={favorites} providerNames={providerNames} />

        {favorites.length > 0 && (
          <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
            {tx('dashboardBucketsSubtitle', { count: favorites.length })}
          </p>
        )}
      </div>
    </div>
  );
}
