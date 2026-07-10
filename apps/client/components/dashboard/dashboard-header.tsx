'use client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  const qc = useQueryClient();
  const { setCreateBucketOpen } = useAppStore();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
      <div>
        {subtitle && <p className="text-[14px] text-muted-foreground mb-1 tracking-[-0.224px]">{subtitle}</p>}
        <h1 className="text-[28px] sm:text-[34px] font-semibold text-foreground leading-[1.10] tracking-[-0.374px]">{title}</h1>
      </div>
      <div className="flex gap-2">
        {children ? children : (
          <>
            <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries()}>
              <RefreshCw size={14} />
              Sync
            </Button>
            <Button size="sm" onClick={() => setCreateBucketOpen(true)}>
              <Plus size={14} />
              Nuevo bucket
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
