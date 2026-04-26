import { cn } from '@/lib/utils';

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
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L20 19H4L12 3Z" fill="white" fillOpacity="0.95" />
          <circle cx="12" cy="15" r="2.5" fill="white" />
        </svg>
      </div>
      {showText && (
        <div>
          <p className="text-sm font-semibold text-foreground">Atlas</p>
          <p className="text-xs text-muted-foreground">Bucket Manager</p>
        </div>
      )}
    </div>
  );
}
