'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, StorageObject } from '@/lib/api';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

type Layout = 'grid' | 'list';
type Filter = 'all' | 'image' | 'video' | 'audio' | 'code';

const EXT_MAP: Record<string, Filter> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio',
  ts: 'code', tsx: 'code', js: 'code', jsx: 'code', py: 'code', go: 'code', rs: 'code',
};

function getKind(key: string): Filter {
  return EXT_MAP[key.split('.').pop()?.toLowerCase() || ''] || 'all';
}

export function useBucketObjects(bucketName: string, providerId: string, initialPrefix = '') {
  const qc = useQueryClient();
  const [path, setPath] = useState<string[]>([]);
  const [layout, setLayout] = useState<Layout>('grid');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInput = useRef<HTMLInputElement>(null);

  const prefix = path.join('/') + (path.length > 0 ? '/' : '');

  const query = useQuery({
    queryKey: ['objects', bucketName, providerId, prefix],
    queryFn: () => api.objects.list(bucketName, providerId, prefix),
    enabled: !!providerId,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.objects.upload(bucketName, providerId, files, prefix),
    onSuccess: () => {
      toast.success('Archivos subidos');
      qc.invalidateQueries({ queryKey: ['objects', bucketName, providerId, prefix] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (keys: string[]) => api.objects.delete(bucketName, providerId, keys),
    onSuccess: () => {
      toast.success('Eliminados');
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['objects', bucketName, providerId, prefix] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (query.data ?? []).filter((o: StorageObject) => {
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
      const { url } = await api.objects.presignedUrl(bucketName, key, providerId);
      window.open(url, '_blank');
    } catch (e: any) { toast.error(e.message); }
  };

  return {
    objects: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    path,
    setPath,
    navigate,
    back,
    layout,
    setLayout,
    filter,
    setFilter,
    search,
    setSearch,
    selected,
    setSelected,
    fileInput,
    handleFiles,
    handleDownload,
    uploadMutation,
    deleteMutation,
    filtered,
  };
}
