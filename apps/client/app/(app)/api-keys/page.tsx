'use client';

import { Key, Plus } from 'lucide-react';
import { Toolbar } from '@/components/layout/toolbar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useApiKeys } from './hooks/use-api-keys';
import { ApiKeysStats } from './components/api-keys-stats';
import { ApiKeysToolbar } from './components/api-keys-toolbar';
import { ApiKeysTable } from './components/api-keys-table';
import { ApiKeysQuickstart } from './components/api-keys-quickstart';

export default function ApiKeysPage() {
  const { t } = useI18n();
  const { setCreateKeyOpen } = useAppStore();
  const keys = useApiKeys();
  const openCreate = () => setCreateKeyOpen(true);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.apiKeysTitle }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <DashboardHeader title={t.apiKeysTitle} subtitle={t.apiKeysSubtitle}>
            <Button variant="pearl" size="sm">
              <Key size={13} /> {t.apiKeysPolicy}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus size={13} /> {t.apiKeysCreate}
            </Button>
          </DashboardHeader>
        </div>

        <ApiKeysStats
          active={keys.active.length}
          reads={keys.reads}
          writes={keys.writes}
        />

        <Card className="overflow-hidden mb-6 border-border">
          <ApiKeysToolbar
            query={keys.query}
            onQueryChange={keys.setQuery}
            onCreate={openCreate}
          />
          <ApiKeysTable
            keys={keys.filtered}
            isLoading={keys.isLoading}
            revealed={keys.revealed}
            onToggleReveal={keys.toggleReveal}
            onRevoke={keys.revoke}
            isRevoking={keys.isRevoking}
            onCreate={openCreate}
          />
        </Card>

        <ApiKeysQuickstart prefix={keys.keys[0]?.prefix || 'atl_live_xxxxxxxx'} />
      </div>
    </div>
  );
}
