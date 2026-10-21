'use client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  href?: string;
}

export function StatCard({ label, value, sub, icon: Icon, trend, href }: StatCardProps) {
  const card = (
    <Card className={cn('border-border/70 bg-card transition-all', href && 'hover:border-primary/50 hover:shadow-xs cursor-pointer group')}>
      <CardContent className="relative pt-5 sm:pt-6 pb-4 sm:pb-5 px-5 sm:px-6">
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className={cn('absolute top-4 sm:top-5 right-4 sm:right-5 text-muted-foreground/50 transition-colors', href && 'group-hover:text-primary/70')}
          />
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

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {card}
      </Link>
    );
  }

  return card;
}
