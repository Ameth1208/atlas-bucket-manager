'use client';

import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface ApiKeysToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  onCreate: () => void;
}

export function ApiKeysToolbar({ query, onQueryChange, onCreate }: ApiKeysToolbarProps) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">{t.apiKeysSection}</h2>
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t.apiKeysSearch}
          className="h-8 w-44 text-sm rounded-[11px]"
        />
        <Button size="sm" onClick={onCreate}>
          <Plus size={13} /> {t.apiKeysCreate}
        </Button>
      </div>
    </div>
  );
}
