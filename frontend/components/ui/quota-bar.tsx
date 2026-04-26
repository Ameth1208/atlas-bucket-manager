interface QuotaBarProps {
  used: number;
  limit: number;
  compact?: boolean;
}

export function QuotaBar({ used, limit, compact }: QuotaBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct > 85 ? 'var(--red)' : pct > 65 ? 'var(--orange)' : 'var(--accent)';

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{
        height: compact ? 3 : 4,
        background: 'var(--bg-well)',
      }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
