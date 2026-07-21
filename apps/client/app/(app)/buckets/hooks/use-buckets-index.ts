'use client';

import { useMemo, useState } from 'react';
import { useBuckets } from '@/hooks/use-buckets';
import type { Bucket } from '@/lib/api';

export interface UseBucketsIndexResult {
  search: string;
  setSearch: (v: string) => void;
  buckets: Bucket[];
  isLoading: boolean;
  filtered: Bucket[];
}

export function useBucketsIndex(): UseBucketsIndexResult {
  const [search, setSearch] = useState('');
  const { buckets, isLoading } = useBuckets();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return buckets;
    return buckets.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.providerName ?? '').toLowerCase().includes(q),
    );
  }, [buckets, search]);

  return { search, setSearch, buckets, isLoading, filtered };
}
