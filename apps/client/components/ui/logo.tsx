'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { AtlasLogo } from './atlas-logo';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 22 },
  md: { icon: 30 },
  lg: { icon: 42 },
};

export function Logo({ size = 'md', showText = false, className }: LogoProps) {
  const { t } = useI18n();
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <AtlasLogo size={s.icon} className="shrink-0" />
      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Atlas</p>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">v2.0.4</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.uiLogoTagline}</p>
        </div>
      )}
    </div>
  );
}
