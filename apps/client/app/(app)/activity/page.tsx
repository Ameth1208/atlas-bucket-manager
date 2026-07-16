'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Toolbar } from '@/components/layout/toolbar';
import { useActivity } from './hooks/use-activity';
import { ActivityList } from './components/activity-list';

export default function ActivityPage() {
  const { data: entries = [], isLoading } = useActivity(100);

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

        <ActivityList entries={entries} isLoading={isLoading} />
      </div>
    </div>
  );
}
