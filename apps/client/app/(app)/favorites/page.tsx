'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Toolbar } from '@/components/layout/toolbar';
import { Database, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  const { data: buckets = [] } = useQuery({ queryKey: ['buckets'], queryFn: api.buckets.list });
  const { data: providers = [] } = useQuery({ queryKey: ['providers'], queryFn: api.buckets.providers });
  const provMap = Object.fromEntries(providers.map(p => [p.id, p.name]));

  // For now show first 3 as "favorites" — in a real implementation we'd persist favorites
  const favs = buckets.slice(0, 3);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Favoritos' }]} />

      <div className="flex-1 overflow-y-auto p-6">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 20 }}>
          Favoritos
        </h1>

        {favs.length === 0 ? (
          <div className="text-center py-16">
            <Star size={32} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
            <p className="text-[13px] text-[var(--text-secondary)]">No hay buckets marcados como favoritos</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {favs.map(b => (
              <div key={`${b.providerId}-${b.name}`}
                className="rounded-xl border border-[var(--border)] p-4 cursor-pointer hover:border-[var(--accent)] transition-all"
                style={{ background: 'var(--bg-surface)' }}
                onClick={() => router.push(`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-well)' }}>
                    <Database size={16} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--text)] truncate">{b.name}</div>
                    <div className="text-[11.5px] text-[var(--text-tertiary)]">{provMap[b.providerId] || b.providerId}</div>
                  </div>
                  <Star size={14} className="shrink-0" style={{ color: 'var(--orange)' }} fill="var(--orange)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
