'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: 32, icon: 14 },
  md: { container: 40, icon: 18 },
  lg: { container: 48, icon: 22 },
};

export function Logo({ size = 'md', showText = false, className }: LogoProps) {
  const { t } = useI18n();
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="rounded-xl flex items-center justify-center shrink-0"
        style={{
          width: s.container,
          height: s.container,
          background: 'linear-gradient(145deg, #155BD0 0%, #0049BB 100%)',
        }}
      >
        <Image alt='logo' src={'/logo.svg'} width={300} height={300} className='h-6' />
      </div>
      {showText && (
        <div>
          <p className="text-sm font-semibold text-foreground">Atlas</p>
          <p className="text-xs text-muted-foreground">{t.uiLogoTagline}</p>
        </div>
      )}
    </div>
  );
}
