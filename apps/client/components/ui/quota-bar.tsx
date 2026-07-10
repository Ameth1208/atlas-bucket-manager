interface QuotaBarProps {
  used: number;
  limit: number;
  compact?: boolean;
}

export function QuotaBar({ used, limit, compact }: QuotaBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const colorClass = pct > 85 ? 'bg-destructive' : pct > 65 ? 'bg-warning' : 'bg-primary';

  return (
    <div
      className={`w-full rounded-full overflow-hidden bg-muted ${compact ? 'h-[3px]' : 'h-1'}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
