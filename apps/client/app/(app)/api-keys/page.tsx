'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Toolbar } from '@/components/layout/toolbar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Key, Eye, EyeOff, Copy, Plus, Trash2, Activity, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { cn, fmtDate, fmtRelative } from '@/lib/utils';

const SCOPE_VARIANT: Record<string, 'outline' | 'secondary' | 'destructive'> = {
  read: 'outline', write: 'secondary', delete: 'destructive',
};

const CURL_EXAMPLE = (prefix: string) =>
`# Subir un archivo a tu bucket\n\
curl -X POST https://tu-atlas.app/api/v1/upload/mi-bucket \\\n\
  -H "Authorization: Bearer ${prefix}_••••••••••••••••" \\\n\
  -F "file=@./archivo.png"`;

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copiado');
}

export default function ApiKeysPage() {
  const qc = useQueryClient();
  const { setCreateKeyOpen } = useAppStore();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const { data: keys = [], isLoading } = useQuery({ queryKey: ['api-keys'], queryFn: api.apiKeys.list });

  const revokeMutation = useMutation({
    mutationFn: api.apiKeys.revoke,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Clave revocada'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = keys.filter(k => k.name.toLowerCase().includes(query.toLowerCase()));
  const active = keys.filter(k => !k.revokedAt);
  const reads = active.filter(k => k.scopes.includes('read')).length;
  const writes = active.filter(k => k.scopes.includes('write')).length;

  const toggleReveal = (id: string) => setRevealed(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Claves de API' }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <DashboardHeader title="Claves de API" subtitle="Herramientas">
            <Button variant="pearl" size="sm"><Key size={13} /> Política</Button>
            <Button size="sm" onClick={() => setCreateKeyOpen(true)}><Plus size={13} /> Nueva clave</Button>
          </DashboardHeader>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Key, label: 'Claves activas', value: active.length },
            { icon: Eye, label: 'Con lectura', value: reads },
            { icon: Upload, label: 'Con escritura', value: writes },
            { icon: Activity, label: 'Llamadas 30d', value: '—' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 pt-4 pb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                  <s.icon size={16} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden mb-6 border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Claves</h2>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrar…"
              className="h-8 px-3 rounded-[11px] border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none w-44 focus:border-ring transition-colors"
            />
          </div>

          <div className="grid grid-cols-[1fr_220px_140px_100px_36px] text-xs font-semibold uppercase text-muted-foreground px-4 py-2 border-b border-border tracking-wide">
            <span>Nombre</span><span>Token</span><span>Permisos</span><span>Último uso</span><span />
          </div>

          {isLoading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Key size={28} className="mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mb-3">No hay claves de API</p>
              <Button size="sm" onClick={() => setCreateKeyOpen(true)}><Plus size={13} /> Nueva clave</Button>
            </div>
          ) : filtered.map((k, i) => (
            <div
              key={k.id}
              className={cn(
                'grid grid-cols-[1fr_220px_140px_100px_36px] items-center px-4 py-3 text-sm',
                i > 0 && 'border-t border-border',
                k.revokedAt && 'opacity-50'
              )}
            >
              <div>
                <p className="font-medium text-foreground">{k.name}</p>
                <p className="text-xs text-muted-foreground font-mono">Creada {fmtDate(k.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1">
                <code className="font-mono text-xs text-muted-foreground">{k.prefix}_••••••••</code>
                <button type="button" onClick={() => toggleReveal(k.id)} aria-label={revealed.has(k.id) ? 'Ocultar token' : 'Mostrar token'} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  {revealed.has(k.id) ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>
                <button type="button" onClick={() => copy(k.prefix)} aria-label="Copiar prefijo del token" className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <Copy size={11} />
                </button>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {k.scopes.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <Badge key={s} variant={SCOPE_VARIANT[s] ?? 'outline'}>{s}</Badge>
                ))}
              </div>
              <p className="text-xs font-mono text-muted-foreground">{fmtRelative(k.lastUsed ?? undefined)}</p>
              <button
                type="button"
                disabled={!!k.revokedAt || revokeMutation.isPending}
                onClick={() => revokeMutation.mutate(k.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-30"
                title="Revocar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </Card>

        {/* Quick start */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Inicio rápido</h3>
            <div className="flex gap-1">
              {['cURL', 'Node.js', 'Python'].map((t, i) => (
                <button type="button" key={t} className={cn('px-2.5 py-1 rounded-lg text-xs transition-colors', i === 0 ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <pre className="p-4 font-mono text-xs text-muted-foreground overflow-x-auto bg-muted/50">
            <code>{CURL_EXAMPLE(keys[0]?.prefix || 'atl_live_xxxxxxxx')}</code>
          </pre>
        </Card>
      </div>
    </div>
  );
}
