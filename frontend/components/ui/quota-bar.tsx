interface QuotaBarProps {
  used: number;
  limit: number;
  compact?: boolean;
}

export function QuotaBar({ used, limit, compact }: QuotaBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct > 85 ? 'hsl(var(--destructive))' : pct > 65 ? '#ff9500' : 'hsl(var(--primary))';

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{
        height: compact ? 3 : 4,
        background: 'hsl(var(--muted))',
      }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
