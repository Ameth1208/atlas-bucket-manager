'use client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const qc = useQueryClient();
  const { setCreateBucketOpen } = useAppStore();

  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {subtitle && <p className="text-sm text-muted-foreground mb-1">{subtitle}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries()}>
          <RefreshCw size={14} />
          Sync
        </Button>
        <Button size="sm" onClick={() => setCreateBucketOpen(true)}>
          <Plus size={14} />
          Nuevo bucket
        </Button>
      </div>
    </div>
  );
}
