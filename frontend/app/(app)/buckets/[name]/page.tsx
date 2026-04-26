'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, StorageObject } from '@/lib/api';
import { Toolbar } from '@/components/layout/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fmtBytes, fmtDate } from '@/lib/utils';
import { Upload, Grid, List, Folder, File, Trash2, Download, RefreshCw, Search, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Layout = 'grid' | 'list';
type Filter = 'all' | 'image' | 'video' | 'audio' | 'code';

const EXT_MAP: Record<string, Filter> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio',
  ts: 'code', tsx: 'code', js: 'code', jsx: 'code', py: 'code', go: 'code', rs: 'code',
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'image', label: 'Imágenes' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'code', label: 'Código' },
];

function getKind(key: string): Filter {
  return EXT_MAP[key.split('.').pop()?.toLowerCase() || ''] || 'all';
}

export default function BucketPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const name = decodeURIComponent(params.name as string);
  const providerId = searchParams.get('provider') || '';

  const [path, setPath] = useState<string[]>([]);
  const [layout, setLayout] = useState<Layout>('grid');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInput = useRef<HTMLInputElement>(null);

  const prefix = path.join('/') + (path.length > 0 ? '/' : '');

  const { data: objects = [], isLoading, refetch } = useQuery({
    queryKey: ['objects', name, providerId, prefix],
    queryFn: () => api.objects.list(name, providerId, prefix),
    enabled: !!providerId,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.objects.upload(name, providerId, files, prefix),
    onSuccess: () => { toast.success('Archivos subidos'); refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (keys: string[]) => api.objects.delete(name, providerId, keys),
    onSuccess: () => { toast.success('Eliminados'); setSelected(new Set()); refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = objects.filter(o => {
    if (search && !o.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && !o.isFolder && getKind(o.key) !== filter) return false;
    return true;
  });

  const navigate = (folder: string) => { setPath([...path, folder]); setSelected(new Set()); };
  const back = (idx: number) => { setPath(path.slice(0, idx)); setSelected(new Set()); };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadMutation.mutate(Array.from(files));
  };

  const handleDownload = async (key: string) => {
    try {
      const { url } = await api.objects.presignedUrl(name, key, providerId);
      window.open(url, '_blank');
    } catch (e: any) { toast.error(e.message); }
  };

  const crumbs = [
    { label: 'Atlas', href: '/dashboard' },
    { label: name },
    ...path.map((seg, i) => ({ label: seg, href: '#' })),
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar crumbs={crumbs} />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">s3://{name}</Badge>
              <Badge variant="secondary">{providerId}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw size={13} />
            </Button>
            <input ref={fileInput} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            <Button size="sm" disabled={uploadMutation.isPending} onClick={() => fileInput.current?.click()}>
              {uploadMutation.isPending
                ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Upload size={13} />}
              Subir
            </Button>
          </div>
        </div>

        {/* Path breadcrumb */}
        {path.length > 0 && (
          <nav className="flex items-center gap-1 mb-4 text-sm">
            <button onClick={() => back(0)} className="text-primary hover:underline">{name}</button>
            {path.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight size={12} className="text-muted-foreground" />
                <button
                  onClick={() => back(i + 1)}
                  className={i === path.length - 1 ? 'font-medium text-foreground' : 'text-primary hover:underline'}
                >
                  {seg}
                </button>
              </span>
            ))}
          </nav>
        )}

        {/* Filters + layout toggle */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 flex-1 h-8 px-3 rounded-lg border border-border bg-muted/50">
            <Search size={12} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar archivos…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-2.5 py-1 transition-colors',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setLayout('grid')}
              className={cn('w-8 h-8 flex items-center justify-center transition-colors', layout === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={cn('w-8 h-8 flex items-center justify-center transition-colors', layout === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
            >
              <List size={13} />
            </button>
          </div>

          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate([...selected])}
            >
              {deleteMutation.isPending
                ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Trash2 size={12} />}
              Eliminar ({selected.size})
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-5 gap-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <File size={32} className="mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mb-4">
                {search ? 'Sin resultados para tu búsqueda' : 'Este bucket está vacío'}
              </p>
              {!search && (
                <Button size="sm" onClick={() => fileInput.current?.click()}>
                  <Upload size={13} /> Subir archivos
                </Button>
              )}
            </div>
          </Card>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-5 gap-3">
            {filtered.map(obj => {
              const fileName = obj.key.split('/').filter(Boolean).pop() || obj.key;
              const isSel = selected.has(obj.key);
              return (
                <div
                  key={obj.key}
                  className={cn(
                    'rounded-xl border p-3 cursor-pointer transition-all',
                    isSel
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                  )}
                  onClick={() => {
                    if (obj.isFolder) { navigate(fileName); return; }
                    setSelected(s => { const n = new Set(s); n.has(obj.key) ? n.delete(obj.key) : n.add(obj.key); return n; });
                  }}
                  onDoubleClick={() => !obj.isFolder && handleDownload(obj.key)}
                >
                  <div className="h-12 flex items-center justify-center mb-2 rounded-lg bg-muted">
                    {obj.isFolder
                      ? <Folder size={22} className="text-primary" />
                      : <File size={22} className="text-muted-foreground" />}
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{fileName}</p>
                  <p className="text-[10.5px] text-muted-foreground">{obj.isFolder ? '—' : fmtBytes(obj.size)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_120px_120px_40px] gap-3 px-4 py-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Nombre</span><span>Tipo</span><span>Tamaño</span><span>Modificado</span><span />
            </div>
            {filtered.map((obj, i) => {
              const fileName = obj.key.split('/').filter(Boolean).pop() || obj.key;
              const isSel = selected.has(obj.key);
              const ext = obj.key.split('.').pop()?.toUpperCase() || '—';
              return (
                <div
                  key={obj.key}
                  className={cn(
                    'grid grid-cols-[1fr_80px_120px_120px_40px] gap-3 items-center px-4 py-2.5 cursor-pointer transition-colors text-sm',
                    i > 0 && 'border-t border-border',
                    isSel ? 'bg-primary/10' : 'hover:bg-muted/50'
                  )}
                  onClick={() => {
                    if (obj.isFolder) { navigate(fileName); return; }
                    setSelected(s => { const n = new Set(s); n.has(obj.key) ? n.delete(obj.key) : n.add(obj.key); return n; });
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {obj.isFolder
                      ? <Folder size={14} className="text-primary shrink-0" />
                      : <File size={14} className="text-muted-foreground shrink-0" />}
                    <span className="text-foreground truncate">{fileName}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{obj.isFolder ? 'FOLDER' : ext}</span>
                  <span className="font-mono text-xs text-muted-foreground">{obj.isFolder ? '—' : fmtBytes(obj.size)}</span>
                  <span className="text-xs text-muted-foreground">{fmtDate(obj.lastModified)}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDownload(obj.key); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Download size={12} />
                  </button>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
