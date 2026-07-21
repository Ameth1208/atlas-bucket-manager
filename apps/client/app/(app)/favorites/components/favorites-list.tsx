'use client';

import { useRouter } from 'next/navigation';
import { Database, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import type { Bucket } from '@/lib/api';

interface FavoritesListProps {
  favorites: Bucket[];
  providerNames: Record<string, string>;
}

export function FavoritesList({ favorites, providerNames }: FavoritesListProps) {
  const router = useRouter();
  const { t } = useI18n();

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <Star size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">{t.favoritesEmpty}</p>
        <p className="text-[12px] text-muted-foreground/70 mt-1.5">{t.favoritesAddHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {favorites.map((b) => (
        <Card
          key={`${b.providerId}-${b.name}`}
          className="cursor-pointer border-border hover:border-foreground/20 transition-all"
          onClick={() =>
            router.push(`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`)
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted">
                <Database size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">
                  {b.name}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {providerNames[b.providerId] || b.providerId}
                </div>
              </div>
              <Star size={14} className="shrink-0 text-warning" fill="currentColor" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
