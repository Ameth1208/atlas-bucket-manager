'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type ApiKeyInfo } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export interface UseApiKeysResult {
  keys: ApiKeyInfo[];
  isLoading: boolean;
  query: string;
  setQuery: (v: string) => void;
  filtered: ApiKeyInfo[];
  active: ApiKeyInfo[];
  reads: number;
  writes: number;
  revealed: Set<string>;
  toggleReveal: (id: string) => void;
  revoke: (id: string) => void;
  isRevoking: boolean;
}

export function useApiKeys(): UseApiKeysResult {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: api.apiKeys.list,
  });

  const revokeMutation = useMutation({
    mutationFn: api.apiKeys.revoke,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success(t.apiKeysRevoked);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () => keys.filter((k) => k.name.toLowerCase().includes(query.toLowerCase())),
    [keys, query],
  );

  const active = useMemo(() => keys.filter((k) => !k.revokedAt), [keys]);
  const reads = useMemo(
    () => active.filter((k) => k.scopes.includes('read')).length,
    [active],
  );
  const writes = useMemo(
    () => active.filter((k) => k.scopes.includes('write')).length,
    [active],
  );

  const toggleReveal = useCallback((id: string) => {
    setRevealed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  return {
    keys,
    isLoading,
    query,
    setQuery,
    filtered,
    active,
    reads,
    writes,
    revealed,
    toggleReveal,
    revoke: (id) => revokeMutation.mutate(id),
    isRevoking: revokeMutation.isPending,
  };
}
