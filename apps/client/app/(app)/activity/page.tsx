'use client';

import { useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Toolbar } from '@/components/layout/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useActivity } from './hooks/use-activity';
import { ActivityList } from './components/activity-list';

const ACTIONS = [
  { value: '', label: 'Todas' },
  { value: 'create', label: 'Crear' },
  { value: 'delete', label: 'Eliminar' },
  { value: 'delete_bucket', label: 'Eliminar bucket' },
  { value: 'upload', label: 'Subir' },
  { value: 'folder', label: 'Carpeta' },
  { value: 'policy', label: 'Política' },
  { value: 'user', label: 'Usuario' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'clone', label: 'Clonar' },
];

export default function ActivityPage() {
  const [action, setAction] = useState<string>('');
  const [actor, setActor] = useState<string>('');

  const filters = useMemo(() => ({ action: action || undefined, actor: actor || undefined }), [action, actor]);
  const { data: entries = [], isLoading } = useActivity(100, filters);

  const hasFilters = !!action || !!actor;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Actividad' }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <DashboardHeader title="Actividad" subtitle="Fuentes" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse bg-success" />
            <span className="text-[12px] text-muted-foreground">en vivo</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <Input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="Buscar por usuario (email)…"
              className="pl-9 h-9 rounded-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map((a) => {
              const active = action === a.value;
              return (
                <button
                  key={a.value || 'all'}
                  type="button"
                  onClick={() => setAction(a.value)}
                  className={
                    'h-9 px-3 rounded-md text-[12px] font-medium border transition-colors ' +
                    (active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground')
                  }
                >
                  {a.label}
                </button>
              );
            })}
          </div>
          {hasFilters && (
            <Button variant="pearl" size="sm" onClick={() => { setAction(''); setActor(''); }}>
              <X size={12} /> Limpiar
            </Button>
          )}
        </div>

        <ActivityList entries={entries} isLoading={isLoading} />
      </div>
    </div>
  );
}
