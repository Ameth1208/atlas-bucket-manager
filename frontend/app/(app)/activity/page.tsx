'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Toolbar } from '@/components/layout/toolbar';
import { actionColors, actionLabels } from '@/lib/utils';
import { Upload, Trash2, Copy, Share2, Shield, Cloud } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  upload: Upload, delete: Trash2, clone: Copy, share: Share2, policy: Shield,
};

export default function ActivityPage() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['activity-full'],
    queryFn: () => api.activity.list(100),
    refetchInterval: 10_000,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Actividad' }]} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[12px] text-[var(--text-secondary)] mb-1">Fuentes</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>Actividad</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
            <span className="text-[12px] text-[var(--text-tertiary)]">en vivo</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--bg-well)' }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)] text-[13px]">Sin actividad registrada</div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            {entries.map((a, i) => {
              const Icon = ICONS[a.action] || Cloud;
              const color = actionColors[a.action] || 'var(--text-secondary)';
              const ago = Math.floor((Date.now() / 1000 - (a.createdAt || 0)));
              const agoLabel = ago < 60 ? 'ahora' : ago < 3600 ? `${Math.floor(ago / 60)} min` : ago < 86400 ? `${Math.floor(ago / 3600)} h` : `${Math.floor(ago / 86400)} d`;

              return (
                <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--bg-well)', color }}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-[var(--text)]">
                      <span className="font-mono text-[var(--text-secondary)]">{a.actor}</span>{' '}
                      <span>{actionLabels[a.action] || a.action}</span>{' '}
                      {a.target && <span className="font-semibold">{a.target}</span>}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{[a.bucket, a.provider].filter(Boolean).join(' · ')}</div>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-tertiary)] shrink-0">{agoLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
