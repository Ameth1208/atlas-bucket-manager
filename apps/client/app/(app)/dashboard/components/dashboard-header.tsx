import { Button } from '@/components/ui/button';
import { CloudCog, Plus } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface DashboardHeaderProps {
  onConnectProvider: () => void;
  onCreateBucket: () => void;
}

export function DashboardHeader({ onConnectProvider, onCreateBucket }: DashboardHeaderProps) {
  const { t } = useI18n();
  return (
    <div className="shrink-0 flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-semibold text-foreground tracking-[-0.264px]">
          {t.dashboardTitle}
        </h1>
        <p className="text-[13px] text-muted-foreground">{t.dashboardSubtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onConnectProvider}>
          <CloudCog size={14} />
          {t.dashboardConnectProvider}
        </Button>
        <Button size="sm" onClick={onCreateBucket}>
          <Plus size={14} />
          {t.dashboardCreateBucket}
        </Button>
      </div>
    </div>
  );
}
