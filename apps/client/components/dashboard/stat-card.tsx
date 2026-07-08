'use client';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: string; positive?: boolean };
}

export function StatCard({ label, value, sub, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5 leading-tight">{sub}</p>}
        {trend && (
          <p className={cn('text-xs mt-1.5', trend.positive ? 'text-green-500' : 'text-muted-foreground')}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
