import { Button } from '@/components/ui/button';
import { CloudCog, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onConnectProvider: () => void;
  onCreateBucket: () => void;
}

export function DashboardHeader({ onConnectProvider, onCreateBucket }: DashboardHeaderProps) {
  return (
    <div className="shrink-0 flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-semibold text-foreground tracking-[-0.264px]">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground">Resumen de almacenamiento y actividad</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onConnectProvider}>
          <CloudCog size={14} />
          Conectar proveedor
        </Button>
        <Button size="sm" onClick={onCreateBucket}>
          <Plus size={14} />
          Nuevo bucket
        </Button>
      </div>
    </div>
  );
}
