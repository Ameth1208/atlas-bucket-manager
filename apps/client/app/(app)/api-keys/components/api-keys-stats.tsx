'use client';

import { Activity, Eye, Key, Upload, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';

interface ApiKeysStatsProps {
  active: number;
  reads: number;
  writes: number;
}

export function ApiKeysStats({ active, reads, writes }: ApiKeysStatsProps) {
  const { t } = useI18n();
  const stats: { icon: LucideIcon; label: string; value: string | number }[] = [
    { icon: Key, label: t.apiKeysStatActive, value: active },
    { icon: Eye, label: t.apiKeysStatRead, value: reads },
    { icon: Upload, label: t.apiKeysStatWrite, value: writes },
    { icon: Activity, label: t.apiKeysStatCalls30d, value: '—' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
