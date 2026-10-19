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
    <Card className="border-border/70 bg-card">
      <CardContent className="relative pt-5 sm:pt-6 pb-4 sm:pb-5 px-5 sm:px-6">
        {Icon && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/80 border border-border/60 flex items-center justify-center">
            <Icon size={14} className="text-foreground/70" />
          </div>
        )}
        <p className="text-[12px] sm:text-[13px] font-medium text-muted-foreground mb-1.5 tracking-[-0.12px]">{label}</p>
        <p className="text-[28px] sm:text-[34px] font-semibold text-foreground tracking-tight leading-none">{value}</p>
        {sub && <p className="text-[12px] sm:text-[13px] text-muted-foreground mt-2 leading-tight tracking-[-0.12px]">{sub}</p>}
        {trend && (
          <p className={cn('text-[12px] sm:text-[13px] mt-2 font-medium tracking-[-0.12px]', trend.positive ? 'text-success' : 'text-muted-foreground')}>
            {trend.positive ? '↑' : '→'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
