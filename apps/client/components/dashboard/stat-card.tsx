'use client';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
}

export function StatCard({ label, value, sub, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="relative pt-5 sm:pt-6 pb-4 sm:pb-5 px-4 sm:px-5">
        {Icon && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center">
            <Icon size={14} className="text-foreground/60" />
          </div>
        )}
        <p className="text-[12px] sm:text-[13px] text-muted-foreground mb-1.5 tracking-[-0.12px]">{label}</p>
        <p className="text-[28px] sm:text-[32px] font-semibold text-foreground tracking-[-0.224px] leading-none">{value}</p>
        {sub && <p className="text-[12px] sm:text-[13px] text-muted-foreground mt-1.5 leading-tight tracking-[-0.12px]">{sub}</p>}
        {trend && (
          <p className={cn('text-[12px] sm:text-[13px] mt-1.5 tracking-[-0.12px]', trend.positive ? 'text-success' : 'text-muted-foreground')}>
            {trend.positive ? '↑' : '→'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
