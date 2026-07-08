export { useURLStore } from './url';
export { useBrowserStore } from './browser';
export { usePreviewStore } from './preview';
export { useActionsStore } from './actions';

import { StorageObject } from '@/lib/api';

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

export function filteredObjects(objects: StorageObject[], search: string, filter: Filter): StorageObject[] {
  return objects.filter(o => {
    if (!o.key) return false;
    if (search && !o.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && !o.isFolder && getKind(o.key) !== filter) return false;
    return true;
  });
}
