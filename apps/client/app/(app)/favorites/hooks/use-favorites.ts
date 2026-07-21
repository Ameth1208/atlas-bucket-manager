'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { api } from '@/lib/api';
import type { Bucket } from '@/lib/api';

interface FavoriteRef {
  providerId: string;
  bucketName: string;
}

export interface UseFavoritesResult {
  favorites: Bucket[];
  providerNames: Record<string, string>;
  isLoading: boolean;
}

export function useFavorites(): UseFavoritesResult {
  const { data: listResult, isLoading: listLoading } = useQuery({
    queryKey: ['buckets'],
    queryFn: api.buckets.list,
  });
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: api.buckets.providers,
  });
  const { data: favsData, isLoading: favsLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.favorites.list,
  });

  const providerNames = useMemo(
    () => Object.fromEntries(providers.map((p) => [p.id, p.name])),
    [providers],
  );

  const favorites = useMemo(() => {
    const buckets = listResult?.buckets ?? [];
    const set = new Set((favsData ?? []).map((f: FavoriteRef) => `${f.providerId}:${f.bucketName}`));
    return buckets.filter((b: Bucket) => set.has(`${b.providerId}:${b.name}`));
  }, [listResult, favsData]);

  return {
    favorites,
    providerNames,
    isLoading: listLoading || providersLoading || favsLoading,
  };
}
